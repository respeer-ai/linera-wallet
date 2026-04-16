const guardRegistryKey = '__checko_runtime_guard_registry__'

type GuardRegistry = Set<string>

const registry = () => {
  const target = globalThis as typeof globalThis & {
    [guardRegistryKey]?: GuardRegistry
  }

  let current = target[guardRegistryKey]
  if (!current) {
    current = new Set<string>()
    target[guardRegistryKey] = current
  }

  return current
}

const stringifyError = (error: unknown) => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }

  if (typeof error === 'string') {
    return error
  }

  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

export const logRuntimeWarning = (scope: string, error: unknown) => {
  console.warn(`[${scope}]`, stringifyError(error))
}

export const installRuntimeGuards = (scope: string) => {
  const installed = registry()
  if (installed.has(scope)) {
    return
  }
  installed.add(scope)

  if (typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('error', (event: Event) => {
      const errorEvent = event as ErrorEvent
      logRuntimeWarning(scope, errorEvent.error || errorEvent.message)
      event.preventDefault?.()
    })

    globalThis.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      logRuntimeWarning(scope, event.reason)
      event.preventDefault?.()
    })
  }
}

export const runSafely = <T>(scope: string, action: () => T): T | undefined => {
  try {
    return action()
  } catch (error) {
    logRuntimeWarning(scope, error)
    return undefined
  }
}

export const runSafelyAsync = (scope: string, action: () => Promise<unknown>) => {
  void Promise.resolve()
    .then(action)
    .catch((error) => {
      logRuntimeWarning(scope, error)
    })
}
