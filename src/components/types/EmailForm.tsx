import { useState, useEffect, useRef } from 'react';
import type { QRFormProps, EmailData } from '../../types/qr';
import { formatEmail } from '../../utils/payloads';
import { validateEmail } from '../../utils/validation';

export default function EmailForm({ onChange }: QRFormProps) {
  const [data, setData] = useState<EmailData>({
    email: '',
    subject: '',
    body: '',
  });
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!data.email.trim()) {
        setError('');
        onChange('');
        return;
      }
      const result = validateEmail(data.email);
      if (result.valid) {
        setError('');
        onChange(formatEmail(data.email, data.subject, data.body));
      } else {
        setError(result.error ?? '');
        onChange('');
      }
    }, 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, onChange]);

  const update = (fields: Partial<EmailData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="recipient@example.com"
          className={inputClass}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subject
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
        </label>
        <input
          type="text"
          value={data.subject}
          onChange={(e) => update({ subject: e.target.value })}
          placeholder="Email subject line"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Body
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          value={data.body}
          onChange={(e) => update({ body: e.target.value })}
          placeholder="Email body text..."
          rows={4}
          className={`${inputClass} resize-y`}
        />
      </div>
    </div>
  );
}
