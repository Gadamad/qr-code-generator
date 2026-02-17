import { useState, useEffect, useRef } from 'react';
import type { QRFormProps } from '../../types/qr';
import { formatURL } from '../../utils/payloads';
import { validateURL } from '../../utils/validation';

export default function URLForm({ onChange }: QRFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!url.trim()) {
        setError('');
        onChange('');
        return;
      }
      const result = validateURL(url);
      if (result.valid) {
        setError('');
        onChange(formatURL(url));
      } else {
        setError(result.error ?? '');
        onChange('');
      }
    }, 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [url, onChange]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Website URL
      </label>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="example.com"
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        https:// will be added automatically if missing
      </p>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
