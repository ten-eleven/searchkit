import nock from 'nock'
import SearchkitRequest from '../src'
import ESClientAdapter from '../src/adapters/ESClientAdapter'
import { MultiMatchQuery } from '../src/query'
import HitsMMock from './__mock-data__/HitResolver/Hits.json'

describe('Hit Results', () => {
  it('Query', async () => {
    const request = SearchkitRequest(
      {
        host: 'http://localhost:9200',
        query: new MultiMatchQuery({
          fields: ['title', 'body']
        }),
        hits: {
          fields: ['facet1']
        },
        index: 'test'
      },
      ESClientAdapter
    )

    request.query('test')

    const scope = nock('http://localhost:9200')
      .post('/test/_search')
      .reply(200, (uri, body) => {
        expect(body).toMatchInlineSnapshot(`
          Object {
            "aggs": Object {},
            "from": 0,
            "query": Object {
              "bool": Object {
                "must": Array [
                  Object {
                    "multi_match": Object {
                      "fields": Array [
                        "title",
                        "body",
                      ],
                      "query": "test",
                    },
                  },
                ],
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
        expect((body as Record<string, any>).size).toBe(10)
        return HitsMMock
      })

    const response = await request.execute({
      hits: {
        size: 10
      }
    })
    expect(response).toMatchSnapshot()
    expect(response.facets).toBeFalsy()
    expect(response.summary.query).toBe('test')
    expect(response.summary.total).toBe(4162)
  })

  it('pagination - 2nd page', async () => {
    const request = SearchkitRequest(
      {
        host: 'http://localhost:9200',
        query: new MultiMatchQuery({
          fields: ['title', 'body']
        }),
        hits: {
          fields: ['facet1']
        },
        index: 'test'
      },
      ESClientAdapter
    )

    request.query('test')

    const scope = nock('http://localhost:9200')
      .post('/test/_search')
      .reply(200, (uri, body: any) => {
        expect(body.from).toBe(10)
        expect(body.size).toBe(10)
        return HitsMMock
      })

    const response = await request.execute({
      hits: {
        size: 10,
        from: 10
      }
    })
    expect(response).toMatchSnapshot()
    expect(response.facets).toBeFalsy()
    expect(response.summary.query).toBe('test')
    expect(response.summary.total).toBe(4162)
  })
})
