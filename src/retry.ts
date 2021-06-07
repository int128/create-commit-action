import * as core from '@actions/core'
import { RequestError } from '@octokit/request-error'

interface RetrySpec {
  condition: (error: RequestError) => boolean
  maxAttempts: number
  minDelayMillisecond: number
  maxDelayMillisecond: number
}

export const retry = async <T>(spec: RetrySpec, f: () => Promise<T>): Promise<T> => {
  if (spec.maxAttempts < 1) {
    return await f()
  }

  try {
    return await f()
  } catch (error) {
    if (!(error instanceof RequestError)) {
      throw error
    }
    if (!spec.condition(error)) {
      throw error
    }

    const wait = Math.random() * (spec.maxDelayMillisecond - spec.minDelayMillisecond) + spec.minDelayMillisecond
    core.warning(`http status ${error.status} ${error.message}, retry after ${wait} ms`)
    await new Promise((resolve) => setTimeout(resolve, wait))
    return await retry({ ...spec, maxAttempts: spec.maxAttempts - 1 }, f)
  }
}
