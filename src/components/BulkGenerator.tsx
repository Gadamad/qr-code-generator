import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import QRCodeStyling from 'qr-code-styling';
import type { QRType } from '../types/qr';
import {
  parseCSV,
  autoDetectQRType,
  autoDetectColumnMapping,
  mapRowToPayload,
  parseBatchText,
  generateFilename,
  MAX_BATCH_SIZE,
} from '../utils/bulk';

type BulkMode = 'csv' | 'text';
type FilenamePattern = 'sequential' | 'content';

interface BulkQROptions {
  width: number;
  fgColor: string;
  bgColor: string;
  dotStyle: string;
  cornerStyle: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

interface GenerationState {
  active: boolean;
  current: number;
  total: number;
  startTime: number;
  blobs: Map<number, Blob>;
}

const QR_TYPES: QRType[] = ['url', 'text', 'email', 'wifi', 'sms'];

const DEFAULT_OPTIONS: BulkQROptions = {
  width: 300,
  fgColor: '#000000',
  bgColor: '#ffffff',
  dotStyle: 'square',
  cornerStyle: 'square',
  errorCorrection: 'M',
};

export default function BulkGenerator() {
  const [mode, setMode] = useState<BulkMode>('csv');
  const [qrType, setQrType] = useState<QRType>('url');
  const [options, setOptions] = useState<BulkQROptions>(DEFAULT_OPTIONS);
  const [filenamePattern, setFilenamePattern] = useState<FilenamePattern>('sequential');

  // CSV state
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [csvFilename, setCsvFilename] = useState('');

  // Batch text state
  const [batchText, setBatchText] = useState('');
  const batchLines = parseBatchText(batchText);

  // Generation state
  const [gen, setGen] = useState<GenerationState>({
    active: false,
    current: 0,
    total: 0,
    startTime: 0,
    blobs: new Map(),
  });
  const [downloadReady, setDownloadReady] = useState(false);
  const cancelRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview thumbnails
  const [previews, setPreviews] = useState<string[]>([]);

  const items = mode === 'csv'
    ? csvRows.map((row) => mapRowToPayload(row, qrType, columnMapping))
    : batchLines;

  const itemCount = items.length;
  const overLimit = itemCount > MAX_BATCH_SIZE;
  const previewItems = items.slice(0, 5);

  // Generate preview thumbnails
  useEffect(() => {
    if (previewItems.length === 0) {
      setPreviews([]);
      return;
    }

    let cancelled = false;
    const generatePreviews = async () => {
      const urls: string[] = [];
      for (const item of previewItems) {
        if (cancelled) break;
        const qr = new QRCodeStyling({
          width: 80,
          height: 80,
          data: item || ' ',
          margin: 2,
          type: 'canvas',
          dotsOptions: { color: options.fgColor, type: options.dotStyle as 'square' },
          backgroundOptions: { color: options.bgColor },
          qrOptions: { errorCorrectionLevel: options.errorCorrection },
        });
        const raw = await qr.getRawData('png');
        if (raw && !cancelled) {
          const blob = raw instanceof Blob ? raw : new Blob([raw as BlobPart]);
          urls.push(URL.createObjectURL(blob));
        }
      }
      if (!cancelled) setPreviews(urls);
    };

    generatePreviews();
    return () => {
      cancelled = true;
      setPreviews((prev) => {
        prev.forEach((u) => URL.revokeObjectURL(u));
        return [];
      });
    };
  }, [previewItems.join('|||'), options.fgColor, options.bgColor, options.dotStyle, options.errorCorrection]);

  // CSV file handler
  const handleCSVUpload = useCallback((file: File) => {
    setCsvFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const parsed = parseCSV(text);
      setCsvHeaders(parsed.headers);
      setCsvRows(parsed.rows);

      const detected = autoDetectQRType(parsed.headers);
      if (detected) setQrType(detected);

      const autoMap = autoDetectColumnMapping(parsed.headers, detected ?? 'url');
      setColumnMapping(autoMap);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleCSVUpload(file);
    }
  }, [handleCSVUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCSVUpload(file);
  }, [handleCSVUpload]);

