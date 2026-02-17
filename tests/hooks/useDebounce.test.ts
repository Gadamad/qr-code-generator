import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('should not update value before delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    rerender({ value: 'updated', delay: 300 })
    expect(result.current).toBe('initial')
  })

  it('should update value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    rerender({ value: 'updated', delay: 300 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('updated')
  })

  it('should only emit final value on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    )

    rerender({ value: 'b', delay: 300 })
    act(() => { vi.advanceTimersByTime(100) })

    rerender({ value: 'c', delay: 300 })
    act(() => { vi.advanceTimersByTime(100) })

    rerender({ value: 'd', delay: 300 })
    act(() => { vi.advanceTimersByTime(100) })

    // Not enough total time for any debounce to fire since last change
    expect(result.current).toBe('a')

    // Now wait for the full delay after the last change
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('d')
  })

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    rerender({ value: 'updated', delay: 500 })

    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('initial')

    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe('updated')
  })

  it('should work with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    )

    rerender({ value: 42, delay: 300 })
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe(42)
  })

  it('should work with object values', () => {
    const obj1 = { key: 'a' }
    const obj2 = { key: 'b' }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: obj1, delay: 300 } }
    )

    rerender({ value: obj2, delay: 300 })
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toEqual({ key: 'b' })
  })
})
