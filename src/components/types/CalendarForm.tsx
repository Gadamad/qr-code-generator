import { useState, useEffect, useRef } from 'react';
import type { QRFormProps, CalendarData } from '../../types/qr';
import { formatCalendar } from '../../utils/payloads';
import { validateCalendar } from '../../utils/validation';

export default function CalendarForm({ onChange }: QRFormProps) {
  const [data, setData] = useState<CalendarData>({
    title: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!data.title.trim() && !data.startDate && !data.endDate) {
        setErrors([]);
        onChange('');
        return;
      }
      const result = validateCalendar(data);
      if (result.valid) {
        setErrors([]);
        onChange(formatCalendar(data));
      } else {
        setErrors(result.errors);
        onChange('');
      }
    }, 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, onChange]);

  const update = (field: keyof CalendarData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Event Title
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Team Meeting"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
        </label>
        <input
          type="text"
          value={data.location}
          onChange={(e) => update('location', e.target.value)}
          placeholder="Conference Room A"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={data.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Time
          </label>
          <input
            type="time"
            value={data.startTime}
            onChange={(e) => update('startTime', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={data.endDate}
            onChange={(e) => update('endDate', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Time
          </label>
          <input
            type="time"
            value={data.endTime}
            onChange={(e) => update('endTime', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Event details..."
          rows={3}
          className={`${inputClass} resize-y`}
        />
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-500">{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}
