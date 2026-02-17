import { useState, useEffect, useRef } from 'react';
import type { QRFormProps, VCardData } from '../../types/qr';
import { formatVCard } from '../../utils/payloads';
import { validateVCard } from '../../utils/validation';

const emptyVCard: VCardData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  organization: '',
  title: '',
  website: '',
  address: '',
};

export default function VCardForm({ onChange }: QRFormProps) {
  const [data, setData] = useState<VCardData>(emptyVCard);
  const [errors, setErrors] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!data.firstName.trim() && !data.lastName.trim()) {
        setErrors([]);
        onChange('');
        return;
      }
      const result = validateVCard(data);
      if (result.valid) {
        setErrors([]);
        onChange(formatVCard(data));
      } else {
        setErrors(result.errors);
        onChange('');
      }
    }, 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, onChange]);

  const update = (fields: Partial<VCardData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            placeholder="John"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
            placeholder="Doe"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="+1 555-123-4567"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="john@example.com"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Organization
          </label>
          <input
            type="text"
            value={data.organization}
            onChange={(e) => update({ organization: e.target.value })}
            placeholder="Company Inc."
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Software Engineer"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Website
        </label>
        <input
          type="url"
          value={data.website}
          onChange={(e) => update({ website: e.target.value })}
          placeholder="https://example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Address
        </label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => update({ address: e.target.value })}
          placeholder="123 Main St, City, Country"
          className={inputClass}
        />
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err) => (
            <p key={err} className="text-sm text-red-500">{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}
