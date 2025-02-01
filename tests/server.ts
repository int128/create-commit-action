import assert from 'assert'
import * as http from 'http'
import { vi } from 'vitest'

export class MockServer {
  readonly handler

  private readonly server: http.Server

  constructor() {
    this.handler = vi.fn()
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