  // Main thread batch generation (fallback from worker)
  const generateAll = useCallback(async () => {
    const toGenerate = items.slice(0, MAX_BATCH_SIZE);
    const total = toGenerate.length;
    if (total === 0) return;

    cancelRef.current = false;
    setDownloadReady(false);
    setGen({ active: true, current: 0, total, startTime: Date.now(), blobs: new Map() });

    const blobs = new Map<number, Blob>();
    const BATCH_SIZE = 5;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      if (cancelRef.current) break;

      const batch = toGenerate.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (data, batchIdx) => {
        const idx = i + batchIdx;
        const qr = new QRCodeStyling({
          width: options.width,
          height: options.width,
          data: data || ' ',
          margin: 4,
          type: 'canvas',
          dotsOptions: { color: options.fgColor, type: options.dotStyle as 'square' },
          cornersSquareOptions: { color: options.fgColor, type: options.cornerStyle as 'square' },
          cornersDotOptions: { color: options.fgColor },
          backgroundOptions: { color: options.bgColor },
          qrOptions: { errorCorrectionLevel: options.errorCorrection },
        });

        const raw = await qr.getRawData('png');
        if (raw) {
          const blob = raw instanceof Blob ? raw : new Blob([raw as BlobPart]);
          blobs.set(idx, blob);
        }
      });

      await Promise.all(promises);

      setGen((prev) => ({
        ...prev,
        current: Math.min(i + BATCH_SIZE, total),
        blobs: new Map(blobs),
      }));

      // Yield to main thread
      await new Promise((r) => requestAnimationFrame(r));
    }

