import { describe, it, expect } from 'vitest'
import { getContrastRatio, isContrastSufficient } from '@/utils/contrast'

describe('Color Contrast Utilities', () => {
  describe('getContrastRatio', () => {
    it('should return ~21 for black on white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff')
      expect(ratio).toBeCloseTo(21, 0)
    })

    it('should return 1 for same colors', () => {
      expect(getContrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 1)
    })

    it('should return 1 for black on black', () => {
      expect(getContrastRatio('#000000', '#000000')).toBeCloseTo(1, 1)
    })

    it('should be symmetric (order should not matter)', () => {
      const ratio1 = getContrastRatio('#000000', '#ffffff')
      const ratio2 = getContrastRatio('#ffffff', '#000000')
      expect(ratio1).toBeCloseTo(ratio2, 2)
    })

    it('should return moderate ratio for gray on white', () => {
      const ratio = getContrastRatio('#808080', '#ffffff')
      expect(ratio).toBeGreaterThan(1)
      expect(ratio).toBeLessThan(21)
    })

    it('should handle 3-digit hex colors', () => {
      const ratio = getContrastRatio('#000', '#fff')
      expect(ratio).toBeCloseTo(21, 0)
    })
  })

  describe('isContrastSufficient', () => {
    it('should return true for black on white (high contrast)', () => {
      expect(isContrastSufficient('#000000', '#ffffff')).toBe(true)
    })

    it('should return false for light gray on white (low contrast)', () => {
      // #cccccc on white has ratio ~1.6 — below default 3.0
      expect(isContrastSufficient('#cccccc', '#ffffff')).toBe(false)
    })

    it('should return true for dark gray on white with explicit threshold', () => {
      // #333333 on white has ratio ~12.6 — well above 3.0
      expect(isContrastSufficient('#333333', '#ffffff', 3.0)).toBe(true)
    })

    it('should use default threshold of 3.0', () => {
      // #808080 on white has ratio ~3.95 — above 3.0
      expect(isContrastSufficient('#808080', '#ffffff')).toBe(true)
      // #999999 on white has ratio ~2.85 — below 3.0
      expect(isContrastSufficient('#999999', '#ffffff')).toBe(false)
    })

    it('should return false when colors are identical', () => {
      // Ratio is 1 — below any threshold
      expect(isContrastSufficient('#ff0000', '#ff0000')).toBe(false)
    })

    it('should respect custom higher threshold', () => {
      // #808080 on white (~3.95) passes at 3.0 but fails at 4.5
      expect(isContrastSufficient('#808080', '#ffffff', 3.0)).toBe(true)
      expect(isContrastSufficient('#808080', '#ffffff', 4.5)).toBe(false)
    })
  })
})
