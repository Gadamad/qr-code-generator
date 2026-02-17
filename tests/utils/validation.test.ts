import { describe, it, expect } from 'vitest'
import {
  validateURL,
  validateEmail,
  validateSSID,
  validatePhone,
  validateCryptoAddress,
  validateCoordinates,
  validateCalendar,
} from '@/utils/validation'

describe('Validators', () => {
  describe('validateURL', () => {
    it('should accept valid HTTPS URL', () => {
      expect(validateURL('https://example.com')).toEqual({ valid: true })
    })

    it('should accept valid HTTP URL', () => {
      expect(validateURL('http://example.com')).toEqual({ valid: true })
    })

    it('should accept bare domain', () => {
      const result = validateURL('example.com')
      expect(result.valid).toBe(true)
    })

    it('should reject empty string', () => {
      const result = validateURL('')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject obviously invalid URL', () => {
      const result = validateURL('not a url !!!')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateEmail', () => {
    it('should accept valid email', () => {
      expect(validateEmail('test@example.com')).toEqual({ valid: true })
    })

    it('should accept email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toEqual({ valid: true })
    })

    it('should reject invalid email', () => {
      const result = validateEmail('invalid')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject empty string', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject email without domain', () => {
      const result = validateEmail('user@')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateSSID', () => {
    it('should accept valid SSID', () => {
      expect(validateSSID('MyNetwork')).toEqual({ valid: true })
    })

    it('should accept SSID with spaces', () => {
      expect(validateSSID('My Home WiFi')).toEqual({ valid: true })
    })

    it('should reject empty SSID', () => {
      const result = validateSSID('')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validatePhone', () => {
    it('should accept international format', () => {
      expect(validatePhone('+1234567890')).toEqual({ valid: true })
    })

    it('should accept number with country code', () => {
      expect(validatePhone('+44 7911 123456')).toEqual({ valid: true })
    })

    it('should reject empty string', () => {
      const result = validatePhone('')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject non-numeric input', () => {
      const result = validatePhone('abc')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateCryptoAddress', () => {
    it('should accept valid BTC address', () => {
      const result = validateCryptoAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'BTC')
      expect(result.valid).toBe(true)
    })

    it('should accept valid ETH address', () => {
      // ETH addresses must be 0x + 40 hex chars
      const result = validateCryptoAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08', 'ETH')
      expect(result.valid).toBe(true)
    })

    it('should reject short ETH address', () => {
      const result = validateCryptoAddress('0x742d35Cc6634', 'ETH')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject empty address', () => {
      const result = validateCryptoAddress('', 'BTC')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateCoordinates', () => {
    // validateCoordinates returns { lat: ValidationResult, lng: ValidationResult }
    it('should accept valid coordinates', () => {
      const result = validateCoordinates('40.7128', '-74.0060')
      expect(result.lat.valid).toBe(true)
      expect(result.lng.valid).toBe(true)
    })

    it('should accept boundary values', () => {
      const result1 = validateCoordinates('90', '180')
      expect(result1.lat.valid).toBe(true)
      expect(result1.lng.valid).toBe(true)

      const result2 = validateCoordinates('-90', '-180')
      expect(result2.lat.valid).toBe(true)
      expect(result2.lng.valid).toBe(true)
    })

    it('should accept zero coordinates', () => {
      const result = validateCoordinates('0', '0')
      expect(result.lat.valid).toBe(true)
      expect(result.lng.valid).toBe(true)
    })

    it('should reject latitude > 90', () => {
      const result = validateCoordinates('91', '0')
      expect(result.lat.valid).toBe(false)
      expect(result.lat.error).toBeDefined()
    })

    it('should reject latitude < -90', () => {
      const result = validateCoordinates('-91', '0')
      expect(result.lat.valid).toBe(false)
      expect(result.lat.error).toBeDefined()
    })

    it('should reject longitude > 180', () => {
      const result = validateCoordinates('0', '181')
      expect(result.lng.valid).toBe(false)
      expect(result.lng.error).toBeDefined()
    })

    it('should reject longitude < -180', () => {
      const result = validateCoordinates('0', '-181')
      expect(result.lng.valid).toBe(false)
      expect(result.lng.error).toBeDefined()
    })

    it('should reject non-numeric latitude', () => {
      const result = validateCoordinates('abc', '0')
      expect(result.lat.valid).toBe(false)
      expect(result.lat.error).toBeDefined()
    })

    it('should reject empty values', () => {
      const result = validateCoordinates('', '')
      expect(result.lat.valid).toBe(false)
      expect(result.lat.error).toBeDefined()
      expect(result.lng.valid).toBe(false)
      expect(result.lng.error).toBeDefined()
    })
  })

  describe('validateCalendar', () => {
    const validEvent = {
      title: 'Meeting',
      startDate: '2026-03-01',
      startTime: '10:00',
      endDate: '2026-03-01',
      endTime: '11:00',
    }

    // validateCalendar returns { valid: boolean, errors: string[] }
    it('should accept valid calendar event', () => {
      const result = validateCalendar(validEvent)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty title', () => {
      const result = validateCalendar({ ...validEvent, title: '' })
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject missing start date', () => {
      const result = validateCalendar({ ...validEvent, startDate: '' })
      expect(result.valid).toBe(false)
    })

    it('should reject missing start time', () => {
      const result = validateCalendar({ ...validEvent, startTime: '' })
      expect(result.valid).toBe(false)
    })

    it('should reject missing end date', () => {
      const result = validateCalendar({ ...validEvent, endDate: '' })
      expect(result.valid).toBe(false)
    })

    it('should reject missing end time', () => {
      const result = validateCalendar({ ...validEvent, endTime: '' })
      expect(result.valid).toBe(false)
    })

    it('should reject end before start', () => {
      const result = validateCalendar({
        ...validEvent,
        endDate: '2026-02-28',
        endTime: '09:00',
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('End must be after start')
    })
  })
})