    if (!cancelRef.current) {
      setGen((prev) => ({ ...prev, active: false, blobs: new Map(blobs) }));
      setDownloadReady(true);
    } else {
      setGen((prev) => ({ ...prev, active: false }));
    }
  }, [items, options]);

  const handleCancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const handleDownloadZip = useCallback(async () => {
    const zip = new JSZip();
    const toGenerate = items.slice(0, MAX_BATCH_SIZE);

    gen.blobs.forEach((blob, idx) => {
      const filename = generateFilename(idx, toGenerate[idx] ?? '', filenamePattern);
      zip.file(filename, blob);
    });

    // Add manifest CSV
    const manifestRows = Array.from(gen.blobs.keys())
      .sort((a, b) => a - b)
      .map((idx) => ({
        filename: generateFilename(idx, toGenerate[idx] ?? '', filenamePattern),
        content: toGenerate[idx] ?? '',
      }));
    const manifestCSV = Papa.unparse(manifestRows);
    zip.file('manifest.csv', manifestCSV);

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'qr-codes.zip');
  }, [gen.blobs, items, filenamePattern]);

  const progressPercent = gen.total > 0 ? Math.round((gen.current / gen.total) * 100) : 0;
  const elapsed = gen.active ? (Date.now() - gen.startTime) / 1000 : 0;
  const speed = gen.current > 0 ? gen.current / elapsed : 0;
  const remaining = speed > 0 ? Math.ceil((gen.total - gen.current) / speed) : 0;

  const updateMapping = (field: string, column: string) => {
    setColumnMapping((prev) => ({ ...prev, [field]: column }));
  };

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
        <button
          onClick={() => setMode('csv')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'csv'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          CSV Upload
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'text'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Batch Text
        </button>
      </div>

      {/* CSV Mode */}
      {mode === 'csv' && (
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-gray-500 dark:text-gray-400">
              {csvFilename ? (
                <p className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{csvFilename}</span>
                  <br />
                  {csvRows.length} rows found. Click or drop to replace.
                </p>
              ) : (
                <>
                  <p className="text-lg mb-1">Drop CSV file here</p>
                  <p className="text-sm">or click to browse</p>
                </>
              )}
            </div>
          </div>

          {/* Column Mapping */}
          {csvHeaders.length > 0 && (
            <div className="space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Column Mapping
              </h3>
              {getMappingFields(qrType).map((field) => (
                <div key={field} className="flex items-center gap-3">
                  <label className="w-24 text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {field}
                  </label>
                  <select
                    value={columnMapping[field] ?? ''}
                    onChange={(e) => updateMapping(field, e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="">-- Select column --</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Batch Text Mode */}
      {mode === 'text' && (
        <div className="space-y-2">
          <textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder="Paste URLs or text, one per line"
            rows={8}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors font-mono resize-y"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {batchLines.length} line{batchLines.length !== 1 ? 's' : ''} detected
          </p>
        </div>
      )}

      {/* Shared Settings */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            QR Type
          </label>
          <select
            value={qrType}
            onChange={(e) => {
              setQrType(e.target.value as QRType);
              if (csvHeaders.length > 0) {
                setColumnMapping(autoDetectColumnMapping(csvHeaders, e.target.value as QRType));
              }
            }}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
          >
            {QR_TYPES.map((t) => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Size
          </label>
          <select
            value={options.width}
            onChange={(e) => setOptions((o) => ({ ...o, width: Number(e.target.value) }))}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
          >
            {[200, 300, 400, 500, 600].map((s) => (
              <option key={s} value={s}>{s}x{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Foreground
          </label>
          <input
            type="color"
            value={options.fgColor}
            onChange={(e) => setOptions((o) => ({ ...o, fgColor: e.target.value }))}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Background
          </label>
          <input
            type="color"
            value={options.bgColor}
            onChange={(e) => setOptions((o) => ({ ...o, bgColor: e.target.value }))}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Filename Pattern
          </label>
          <select
            value={filenamePattern}
            onChange={(e) => setFilenamePattern(e.target.value as FilenamePattern)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
          >
            <option value="sequential">Sequential (qr-001.png)</option>
            <option value="content">Content-based</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Error Correction
          </label>
          <select
            value={options.errorCorrection}
            onChange={(e) => setOptions((o) => ({ ...o, errorCorrection: e.target.value as 'L' | 'M' | 'Q' | 'H' }))}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </div>
      </div>

      {/* Limit Warning */}
      {overLimit && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Maximum {MAX_BATCH_SIZE} items per batch. Only the first {MAX_BATCH_SIZE} will be generated ({itemCount} detected).
          </p>
        </div>
      )}

      {/* Preview */}
      {previewItems.length > 0 && !gen.active && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview ({Math.min(itemCount, MAX_BATCH_SIZE)} total)
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {previewItems.map((item, i) => (
              <div
                key={i}
                className="shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                {previews[i] ? (
                  <img src={previews[i]} alt={`Preview ${i + 1}`} className="w-20 h-20" />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[80px] truncate">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generation Progress */}
      {gen.active && (
        <div className="space-y-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Generating... {gen.current} / {gen.total}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-500">
              ~{remaining}s remaining
            </span>
          </div>
          <div className="w-full bg-blue-100 dark:bg-blue-900/40 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            onClick={handleCancel}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={generateAll}
          disabled={itemCount === 0 || gen.active}
          className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium text-sm transition-colors disabled:cursor-not-allowed"
        >
          Generate {Math.min(itemCount, MAX_BATCH_SIZE)} QR Code{itemCount !== 1 ? 's' : ''}
        </button>
        {downloadReady && (
          <button
            onClick={handleDownloadZip}
            className="py-2.5 px-6 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors"
          >
            Download ZIP
          </button>
        )}
      </div>
    </div>
  );
}

function getMappingFields(qrType: QRType): string[] {
  switch (qrType) {
    case 'url': return ['url'];
    case 'text': return ['text'];
    case 'email': return ['email', 'subject'];
    case 'wifi': return ['ssid', 'password', 'encryption'];
    case 'sms': return ['phone'];
    default: return ['text'];
  }
}
