import assert from 'assert'
import * as http from 'http'

export class MockServer {
  readonly handler: jest.Mock<number, [string | undefined]>

  private readonly server: http.Server

  constructor() {
    this.handler = jest.fn<number, [string | undefined]>()
    this.server = http.createServer((req, res) => {
      res.statusCode = this.handler(req.url)
      res.end()
    })
  }

  listen() {
    this.server.listen()
  }

  close() {
    this.server.close()
  }

  baseUrl() {
    const address = this.server.address()
    assert(typeof address === 'object')
    assert(address !== null)
    return `http://localhost:${address.port}`
  }
}
