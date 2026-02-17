import { useState, useEffect, useRef } from 'react';
import type { QRFormProps, WiFiData } from '../../types/qr';
import { formatWiFi } from '../../utils/payloads';
import { validateSSID } from '../../utils/validation';

export default function WiFiForm({ onChange }: QRFormProps) {
  const [data, setData] = useState<WiFiData>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
  });
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!data.ssid.trim()) {
        setError('');
        onChange('');
        return;
      }
      const result = validateSSID(data.ssid);
      if (result.valid) {
        setError('');
        onChange(formatWiFi(data.ssid, data.password, data.encryption, data.hidden));
      } else {
        setError(result.error ?? '');
        onChange('');
      }
    }, 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, onChange]);

  const update = (fields: Partial<WiFiData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Network Name (SSID)
        </label>
        <input
          type="text"
          value={data.ssid}
          onChange={(e) => update({ ssid: e.target.value })}
          placeholder="My WiFi Network"
          className={inputClass}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <input
          type="password"
          value={data.password}
          onChange={(e) => update({ password: e.target.value })}
          placeholder="Network password"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Encryption
        </label>
        <select
          value={data.encryption}
          onChange={(e) => update({ encryption: e.target.value as WiFiData['encryption'] })}
          className={inputClass}
        >
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">None</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={data.hidden}
          onClick={() => update({ hidden: !data.hidden })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            data.hidden ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              data.hidden ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">Hidden network</span>
      </div>
    </div>
  );
}
