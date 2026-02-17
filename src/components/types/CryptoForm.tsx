import { useState, useEffect, useRef } from 'react';
import type { QRFormProps, CryptoData } from '../../types/qr';
import { formatCrypto } from '../../utils/payloads';
import { validateCryptoAddress } from '../../utils/validation';

const COINS: { id: CryptoData['coin']; label: string; placeholder: string }[] = [
  { id: 'BTC', label: 'Bitcoin', placeholder: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
  { id: 'ETH', label: 'Ethereum', placeholder: '0x742d35Cc6634C0532925a3b844Bc9e7595f...' },
  { id: 'LTC', label: 'Litecoin', placeholder: 'LQTpS3VaYTjCr4aE1b5mF8Hkg...' },
];

export default function CryptoForm({ onChange }: QRFormProps) {
  const [coin, setCoin] = useState<CryptoData['coin']>('BTC');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!address.trim()) {
        setError('');
        onChange('');
        return;
      }
      const result = validateCryptoAddress(address, coin);
      if (result.valid) {
        setError('');
        onChange(formatCrypto({ coin, address, amount: amount || undefined, label: label || undefined }));
      } else {
        setError(result.error ?? '');
        onChange('');
      }
    }, 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [coin, address, amount, label, onChange]);

  const activeCoin = COINS.find((c) => c.id === coin)!;

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-colors';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cryptocurrency
        </label>
        <div className="flex gap-2">
          {COINS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setCoin(c.id); setAddress(''); setError(''); }}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                coin === c.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Wallet Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={activeCoin.placeholder}
          className={`${inputClass} font-mono text-sm`}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount
            <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.001"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Label
            <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Donation"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
