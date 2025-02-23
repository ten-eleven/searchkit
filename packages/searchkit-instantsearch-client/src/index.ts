import type { MultipleQueriesQuery, RequestOptions } from 'searchkit'
import type Searchkit from 'searchkit'

interface InstantSearchElasticsearchAdapterConfig {
  url: string
  headers?: Record<string, string> | (() => Record<string, string>)
}

type Config = InstantSearchElasticsearchAdapterConfig | Searchkit

function isSearchkit(config: Config): config is Searchkit {
  return (config as Searchkit).handleInstantSearchRequests !== undefined
}

class InstantSearchElasticsearchAdapter {
  private cache: Record<string, any>

  constructor(private config: Config, private requestOptions?: RequestOptions) {
    this.cache = []
    if (!isSearchkit(this.config) && !this.config.url) {
      throw new Error('Searchkit Instantsearch Client: url is required')
    }
    if (!isSearchkit(this.config) && this.requestOptions) {
      throw new Error(
        'Searchkit Instantsearch Client: requestOptions is not supported when used with url. Add the request options to @searchkit/api instead.'
      )
    }
  }

  public clearCache(): Promise<void> {
    this.cache = []
    return Promise.resolve(undefined)
  }

  private getHeaders(): Record<string, string> {
    let headers = {}
    if (!isSearchkit(this.config) && this.config.headers) {
      headers =
        typeof this.config.headers === 'function' ? this.config.headers() : this.config.headers
    }
    return headers
  }

  public async search(instantsearchRequests: readonly MultipleQueriesQuery[]): Promise<any> {
    const key = JSON.stringify(instantsearchRequests)
    const cacheValue = this.cache[key]
    if (cacheValue) {
      return cacheValue
    }

    if (isSearchkit(this.config)) {
      const results = await this.config.handleInstantSearchRequests(
        instantsearchRequests,
        this.requestOptions
      )
      this.cache[key] = results
      return results
    }

    const response = await fetch(this.config.url, {
      body: JSON.stringify(instantsearchRequests),
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders()
      },
      method: 'POST'
    })

    const results = await response.json()
    this.cache[key] = results
    return results
  }

  public async searchForFacetValues(
    instantsearchRequests: readonly MultipleQueriesQuery[]
  ): Promise<any> {
    const isr = instantsearchRequests.map<MultipleQueriesQuery>((request) => {
      return {
        ...request,
        params: {
          ...request.params,
          hitsPerPage: 0
        }
      }
    })

    try {
      if (isSearchkit(this.config)) {
        const results = await this.config.handleInstantSearchRequests(isr)
        return results.results
      }

      const response = await fetch(this.config.url, {
        body: JSON.stringify(isr),
        headers: {
          'Content-Type': 'application/json',
          ...this.getHeaders()
        },
        method: 'POST'
      })

      const results = await response.json()
      return results.results
    } catch (e) {
      console.error(e)
      return []
    }
  }
}

const createClient = (config: Config, requestOptions?: RequestOptions) : any =>
  new InstantSearchElasticsearchAdapter(config, requestOptions)

export default createClient
