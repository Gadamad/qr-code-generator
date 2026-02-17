import Papa from 'papaparse';
import type { QRType } from '../types/qr';

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

const COLUMN_AUTO_MAP: Record<string, { type: QRType; field: string }> = {
  url: { type: 'url', field: 'url' },
  link: { type: 'url', field: 'url' },
  website: { type: 'url', field: 'url' },
  email: { type: 'email', field: 'email' },
  ssid: { type: 'wifi', field: 'ssid' },
  phone: { type: 'sms', field: 'phone' },
  text: { type: 'text', field: 'text' },
};

export function parseCSV(csvString: string): ParsedCSV {
  const result = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
  };
}

export function autoDetectQRType(headers: string[]): QRType | null {
  const lower = headers.map((h) => h.toLowerCase());
  for (const col of lower) {
    if (COLUMN_AUTO_MAP[col]) {
      return COLUMN_AUTO_MAP[col].type;
    }
  }
  return null;
}

export function autoDetectColumnMapping(
  headers: string[],
  qrType: QRType,
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lower = headers.map((h) => h.toLowerCase());

  if (qrType === 'url') {
    const idx = lower.findIndex((h) => h === 'url' || h === 'link' || h === 'website');
    if (idx !== -1) mapping['url'] = headers[idx];
  } else if (qrType === 'email') {
    const idx = lower.findIndex((h) => h === 'email' || h === 'mail');
    if (idx !== -1) mapping['email'] = headers[idx];
    const subIdx = lower.findIndex((h) => h === 'subject');
    if (subIdx !== -1) mapping['subject'] = headers[subIdx];
  } else if (qrType === 'text') {
    const idx = lower.findIndex((h) => h === 'text' || h === 'content' || h === 'data');
    if (idx !== -1) mapping['text'] = headers[idx];
  } else if (qrType === 'wifi') {
    const ssidIdx = lower.findIndex((h) => h === 'ssid' || h === 'network');
    if (ssidIdx !== -1) mapping['ssid'] = headers[ssidIdx];
    const passIdx = lower.findIndex((h) => h === 'password' || h === 'pass');
    if (passIdx !== -1) mapping['password'] = headers[passIdx];
  }

  return mapping;
}

export function mapRowToPayload(
  row: Record<string, string>,
  qrType: QRType,
  columnMapping: Record<string, string>,
): string {
  const get = (field: string): string => {
    const col = columnMapping[field];
    return col ? (row[col] ?? '').trim() : '';
  };

  switch (qrType) {
    case 'url': {
      const url = get('url') || Object.values(row)[0] || '';
      return /^https?:\/\//i.test(url) ? url : `https://${url}`;
    }
    case 'text':
      return get('text') || Object.values(row)[0] || '';
    case 'email': {
      const email = get('email');
      const subject = get('subject');
      const params: string[] = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      const query = params.length > 0 ? `?${params.join('&')}` : '';
      return `mailto:${email}${query}`;
    }
    case 'wifi': {
      const ssid = get('ssid').replace(/([\\;,:"'])/g, '\\$1');
      const pass = get('password').replace(/([\\;,:"'])/g, '\\$1');
      const enc = get('encryption') || 'WPA';
      return `WIFI:T:${enc};S:${ssid};P:${pass};H:false;;`;
    }
    case 'sms':
      return `sms:${get('phone')}`;
    default:
      return Object.values(row)[0] || '';
  }
}

export function parseBatchText(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function generateFilename(
  index: number,
  content: string,
  pattern: 'sequential' | 'content',
): string {
  if (pattern === 'sequential') {
    return `qr-${String(index + 1).padStart(3, '0')}.png`;
  }
  const sanitized = content
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 40)
    .replace(/_+$/, '');
  return `qr-${sanitized || index + 1}.png`;
}

export const MAX_BATCH_SIZE = 500;
