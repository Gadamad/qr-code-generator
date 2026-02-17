import { useState, useEffect, useRef } from 'react';
import type { QRFormProps } from '../../types/qr';
import { formatText } from '../../utils/payloads';

export default function TextForm({ onChange }: QRFormProps) {
  const [text, setText] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(formatText(text));
    }, 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, onChange]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Text Content
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter any text..."
        rows={5}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors resize-y"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {text.length} characters
      </p>
    </div>
  );
}
