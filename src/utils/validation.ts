import type { VCardData, CalendarData } from '../types/qr';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface VCardValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validateURL(url: string): ValidationResult {
  if (!url.trim()) {
    return { valid: false, error: 'URL is required' };
  }
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    new URL(withProtocol);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}

export function validateSSID(ssid: string): ValidationResult {
  if (!ssid.trim()) {
    return { valid: false, error: 'Network name (SSID) is required' };
  }
  return { valid: true };
}

export function validateVCard(data: VCardData): VCardValidationResult {
  const errors: string[] = [];
  if (!data.firstName.trim() && !data.lastName.trim()) {
    errors.push('At least first name or last name is required');
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  if (data.website) {
    const url = /^https?:\/\//i.test(data.website) ? data.website : `https://${data.website}`;
    try {
      new URL(url);
    } catch {
      errors.push('Please enter a valid website URL');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validatePhone(phone: string): ValidationResult {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (!cleaned) {
    return { valid: false, error: 'Phone number is required' };
  }
  if (!/^\+?\d{7,15}$/.test(cleaned)) {
    return { valid: false, error: 'Enter a valid phone number (7-15 digits)' };
  }
  return { valid: true };
}

export function validateCryptoAddress(address: string, coin: string): ValidationResult {
  if (!address.trim()) {
    return { valid: false, error: 'Wallet address is required' };
  }
  switch (coin) {
    case 'BTC':
      if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) && !/^bc1[a-zA-HJ-NP-Z0-9]{25,89}$/.test(address))
        return { valid: false, error: 'Enter a valid Bitcoin address' };
      break;
    case 'ETH':
      if (!/^0x[a-fA-F0-9]{40}$/.test(address))
        return { valid: false, error: 'Enter a valid Ethereum address (0x...)' };
      break;
    case 'LTC':
      if (!/^[LM3][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) && !/^ltc1[a-zA-HJ-NP-Z0-9]{25,89}$/.test(address))
        return { valid: false, error: 'Enter a valid Litecoin address' };
      break;
  }
  return { valid: true };
}

export function validateCoordinates(lat: string, lng: string): { lat: ValidationResult; lng: ValidationResult } {
  const result = { lat: { valid: true } as ValidationResult, lng: { valid: true } as ValidationResult };
  if (!lat.trim()) {
    result.lat = { valid: false, error: 'Latitude is required' };
  } else {
    const latNum = parseFloat(lat);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      result.lat = { valid: false, error: 'Latitude must be between -90 and 90' };
    }
  }
  if (!lng.trim()) {
    result.lng = { valid: false, error: 'Longitude is required' };
  } else {
    const lngNum = parseFloat(lng);
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      result.lng = { valid: false, error: 'Longitude must be between -180 and 180' };
    }
  }
  return result;
}

export function validateCalendar(data: CalendarData): VCardValidationResult {
  const errors: string[] = [];
  if (!data.title.trim()) errors.push('Event title is required');
  if (!data.startDate) errors.push('Start date is required');
  if (!data.startTime) errors.push('Start time is required');
  if (!data.endDate) errors.push('End date is required');
  if (!data.endTime) errors.push('End time is required');
  if (data.startDate && data.startTime && data.endDate && data.endTime) {
    const start = new Date(`${data.startDate}T${data.startTime}`);
    const end = new Date(`${data.endDate}T${data.endTime}`);
    if (end <= start) errors.push('End must be after start');
  }
  return { valid: errors.length === 0, errors };
}
