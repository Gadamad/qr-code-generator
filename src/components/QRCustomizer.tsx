import { useState, useCallback, useRef } from 'react';
import { getContrastRatio, isContrastSufficient } from '../utils/contrast';
import type { QRGeneratorOptions } from '../hooks/useQRGenerator';

type CustomizationOptions = Omit<QRGeneratorOptions, 'data'>;

interface QRCustomizerProps {
  options: CustomizationOptions;
  onChange: (options: CustomizationOptions) => void;
}

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {title}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

const DOT_STYLES: { value: QRGeneratorOptions['dotStyle']; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
];

const CORNER_STYLES: { value: QRGeneratorOptions['cornerStyle']; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Rounded' },
  { value: 'dot', label: 'Dot' },
];

const EC_LEVELS: { value: 'L' | 'M' | 'Q' | 'H'; label: string; desc: string }[] = [
  { value: 'L', label: 'Low (7%)', desc: 'Smallest QR' },
  { value: 'M', label: 'Medium (15%)', desc: 'Default' },
  { value: 'Q', label: 'Quartile (25%)', desc: 'Better recovery' },
  { value: 'H', label: 'High (30%)', desc: 'Best for logos' },
];

export default function QRCustomizer({ options, onChange }: QRCustomizerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    (partial: Partial<CustomizationOptions>) => {
      onChange({ ...options, ...partial });
    },
    [options, onChange],
  );

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        update({ logo: reader.result as string, logoSize: 0.2 });
      };
      reader.readAsDataURL(file);
    },
    [update],
  );

  const removeLogo = useCallback(() => {
    update({ logo: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [update]);

  const fgColor = options.fgColor ?? '#000000';
  const bgColor = options.bgColor ?? '#ffffff';
  const contrastRatio = getContrastRatio(fgColor, bgColor);
  const hasSufficientContrast = isContrastSufficient(fgColor, bgColor);
  const hasLogo = Boolean(options.logo);
  const gradientEnabled = options.gradientType === 'linear';

  return (
    <div className="space-y-3">
      {/* Colors */}
      <CollapsibleSection title="Colors">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Foreground
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => update({ fgColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => {
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    update({ fgColor: e.target.value });
                  }
                }}
                className="flex-1 text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => update({ bgColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => {
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    update({ bgColor: e.target.value });
                  }
                }}
                className="flex-1 text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Contrast warning */}
        {!hasSufficientContrast && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-xs text-amber-700 dark:text-amber-400">
              <p className="font-medium">Low contrast ({contrastRatio.toFixed(1)}:1)</p>
              <p>QR code may be hard to scan. Minimum 3:1 recommended.</p>
            </div>
          </div>
        )}

        {/* Gradient toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="gradient-toggle"
            checked={gradientEnabled}
            onChange={(e) =>
              update({
                gradientType: e.target.checked ? 'linear' : 'none',
                gradientColor1: options.gradientColor1 ?? fgColor,
                gradientColor2: options.gradientColor2 ?? '#0066ff',
              })
            }
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <label htmlFor="gradient-toggle" className="text-xs text-gray-600 dark:text-gray-400">
            Use gradient
          </label>
        </div>

        {gradientEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Start Color
              </label>
              <input
                type="color"
                value={options.gradientColor1 ?? fgColor}
                onChange={(e) => update({ gradientColor1: e.target.value })}
                className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                End Color
              </label>
              <input
                type="color"
                value={options.gradientColor2 ?? '#0066ff'}
                onChange={(e) => update({ gradientColor2: e.target.value })}
                className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Logo */}
      <CollapsibleSection title="Logo" defaultOpen={false}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={handleLogoUpload}
          className="hidden"
        />

        {hasLogo ? (
          <div className="flex items-center gap-3">
            <img
              src={options.logo!}
              alt="Logo preview"
              className="w-12 h-12 rounded-lg object-contain border border-gray-200 dark:border-gray-700 bg-white"
            />
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Logo uploaded</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Size: {Math.round((options.logoSize ?? 0.2) * 100)}%
              </p>
            </div>
            <button
              type="button"
              onClick={removeLogo}
              className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            Upload logo (PNG, JPG, SVG)
          </button>
        )}

        {hasLogo && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Logo Size: {Math.round((options.logoSize ?? 0.2) * 100)}%
            </label>
            <input
              type="range"
              min={0.15}
              max={0.3}
              step={0.01}
              value={options.logoSize ?? 0.2}
              onChange={(e) => update({ logoSize: parseFloat(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Style */}
      <CollapsibleSection title="Style" defaultOpen={false}>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Dot Style
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {DOT_STYLES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ dotStyle: value })}
                className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${
                  options.dotStyle === value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Corner Style
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {CORNER_STYLES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ cornerStyle: value })}
                className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${
                  options.cornerStyle === value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Size & Margin */}
      <CollapsibleSection title="Size & Margin" defaultOpen={false}>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Size: {options.width ?? 300}px
          </label>
          <input
            type="range"
            min={256}
            max={2048}
            step={16}
            value={options.width ?? 300}
            onChange={(e) => {
              const size = parseInt(e.target.value);
              update({ width: size, height: size });
            }}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>256px</span>
            <span>2048px</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Margin: {options.margin ?? 4} modules
          </label>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={options.margin ?? 4}
            onChange={(e) => update({ margin: parseInt(e.target.value) })}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>0</span>
            <span>10</span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Error Correction */}
      <CollapsibleSection title="Error Correction" defaultOpen={false}>
        {hasLogo && (
          <p className="text-xs text-blue-500 dark:text-blue-400">
            Locked to High (H) when using a logo
          </p>
        )}
        <select
          value={hasLogo ? 'H' : (options.errorCorrection ?? 'M')}
          disabled={hasLogo}
          onChange={(e) =>
            update({ errorCorrection: e.target.value as 'L' | 'M' | 'Q' | 'H' })
          }
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {EC_LEVELS.map(({ value, label, desc }) => (
            <option key={value} value={value}>
              {label} — {desc}
            </option>
          ))}
        </select>
      </CollapsibleSection>
    </div>
  );
}
