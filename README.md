# Elasticsearch Search UI Components
Searchkit is an open source library which helps you build a great search experience with **Elasticsearch**.
Works with Javascript, React, Vue, Angular, and more.


[![npm version](https://badge.fury.io/js/searchkit.svg)](https://badge.fury.io/js/searchkit)  ![Discord Shield](https://discordapp.com/api/guilds/778278262304276521/widget.png?style=shield) [![](https://data.jsdelivr.com/v1/package/npm/searchkit/badge)](https://www.jsdelivr.com/package/npm/searchkit)


[Website](https://www.searchkit.co/) | [Demos](https://www.searchkit.co/demos) | [Documentation](https://www.searchkit.co/docs/getting-started) | [Discord](https://discord.gg/CRuWmSQZQx)

![Alt Text](apps/web/public/overview.gif)

Searchkit provides a Search UI for Elasticsearch or OpenSearch. With Searchkit, you can use InstantSearch components like Searchbox, refinement filters and results (and many more!) to build a search experience.

Searchkit is great for anyone who want to build a search experience quickly.

**Searchkit simplifies Search UI with Elasticsearch or OpenSearch:**
  - UI Search Components for React, Vue, Angular, and more
  - Searchkit Node API proxies Elasticsearch requests from the browser
  - Ability to use Elasticsearch Query DSL for advanced queries

## Searchkit AI Bot

[Searchkit](https://codeparrot.ai/oracle?owner=searchkit&repo=searchkit) Bot will help you understand this repository better. You can ask for code examples, installation guide, debugging help and much more.


## Demos
* [Movies Search](https://www.searchkit.co/demo)
* [Semantic Search](https://codesandbox.io/p/sandbox/github/searchkit/searchkit/tree/main/examples/with-semantic-search-nextjs)
* [Geo Search](https://www.searchkit.co/geo-search-demo)
* [Camp Availability Search](https://www.searchkit.co/camping-sites-demo)
* [Autocomplete](https://www.searchkit.co/autocomplete)

## Quick Start Guides
* [Searchkit with Javascript](https://www.searchkit.co/docs/getting-started/with-javascript)
* [Searchkit with React](https://www.searchkit.co/docs/getting-started/with-react)
* [Searchkit with Vue](https://www.searchkit.co/docs/getting-started/with-vue)
* [Searchkit with Angular](https://www.searchkit.co/docs/getting-started/with-angular)

## Tutorials
* [Searchkit with Next.js](https://www.searchkit.co/tutorials/with-nextjs)
* [Semantic Search](https://www.searchkit.co/tutorials/semantic-search)
* [Searchkit with Availability Search](https://www.searchkit.co/tutorials/build-availability-search-ui)

## Codesandbox Examples
* [Searchkit with JS Widgets](https://codesandbox.io/s/github/searchkit/searchkit/tree/main/examples/with-ui-instantsearchjs)
* [Searchkit with Vue](https://codesandbox.io/s/github/searchkit/searchkit/tree/main/examples/with-ui-vue)
* [Searchkit with Next.js](https://codesandbox.io/s/github/searchkit/searchkit/tree/main/examples/with-ui-nextjs-react)
* [Proxy with Express.js](https://codesandbox.io/s/github/searchkit/searchkit/tree/main/examples/proxy-elasticsearch/with-express-typescript-esm)

## Code Examples (on Github)
* [Searchkit with Next.JS](https://github.com/searchkit/searchkit/tree/main/examples/with-ui-nextjs-react)
* [Searchkit with Javascript](https://github.com/searchkit/searchkit/tree/main/examples/with-ui-instantsearchjs)
* [Searchkit with Vue](https://github.com/searchkit/searchkit/tree/main/examples/with-ui-vue)

## Proxy Elasticsearch Quick Starts
* [Searchkit with Next.js Functions](https://www.searchkit.co/docs/proxy-elasticsearch/with-next-js)
* [Searchkit with Cloudflare Workers](https://www.searchkit.co/docs/proxy-elasticsearch/with-cloudflare-workers)
* [Searchkit with Express.js](https://www.searchkit.co/docs/proxy-elasticsearch/with-express-js)

## Video Tutorials
* [Searchkit Intro Video Tutorial with InstantSearch.js](https://www.youtube.com/watch?v=R6iYpEuCdVs)
* [Searchkit Node API Video Tutorial](https://www.youtube.com/watch?v=8ztvn1-VZ_U)

Or checkout our [documentation](https://searchkit.co/docs) for more examples.

## Installation

Either install via yarn or npm:

```bash
yarn add searchkit @searchkit/api @searchkit/instantsearch-client`
```

```bash
npm install searchkit @searchkit/api @searchkit/instantsearch-client
```

or via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@searchkit/instantsearch-client@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/instantsearch.js@4"></script>
<script src="https://cdn.jsdelivr.net/npm/searchkit@latest"></script>
```

## Setup Elasticsearch or OpenSearch

Searchkit requires Elasticsearch 7.0 or higher or Opensearch 2.4 or higher. 

Below we are using Docker to run Elasticsearch.

```bash
docker pull docker.elastic.co/elasticsearch/elasticsearch:8.6.2
docker network create elastic
docker run --name elasticsearch --net elastic -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e http.cors.enabled=true -e "http.cors.allow-origin='*'" -e http.cors.allow-headers=X-Requested-With,X-Auth-Token,Content-Type,Content-Length,Authorization -e http.cors.allow-credentials=true -e network.publish_host=localhost -e xpack.security.enabled=false docker.elastic.co/elasticsearch/elasticsearch:8.6.2
```

Once Elasticsearch is up and running we will add an index and ingest some data:

```bash
curl --location --request PUT 'http://localhost:9200/products' \
--header 'Content-Type: application/json' \
--data-raw '{
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "description": {
        "type": "text"
      },
      "price": {
        "type": "integer"
      },
      "categories": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      }
    }
  }
}'

curl --location --request POST 'http://localhost:9200/products/_doc' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Apple iPhone 12 Pro Max",
  "description": "The iPhone 12 Pro Max is the most powerful iPhone ever. It has a 6.7-inch Super Retina XDR display, a Ceramic Shield front cover, and a triple-camera system with a LiDAR scanner. It also has a 5G connection, a 6-core CPU, and a 4-core GPU. The iPhone 12 Pro Max is available in 128GB, 256GB, and 512GB storage options.",
  "categories": ["phones", "apple"],
  "price": 800
}'
 
curl --location --request POST 'http://localhost:9200/products/_doc' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Apple iPhone 12 Pro",
  "description": "The iPhone 12 Pro is the most powerful iPhone ever. It has a 6.1-inch Super Retina XDR display, a Ceramic Shield front cover, and a triple-camera system with a LiDAR scanner. It also has a 5G connection, a 6-core CPU, and a 4-core GPU. The iPhone 12 Pro is available in 128GB, 256GB, and 512GB storage options.",
  "categories": ["phones", "apple"],
  "price": 700
}'
```

## Setup Searchkit

Searchkit is compatible with all InstantSearch frameworks. Below is an example using react-instantsearch.

```tsx
import Searchkit from "searchkit"
import Client from '@searchkit/instantsearch-client'

// import your InstantSearch components
import { InstantSearch, SearchBox, Hits, RefinementList, Pagination, RangeInput } from 'react-instantsearch';

const sk = new Searchkit({
  connection: {
    host: 'http://localhost:9200',
    // with an apiKey
    // https://www.searchkit.co/docs/guides/setup-elasticsearch#connecting-with-api-key
    // apiKey: '##########'
    // with a username/password
    // https://www.searchkit.co/docs/guides/setup-elasticsearch#connecting-with-usernamepassword
    //auth: {
    //  username: "elastic",
    //  password: "changeme"
    //}
  },
  search_settings: {
    search_attributes: [{ field: 'title', weight: 3 }, 'actors', 'plot'],
    result_attributes: ['title', 'actors', 'poster', 'plot'],
    highlight_attributes: ['title'],
    facet_attributes: [
      { attribute: 'actors', field: 'actors.keyword', type: 'string' },
      { attribute: 'imdbrating', type: 'numeric', field: 'imdbrating' }
    ]
  }
})

const searchClient = Client(sk);

const App = () => (
  <InstantSearch
    indexName="imdb_movies"
    searchClient={searchClient}
  >
    <SearchBox />
    <div className="left-panel">
      <RefinementList attribute="actors" searchable={true} limit={10} />
      <RangeInput attribute="imdbrating" />
    </div>
    <div className="right-panel">
      <Hits />
      <Pagination />
    </div>
  </InstantSearch>
}
```

Follow along with the [Getting Started](https://www.searchkit.co/docs/getting-started/with-react) guide.

## Hide Elasticsearch from the browser

The Searchkit Node API allows you to proxy requests to Elasticsearch from the browser. This is useful if you want to hide Elasticsearch from the browser, or if you want to add user permission filters to the query.

* [Searchkit with Next.js Functions](https://www.searchkit.co/docs/proxy-elasticsearch/with-next-js)
* [Searchkit with Cloudflare Workers](https://www.searchkit.co/docs/proxy-elasticsearch/with-cloudflare-workers)
* [Searchkit with Express.js](https://www.searchkit.co/docs/proxy-elasticsearch/with-express-js)

## Query Customisation

Searchkit has an out the box query builder, but you can also customise the query by passing a `getQuery` function to the `apiClient`.

```ts
const results = await apiClient.handleRequest(req.body, {
  getQuery: (query, search_attributes) => {
    return [
      {
        combined_fields: {
          query,
          fields: search_attributes,
        },
      },
    ];
  },
});
```

### Semantic Query Search

Searchkit supports KNN query search. Below is an example of a KNN query search.

```ts
  const results = await client.handleRequest(req.body, {
    getKnnQuery(query, search_attributes, config) {
      return {
        field: 'dense-vector-field',
        k: 10,
        num_candidates: 100,
        // supported in latest version of Elasticsearch
        query_vector_builder: { 
          text_embedding: {
            model_id: 'cookie_model',
            model_text: query
          }
        }
      }
    }
  });
  ```

Follow along with the [Semantic Search](https://www.searchkit.co/tutorials/semantic-search) tutorial.

### Advanced Customisation

You can also override the entire query with request hooks. Below is an example of a request hook that adds a rescore query to the first search request.

You can apply this at `beforeSearch` and `afterSearch`.

```ts
  const results = await client.handleRequest(req.body, {
    hooks: {
      beforeSearch: (searchRequests) => {
        const uiRequest = searchRequests[0]
 
        return [
          {
            ...uiRequest,
            body: {
              ...uiRequest.body,
              rescore: {
                window_size: 100,
                query: {
                  rescore_query: {
                    match: {
                      plot: {
                        query: uiRequest.body.query,
                        operator: "and",
                      },
                    },
                  },
                  query_weight: 1,
                  rescore_query_weight: 10,
                }
              }
            }
          },
          searchRequests.slice(1, searchRequests.length)
        ]
        
      },
    }
  });
  ```

Read more in the [api docs](https://www.searchkit.co/docs/api-documentation/searchkit#requestoptions-hooks).

## Query Rules

Query rules allows you to customize the behavior of the search experience. You can use query rules to boost or filter results, or to change the ranking of results, based on a set of conditions.

Below is an example of a query rule that boosts results for movies with Dan Aykroyd or Charlie Sheen, and filters results to only show movies if the query is the word "movie".

```js

{
  id: '1',
  conditions: [
    [
      {
        context: 'query',
        value: 'movie',
        match_type: 'exact'
      }
    ]
  ],
  actions: [
    {
      action: 'QueryBoost',
      query: 'actors:"Dan Aykroyd" OR actors:"Charlie Sheen"',
      weight: 2
    },
    {
      action: 'QueryFilter',
      query: 'type:"movie"'
    }
  ]
}

```

Read more in the [Query Rules docs](https://www.searchkit.co/docs/query-rules).

### NPM Packages
* Searchkit [Documentation](https://www.searchkit.co/docs/api-documentation/searchkit)
* @searchkit/api [Documentation](https://www.searchkit.co/docs/api-documentation/api)
* @searchkit/instantsearch-client [Documentation](https://www.searchkit.co/docs/api-documentation/instantsearch-client)

## FAQ

**Q: Do I need to expose Elasticsearch to the public internet?**

Searchkit proxies requests to Elasticsearch.

Searchkit allows you to either perform the search directly from the browser, or use the Searchkit API to proxy requests to Elasticsearch. Directly from the browser offers a great developer experience & faster prototyping. Once you are ready to deploy, you can use the Searchkit API to proxy requests to Elasticsearch.

**Q: Do I need to use React?**

You can use React, React Native, Vue, or Angular. You don't even need to use a frontend framework, you can use plain Javascript and HTML with instantsearch.js widgets.

**Q: Which versions of Elasticsearch and OpenSearch are supported?**

Searchkit is compatible with Elasticsearch 7.0 and above as well as OpenSearch 2.0 and above.

**Q: Do you support Android and iOS?**

Potentially. The Searchkit API mimics the Algolia API, so it should be possible to use the Algolia Instantsearch client with the Searchkit API with a few tweaks. If you are interested in this, please let us know.

**Q: Why would I use Searchkit instead of Algolia?**

Elasticsearch has a lot of advantages over Algolia. You might want to use Elasticsearch as a cheaper alternative to Algolia, especially if you have a large dataset. You might want to run Elasticsearch on your own infrastructure, or have greater control over the query relevance. 
