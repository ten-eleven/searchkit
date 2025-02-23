import { AppSettings, BasicAuth, ConfigConnection, SearchRequest } from './types'
import { ElasticsearchResponseBody, Transporter } from './types'
import { createElasticsearchQueryFromRequest } from './utils'

const authString = (auth: BasicAuth) => {
  if (typeof btoa === 'undefined') {
    return Buffer.from(auth.username + ':' + auth.password).toString('base64')
  } else {
    return btoa(auth.username + ':' + auth.password)
  }
}

function getHostFromCloud(cloudId: string) {
  // the cloud id is `cluster-name:base64encodedurl`
  // the url is a string divided by two '$', the first is the cloud url
  // the second the elasticsearch instance, the third the kibana instance
  let cloudUrls
  if (typeof atob === 'undefined') {
    cloudUrls = Buffer.from(cloudId.split(':')[1], 'base64').toString()
  } else {
    cloudUrls = atob(cloudId.split(':')[1]).split('$')
  }
  return `https://${cloudUrls[1]}.${cloudUrls[0]}`
}

export class ESTransporter implements Transporter {
  constructor(public config: ConfigConnection, private settings: AppSettings) {}

  createElasticsearchQueryFromRequest(requests: SearchRequest[]) {
    return createElasticsearchQueryFromRequest(requests)
  }

  async performNetworkRequest(requests: SearchRequest[]) {
    if (this.config.host === undefined && this.config.cloud_id === undefined) {
      throw new Error(
        'No Elasticsearch host or cloud_id specified. Please provide a host or cloud id in your Searchkit configuration.'
      )
    }

    const host = this.config.cloud_id ? getHostFromCloud(this.config.cloud_id) : this.config.host

    return fetch(`${host}/_msearch`, {
      headers: {
        ...(this.config.apiKey ? { authorization: `ApiKey ${this.config.apiKey}` } : {}),
        'content-type': 'application/json',
        ...(this.config.headers || {}),
        ...(this.config.auth
          ? {
              Authorization: 'Basic ' + authString(this.config.auth)
            }
          : {})
      },
      body: this.createElasticsearchQueryFromRequest(requests),
      method: 'POST',
      ...(this.config.withCredentials ? { credentials: 'include' } : {})
    })
  }

  async msearch(requests: SearchRequest[]): Promise<ElasticsearchResponseBody[]> {
    try {
      const response = await this.performNetworkRequest(requests)
      const responses = await response.json()

      if (this.settings.debug) {
        console.log('Elasticsearch response:')
        console.log(JSON.stringify(responses))
      }

      if (responses.status >= 500) {
        console.error(
          'Elasticsearch Internal Error: Check your elasticsearch instance to make sure it can recieve requests.'
        )
        throw new Error(JSON.stringify(responses))
      } else if (responses.status === 401) {
        console.error(
          'Cannot connect to Elasticsearch. Check your connection host and auth details (username/password or API Key required). You can also provide a custom Elasticsearch transporter to the API Client. See https://www.searchkit.co/docs/guides/setup-elasticsearch#connecting-with-usernamepassword for more details.'
        )
        throw new Error(JSON.stringify(responses))
      } else if (responses.responses?.[0]?.status === 403) {
        console.error(
          'Auth Error: You do not have permission to access this index. Check you are calling the right index (specified in frontend) and your API Key permissions has access to the index.'
        )
        throw new Error(JSON.stringify(responses))
      } else if (responses.status === 404 || responses.responses?.[0]?.status === 404) {
        console.error('Elasticsearch index not found. Check your index name and make sure it exists.')
        throw new Error(JSON.stringify(responses))
      } else if (responses.status === 400 || responses.responses?.[0]?.status === 400) {
        console.error(
          `Elasticsearch Bad Request.

          1. Check your query and make sure it is valid.
          2. Check the field mapping. See documentation to make sure you are using text types for searching and keyword fields for faceting
          3. Turn on debug mode to see the Elasticsearch query and the error response.
          `
        )
        throw new Error(JSON.stringify(responses))
      }
      return responses.responses
    } catch (error) {
      throw error
    }
  }
}
