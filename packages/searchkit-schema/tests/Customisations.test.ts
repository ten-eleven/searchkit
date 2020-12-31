import nock from 'nock'
import { SearchkitConfig } from '../src/resolvers/ResultsResolver'
import { MultiMatchQuery } from '../src'
import { setupTestServer, callQuery } from './support/helper'
import HitsMock from './__mock-data__/HitResolver/Hits.json'
import UserHitsMock from './__mock-data__/HitResolver/UserHits.json'

describe('customisations', () => {
  const runQuery = async (query = '', page = { size: 10, from: 0 }, sorting?: string) => {
    const gql = `
        {
          results(query: "${query}") {
            hits(page: {size: ${page.size}, from: ${page.from}} ${
      sorting ? `, sortBy: "${sorting}"` : ''
    }) {
              sortedBy
              items {
                ... on ResultHit {
                  id
                  fields {
                    writers
                    actors
                  }
                }
              }
            }
          }
          account(id: "1") {
            id
            userResults(query: "test") {
              hits {
                items {
                  ... on UserResultHit {
                    id
                    profile {
                      name
                    }
                    fields {
                      tags
                    }
                  }
                }
              }
            }
          }
        }
      `
    const response = await callQuery({ gql })
    return response
  }

  it('should return correct Results', async () => {
    const moviesSearchConfig: SearchkitConfig = {
      host: 'http://localhost:9200',
      index: 'movies',
      hits: {
        fields: ['actors', 'writers']
      },
      query: new MultiMatchQuery({ fields: ['actors', 'writers', 'title^4', 'plot'] })
    }

    const userSearchConfig: SearchkitConfig = {
      host: 'http://localhost:9200',
      index: 'users',
      hits: {
        fields: ['name', 'tags']
      },
      query: new MultiMatchQuery({ fields: ['name', 'tags'] })
    }

    setupTestServer([
      { typeName: 'ResultSet', hitTypeName: "ResultHit", config: moviesSearchConfig, addToQueryType: true },
      { typeName: 'UserResultSet', hitTypeName: "UserResultHit", config: userSearchConfig }
    ])

    const scope = nock('http://localhost:9200')
      .post('/movies/_search')
      .reply((uri, body) => {
        expect(body).toMatchInlineSnapshot(`
            Object {
              "aggs": Object {},
              "from": 0,
              "post_filter": Object {
                "bool": Object {
                  "must": Array [],
                },
              },
              "size": 10,
              "sort": Array [
                Object {
                  "_score": "desc",
                },
              ],
            }
          `)
        return [200, HitsMock]
      })

    const scope2 = nock('http://localhost:9200')
      .post('/users/_search')
      .reply((uri, body) => {
        expect(body).toMatchInlineSnapshot(`
            Object {
              "aggs": Object {},
              "from": 0,
              "post_filter": Object {
                "bool": Object {
                  "must": Array [],
                },
              },
              "query": Object {
                "multi_match": Object {
                  "fields": Array [
                    "name",
                    "tags",
                  ],
                  "query": "test",
                },
              },
              "size": 10,
              "sort": Array [
                Object {
                  "_score": "desc",
                },
              ],
            }
          `)
        return [200, UserHitsMock]
      })

    const response = await runQuery()
    expect(response.body.data).toMatchSnapshot('userhits')
    expect(response.status).toEqual(200)
  })
})
