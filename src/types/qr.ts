export type QRType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'whatsapp' | 'crypto' | 'calendar' | 'geo';

export interface VCardData {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  organization?: string;
  title?: string;
  website?: string;
  address?: string;
}

export interface WiFiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface SMSData {
  phone: string;
  message?: string;
}

export interface WhatsAppData {
  phone: string;
  message?: string;
}

export interface CryptoData {
  coin: 'BTC' | 'ETH' | 'LTC';
  address: string;
  amount?: string;
  label?: string;
}

export interface CalendarData {
  title: string;
  location?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description?: string;
}

export interface GeoData {
  latitude: string;
  longitude: string;
}

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type DotStyle = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';

export type CornerStyle = 'square' | 'dot' | 'extra-rounded';

export type CornerDotStyle = 'square' | 'dot';

export interface QROptions {
  fgColor: string;
  bgColor: string;
  size: number;
  margin: number;
  errorCorrection: ErrorCorrectionLevel;
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  cornerDotStyle: CornerDotStyle;
  logoUrl: string;
}

export const DEFAULT_QR_OPTIONS: QROptions = {
  fgColor: '#000000',
  bgColor: '#ffffff',
  size: 300,
  margin: 16,
  errorCorrection: 'M',
  dotStyle: 'square',
  cornerStyle: 'square',
  cornerDotStyle: 'square',
  logoUrl: '',
};

export interface QRFormProps {
  onChange: (payload: string) => void;
}
