import { describe, it, expect } from 'vitest'
import { parseCSV, parseBatchText, generateFilename } from '@/utils/bulk'

describe('Bulk Utilities', () => {
  describe('parseCSV', () => {
    it('should parse CSV with headers', () => {
      const result = parseCSV('url,name\nhttps://example.com,Test')
      expect(result.headers).toEqual(['url', 'name'])
      expect(result.rows).toEqual([{ url: 'https://example.com', name: 'Test' }])
    })

    it('should parse multiple rows', () => {
      const csv = 'url,name\nhttps://a.com,First\nhttps://b.com,Second'
      const result = parseCSV(csv)
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0].url).toBe('https://a.com')
      expect(result.rows[1].url).toBe('https://b.com')
    })

    it('should handle empty CSV', () => {
      const result = parseCSV('')
      expect(result.rows).toHaveLength(0)
    })

    it('should handle CSV with only headers', () => {
      const result = parseCSV('url,name')
      expect(result.headers).toEqual(['url', 'name'])
      expect(result.rows).toHaveLength(0)
    })

    it('should handle quoted values with commas', () => {
      const csv = 'url,name\nhttps://example.com,"Doe, John"'
      const result = parseCSV(csv)
      expect(result.rows[0].name).toBe('Doe, John')
    })
  })

  describe('parseBatchText', () => {
    it('should split by newlines', () => {
      expect(parseBatchText('line1\nline2\nline3')).toEqual(['line1', 'line2', 'line3'])
    })

    it('should skip empty lines', () => {
      expect(parseBatchText('line1\n\nline3')).toEqual(['line1', 'line3'])
    })

    it('should trim whitespace', () => {
      expect(parseBatchText('  line1  \n  line2  ')).toEqual(['line1', 'line2'])
    })

    it('should return empty array for empty input', () => {
      expect(parseBatchText('')).toEqual([])
    })

    it('should handle single line', () => {
      expect(parseBatchText('single')).toEqual(['single'])
    })

    it('should handle Windows line endings', () => {
      expect(parseBatchText('line1\r\nline2')).toEqual(['line1', 'line2'])
    })
  })

  describe('generateFilename', () => {
    it('should generate sequential filename', () => {
      expect(generateFilename(0, 'https://example.com', 'sequential')).toBe('qr-001.png')
    })

    it('should generate sequential filename with correct padding', () => {
      expect(generateFilename(9, 'anything', 'sequential')).toBe('qr-010.png')
      expect(generateFilename(99, 'anything', 'sequential')).toBe('qr-100.png')
    })

    it('should generate content-based filename', () => {
      const name = generateFilename(0, 'https://example.com', 'content')
      expect(name).toMatch(/\.png$/)
      expect(name).not.toBe('qr-001.png')
    })

    it('should generate unique content-based filenames for different URLs', () => {
      const name1 = generateFilename(0, 'https://a.com', 'content')
      const name2 = generateFilename(0, 'https://b.com', 'content')
      expect(name1).not.toBe(name2)
    })
  })
})
