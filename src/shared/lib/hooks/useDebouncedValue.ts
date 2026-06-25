import { useEffect, useState } from 'react'

/** Returns a debounced copy of `value` that only updates after `delay` ms of quiet.
 *  Use for search inputs so we don't fire a request on every keystroke. */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
