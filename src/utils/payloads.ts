import type { VCardData, CryptoData, CalendarData } from '../types/qr';

export function formatURL(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function formatText(text: string): string {
  return text;
}

export function formatWiFi(
  ssid: string,
  password: string,
  encryption: 'WPA' | 'WEP' | 'nopass',
  hidden: boolean,
): string {
  const escapedSSID = ssid.replace(/([\\;,:"'])/g, '\\$1');
  const escapedPassword = password.replace(/([\\;,:"'])/g, '\\$1');
  return `WIFI:T:${encryption};S:${escapedSSID};P:${escapedPassword};H:${hidden};;`;
}

export function formatVCard(data: VCardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${data.firstName} ${data.lastName}`.trim(),
  ];

  if (data.phone) lines.push(`TEL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.organization) lines.push(`ORG:${data.organization}`);
  if (data.title) lines.push(`TITLE:${data.title}`);
  if (data.website) lines.push(`URL:${data.website}`);
  if (data.address) lines.push(`ADR:;;${data.address};;;;`);

  lines.push('END:VCARD');
  return lines.join('\n');
}

export function formatEmail(email: string, subject?: string, body?: string): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${email}${query}`;
}

export function formatSMS(phone: string, message?: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!message) return `sms:${cleaned}`;
  return `sms:${cleaned}?body=${encodeURIComponent(message)}`;
}

export function formatWhatsApp(phone: string, message?: string): string {
  const cleaned = phone.replace(/[^\d]/g, '');
  if (!message) return `https://wa.me/${cleaned}`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function formatCrypto(data: CryptoData): string {
  const { coin, address, amount, label } = data;
  const params: string[] = [];
  if (amount) params.push(`amount=${encodeURIComponent(amount)}`);
  if (label) params.push(`label=${encodeURIComponent(label)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';

  switch (coin) {
    case 'BTC':
      return `bitcoin:${address}${query}`;
    case 'ETH': {
      const ethParams: string[] = [];
      if (amount) ethParams.push(`value=${encodeURIComponent(amount)}`);
      const ethQuery = ethParams.length > 0 ? `?${ethParams.join('&')}` : '';
      return `ethereum:${address}${ethQuery}`;
    }
    case 'LTC':
      return `litecoin:${address}${query}`;
  }
}

function toICalDate(date: string, time: string): string {
  const d = date.replace(/-/g, '');
  const t = time.replace(/:/g, '') + '00';
  return `${d}T${t}Z`;
}

export function formatCalendar(data: CalendarData): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${toICalDate(data.startDate, data.startTime)}`,
    `DTEND:${toICalDate(data.endDate, data.endTime)}`,
    `SUMMARY:${data.title}`,
  ];
  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (data.description) lines.push(`DESCRIPTION:${data.description}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\n');
}

export function formatGeo(lat: string, lng: string): string {
  return `geo:${lat},${lng}`;
}
