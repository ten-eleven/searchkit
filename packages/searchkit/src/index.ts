import type { MultipleQueriesQuery as AlgoliaMultipleQueriesQuery } from '@algolia/client-search'
import { transformRequest } from './transformRequest'
import transformResponse, { transformFacetValuesResponse } from './transformResponse'
import { SearchkitConfig, SearchRequest, RequestOptions, Transporter, AppSettings } from './types'
import { ESTransporter } from './Transporter'
import { getQueryRulesActionsFromRequest, QueryRuleActions } from './queryRules'
import { createElasticsearchQueryFromRequest } from './utils'
import { getIndexName } from './sorting'
export * from './types'
export * from './Transporter'
export * from './filterUtils'

export default class Searchkit {
  private transporter: Transporter

  constructor(private config: SearchkitConfig, private settings: AppSettings = { debug: false }) {
    this.transporter =
      'msearch' in config.connection
        ? config.connection
        : new ESTransporter(config.connection, settings)
  }

  private async performSearch(requests: SearchRequest[]) {
    if (this.settings.debug) {
      console.log('Performing search with requests:')
      console.log('POST /_msearch')
      console.log(createElasticsearchQueryFromRequest(requests))
    }
    const responses = await this.transporter.msearch(requests)
    return responses
  }

  async handleInstantSearchRequests(
    instantsearchRequests: readonly AlgoliaMultipleQueriesQuery[],
    requestOptions?: RequestOptions
  ) {
    if (!instantsearchRequests || Array.isArray(instantsearchRequests) === false) {
      console.log({ instantsearchRequests })
      throw new Error(
        'No instantsearch requests provided. Check that the data you are providing from API request is correct. Likely you are not passing the request body correctly, its still a JSON string or the API is not a POST request.'
      )
    }

    const queryRules = this.config.search_settings.query_rules || []

    const requestQueryRuleActions: QueryRuleActions[] = instantsearchRequests.map((request) => {
      return getQueryRulesActionsFromRequest(queryRules, request, this.config.search_settings)
    })

    let esRequests: SearchRequest[] = instantsearchRequests.map((request, i) => ({
      body: transformRequest(
        request,
        this.config.search_settings,
        requestQueryRuleActions[i],
        requestOptions
      ),
      request: request,
      indexName: getIndexName(request.indexName, this.config.search_settings)
    }))

    if (requestOptions?.hooks?.beforeSearch) {
      esRequests = await requestOptions.hooks.beforeSearch(esRequests)
    }

    let esResponses = await this.performSearch(esRequests)

    if (requestOptions?.hooks?.afterSearch) {
      esResponses = await requestOptions.hooks.afterSearch(esRequests, esResponses)
    }

    try {
      const instantsearchResponses = esResponses.map((response, i) => {
        // @ts-ignore
        if (instantsearchRequests[i].params?.facetName) {
          return transformFacetValuesResponse(response, instantsearchRequests[i])
        }
        return transformResponse(
          response,
          instantsearchRequests[i],
          this.config.search_settings,
          requestQueryRuleActions[i]
        )
      })

      return {
        results: instantsearchResponses
      }
    } catch (err) {
      console.error(err)
      throw new Error(
        'Error transforming response. Check the afterSearch hook function is correct. Likely you are not returning the correct response object.'
      )
    }
  }
}
