import { describe, it, expect } from 'vitest'
import {
  formatURL,
  formatText,
  formatWiFi,
  formatVCard,
  formatEmail,
  formatSMS,
  formatWhatsApp,
  formatCrypto,
  formatCalendar,
  formatGeo,
} from '@/utils/payloads'

describe('Payload Formatters', () => {
  describe('formatURL', () => {
    it('should prepend https:// to bare domain', () => {
      expect(formatURL('example.com')).toBe('https://example.com')
    })

    it('should not double-prepend https://', () => {
      expect(formatURL('https://example.com')).toBe('https://example.com')
    })

    it('should preserve http://', () => {
      expect(formatURL('http://example.com')).toBe('http://example.com')
    })

    it('should handle URLs with paths', () => {
      expect(formatURL('example.com/path?q=1')).toBe('https://example.com/path?q=1')
    })
  })

  describe('formatText', () => {
    it('should return the text as-is', () => {
      expect(formatText('Hello World')).toBe('Hello World')
    })

    it('should handle empty string', () => {
      expect(formatText('')).toBe('')
    })

    it('should handle special characters', () => {
      expect(formatText('Hello & goodbye <world>')).toBe('Hello & goodbye <world>')
    })
  })

  describe('formatWiFi', () => {
    it('should format WPA network correctly', () => {
      const result = formatWiFi('MyNetwork', 'pass123', 'WPA', false)
      expect(result).toBe('WIFI:T:WPA;S:MyNetwork;P:pass123;H:false;;')
    })

    it('should format hidden network with no password', () => {
      const result = formatWiFi('Hidden', '', 'nopass', true)
      expect(result).toBe('WIFI:T:nopass;S:Hidden;P:;H:true;;')
    })

    it('should format WEP network', () => {
      const result = formatWiFi('OldNet', 'wepkey', 'WEP', false)
      expect(result).toBe('WIFI:T:WEP;S:OldNet;P:wepkey;H:false;;')
    })

    it('should escape special characters in SSID', () => {
      const result = formatWiFi('My "Network"', 'pass', 'WPA', false)
      // Implementation escapes quotes with backslash
      expect(result).toContain('S:My \\"Network\\"')
    })
  })

  describe('formatVCard', () => {
    it('should format a full vCard', () => {
      const result = formatVCard({
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        email: 'john@example.com',
      })
      expect(result).toContain('BEGIN:VCARD')
      expect(result).toContain('VERSION:3.0')
      expect(result).toContain('N:Doe;John')
      expect(result).toContain('FN:John Doe')
      expect(result).toContain('TEL:+1234567890')
      expect(result).toContain('EMAIL:john@example.com')
      expect(result).toContain('END:VCARD')
    })

    it('should handle missing optional fields', () => {
      const result = formatVCard({
        firstName: 'Jane',
        lastName: 'Smith',
      })
      expect(result).toContain('BEGIN:VCARD')
      expect(result).toContain('N:Smith;Jane')
      expect(result).toContain('FN:Jane Smith')
      expect(result).toContain('END:VCARD')
    })

    it('should include organization when provided', () => {
      const result = formatVCard({
        firstName: 'John',
        lastName: 'Doe',
        organization: 'Acme Corp',
      })
      expect(result).toContain('ORG:Acme Corp')
    })
  })

  describe('formatEmail', () => {
    it('should format email with subject and body', () => {
      const result = formatEmail('test@example.com', 'Hello', 'Body text')
      expect(result).toBe('mailto:test@example.com?subject=Hello&body=Body%20text')
    })

    it('should format email without subject or body', () => {
      expect(formatEmail('test@example.com')).toBe('mailto:test@example.com')
    })

    it('should format email with only subject', () => {
      const result = formatEmail('test@example.com', 'Hello')
      expect(result).toBe('mailto:test@example.com?subject=Hello')
    })

    it('should encode special characters in subject and body', () => {
      const result = formatEmail('test@example.com', 'Hello & World', 'Line 1\nLine 2')
      expect(result).toContain('subject=Hello%20%26%20World')
    })
  })

  describe('formatSMS', () => {
    it('should format SMS with message', () => {
      expect(formatSMS('+1234567890', 'Hello')).toBe('sms:+1234567890?body=Hello')
    })

    it('should format SMS without message', () => {
      expect(formatSMS('+1234567890')).toBe('sms:+1234567890')
    })

    it('should encode special characters in body', () => {
      const result = formatSMS('+1234567890', 'Hello World')
      expect(result).toContain('body=Hello')
    })
  })

  describe('formatWhatsApp', () => {
    it('should format WhatsApp link with message', () => {
      expect(formatWhatsApp('1234567890', 'Hello')).toBe('https://wa.me/1234567890?text=Hello')
    })

    it('should format WhatsApp link without message', () => {
      const result = formatWhatsApp('1234567890')
      expect(result).toBe('https://wa.me/1234567890')
    })

    it('should strip non-numeric characters from phone', () => {
      const result = formatWhatsApp('+1 (234) 567-890', 'Hi')
      expect(result).toContain('wa.me/1234567890')
    })
  })

  describe('formatCrypto', () => {
    it('should format Bitcoin URI with amount and label', () => {
      const result = formatCrypto({
        coin: 'BTC',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        amount: '0.5',
        label: 'Donation',
      })
      expect(result).toBe('bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.5&label=Donation')
    })

    it('should format Ethereum URI', () => {
      const result = formatCrypto({
        coin: 'ETH',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD',
        amount: '1.0',
      })
      expect(result).toBe('ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f2bD?value=1.0')
    })

    it('should format Litecoin URI', () => {
      const result = formatCrypto({
        coin: 'LTC',
        address: 'LcHKx4Tq7rN9bE9eZwfNPCde1vXkpAi8Bz',
        amount: '10',
      })
      expect(result).toBe('litecoin:LcHKx4Tq7rN9bE9eZwfNPCde1vXkpAi8Bz?amount=10')
    })

    it('should format crypto URI without amount', () => {
      const result = formatCrypto({
        coin: 'BTC',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      })
      expect(result).toBe('bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
    })
  })

  describe('formatCalendar', () => {
    it('should format a calendar event', () => {
      const result = formatCalendar({
        title: 'Meeting',
        startDate: '2026-03-01',
        startTime: '10:00',
        endDate: '2026-03-01',
        endTime: '11:00',
      })
      expect(result).toContain('BEGIN:VEVENT')
      expect(result).toContain('SUMMARY:Meeting')
      expect(result).toContain('DTSTART:')
      expect(result).toContain('DTEND:')
      expect(result).toContain('END:VEVENT')
    })

    it('should include location when provided', () => {
      const result = formatCalendar({
        title: 'Lunch',
        startDate: '2026-03-01',
        startTime: '12:00',
        endDate: '2026-03-01',
        endTime: '13:00',
        location: 'Downtown Cafe',
      })
      expect(result).toContain('LOCATION:Downtown Cafe')
    })

    it('should include description when provided', () => {
      const result = formatCalendar({
        title: 'Review',
        startDate: '2026-03-01',
        startTime: '14:00',
        endDate: '2026-03-01',
        endTime: '15:00',
        description: 'Quarterly review',
      })
      expect(result).toContain('DESCRIPTION:Quarterly review')
    })
  })

  describe('formatGeo', () => {
    it('should format geo URI', () => {
      expect(formatGeo('40.7128', '-74.0060')).toBe('geo:40.7128,-74.0060')
    })

    it('should handle integer coordinates', () => {
      expect(formatGeo('0', '0')).toBe('geo:0,0')
    })

    it('should handle negative coordinates', () => {
      expect(formatGeo('-33.8688', '151.2093')).toBe('geo:-33.8688,151.2093')
    })
  })
})
