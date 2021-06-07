import { RequestError } from '@octokit/request-error'
import { retry } from '../src/retry'

describe('retry', () => {
  const someRequest = (code: number): Error =>
    new RequestError('some error', code, { request: { url: 'https://api.github.com', method: 'POST', headers: {} } })

  const condition = (error: RequestError): boolean => error.status === 422

  test('no error then no retry', async () => {
    const f = jest.fn()
    f.mockResolvedValue('something')
    await retry({ condition, maxDelayMillisecond: 0, minDelayMillisecond: 0, maxAttempts: 1 }, f)
    expect(f).toBeCalledTimes(1)
  })

  test('retry recovers first error', async () => {
    const f = jest.fn()
    f.mockRejectedValueOnce(someRequest(422))
    f.mockResolvedValueOnce('something')
    await retry({ condition, maxDelayMillisecond: 0, minDelayMillisecond: 0, maxAttempts: 2 }, f)
    expect(f).toBeCalledTimes(2)
  })

  test('retry does not handle if condition is not satisfied', async () => {
    const f = jest.fn()
    f.mockRejectedValueOnce(someRequest(400))
    const r = retry({ condition, maxDelayMillisecond: 0, minDelayMillisecond: 0, maxAttempts: 2 }, f)
    expect(r).rejects.toThrowError()
    expect(f).toBeCalledTimes(1)
  })
})
