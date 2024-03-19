import { RequestError, retry } from '../src/retry'
import { Octokit } from '@octokit/action'
import { MockServer } from './server'

describe('retry', () => {
  const mockServer = new MockServer()
  beforeAll(() => mockServer.listen())
  afterAll(() => mockServer.close())

  const condition = (error: RequestError): boolean => error.status === 422

  test('no error then no retry', async () => {
    mockServer.handler.mockReturnValueOnce(200)
    const octokit = new Octokit({ authStrategy: null, baseUrl: mockServer.baseUrl() })
    const f = async () => await octokit.request('GET /')
    await retry({ condition, maxDelayMillisecond: 0, minDelayMillisecond: 0, maxAttempts: 1 }, f)
    expect(mockServer.handler).toHaveBeenCalledTimes(1)
  })

  test('retry recovers first error', async () => {
    mockServer.handler.mockReturnValueOnce(422)
    mockServer.handler.mockReturnValueOnce(200)
    const octokit = new Octokit({ authStrategy: null, baseUrl: mockServer.baseUrl() })
    const f = async () => await octokit.request('GET /')
    await retry({ condition, maxDelayMillisecond: 0, minDelayMillisecond: 0, maxAttempts: 2 }, f)
    expect(mockServer.handler).toHaveBeenCalledTimes(2)
  })

  test('retry does not handle if condition is not satisfied', async () => {
    mockServer.handler.mockReturnValueOnce(400)
    const octokit = new Octokit({ authStrategy: null, baseUrl: mockServer.baseUrl() })
    const f = async () => await octokit.request('GET /')
    const r = retry({ condition, maxDelayMillisecond: 0, minDelayMillisecond: 0, maxAttempts: 2 }, f)
    await expect(r).rejects.toThrow()
    expect(mockServer.handler).toHaveBeenCalledTimes(1)
  })
})
