import * as core from '@actions/core'

type RetrySpec = {
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
    if (!isRequestError(error)) {
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

export type RequestError = Error & { status: number }

const isRequestError = (error: unknown): error is RequestError =>
  error instanceof Error && 'status' in error && typeof error.status === 'number'
