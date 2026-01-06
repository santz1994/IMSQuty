import React, { useCallback, useMemo } from 'react'

/**
 * Hook to memoize computed values with automatic dependency tracking
 * Use when expensive computations depend on frequently-changing props
 */
export const useSmartMemo = <T,>(factory: () => T, deps: React.DependencyList) => {
  return useMemo(factory, deps)
}

/**
 * Hook to memoize callbacks
 * Use to prevent child re-renders from parent state changes
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps) as T
}

/**
 * Debounce hook for search, filter, and resize handlers
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle hook for scroll, resize, and rapid events
 */
export const useThrottle = <T,>(value: T, interval: number): T => {
  const [throttledValue, setThrottledValue] = React.useState(value)
  const lastUpdated = React.useRef<number>(Date.now())

  React.useEffect(() => {
    const now = Date.now()
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    }
  }, [value, interval])

  return throttledValue
}

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) => {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [ref, options])

  return isVisible
}

/**
 * Performance monitoring hook
 * Logs render times and component lifecycle performance
 */
export const useRenderMetrics = (componentName: string) => {
  const startTime = React.useRef(performance.now())

  React.useEffect(() => {
    const renderTime = performance.now() - startTime.current
    console.log(
      `[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`
    )
  }, [componentName])
}

export default {
  useSmartMemo,
  useStableCallback,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useRenderMetrics,
}
