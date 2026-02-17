import { useState, useEffect, useRef } from 'react';
import type { QRFormProps, WhatsAppData } from '../../types/qr';
import { formatWhatsApp } from '../../utils/payloads';
import { validatePhone } from '../../utils/validation';

export default function WhatsAppForm({ onChange }: QRFormProps) {
  const [data, setData] = useState<WhatsAppData>({ phone: '', message: '' });
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!data.phone.trim()) {
        setError('');
        onChange('');
        return;
      }
      const result = validatePhone(data.phone);
      if (result.valid) {
        setError('');
        onChange(formatWhatsApp(data.phone, data.message || undefined));
      } else {
        setError(result.error ?? '');
        onChange('');
      }
    }, 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, onChange]);

  const update = (fields: Partial<WhatsAppData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-colors';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number (with country code)
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="+1234567890"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Include country code (e.g. +1 for US, +44 for UK)
        </p>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Pre-filled Message
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          value={data.message}
          onChange={(e) => update({ message: e.target.value })}
          placeholder="Hello! I'd like to..."
          rows={3}
          className={`${inputClass} resize-y`}
        />
      </div>
    </div>
  );
}
