import { useState, useEffect, useRef } from 'react';
import type { QRFormProps } from '../../types/qr';
import { formatGeo } from '../../utils/payloads';
import { validateCoordinates } from '../../utils/validation';

export default function GeoForm({ onChange }: QRFormProps) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latError, setLatError] = useState('');
  const [lngError, setLngError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!latitude.trim() && !longitude.trim()) {
        setLatError('');
        setLngError('');
        onChange('');
        return;
      }
      const result = validateCoordinates(latitude, longitude);
      setLatError(result.lat.error ?? '');
      setLngError(result.lng.error ?? '');
      if (result.lat.valid && result.lng.valid && latitude.trim() && longitude.trim()) {
        onChange(formatGeo(latitude, longitude));
      } else {
        onChange('');
      }
    }, 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [latitude, longitude, onChange]);

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-colors';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Latitude
          </label>
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="40.7128"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">-90 to 90</p>
          {latError && <p className="mt-1 text-sm text-red-500">{latError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Longitude
          </label>
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="-74.0060"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">-180 to 180</p>
          {lngError && <p className="mt-1 text-sm text-red-500">{lngError}</p>}
        </div>
      </div>
    </div>
  );
}
