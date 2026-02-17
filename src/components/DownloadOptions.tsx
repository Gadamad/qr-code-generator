import { useState, useCallback } from 'react';
import { useDownload } from '../hooks/useDownload';
import type QRCodeStyling from 'qr-code-styling';

interface DownloadOptionsProps {
  qrInstance: QRCodeStyling | null;
  disabled?: boolean;
}

export default function DownloadOptions({ qrInstance, disabled = false }: DownloadOptionsProps) {
  const { downloadPNG, downloadSVG, downloadPDF, downloadJPEG, copyToClipboard, share } =
    useDownload(qrInstance);

  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfLabel, setPdfLabel] = useState('');
  const [showPdfInput, setShowPdfInput] = useState(false);

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const withLoading = useCallback(
    (key: string, fn: () => Promise<void>) => async () => {
      if (disabled || loading) return;
      setLoading(key);
      try {
        await fn();
      } finally {
        setLoading(null);
      }
    },
    [disabled, loading],
  );

  const handleCopy = useCallback(async () => {
    if (disabled || loading) return;
    setLoading('copy');
    const success = await copyToClipboard();
    setLoading(null);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [disabled, loading, copyToClipboard]);

  const handleShare = useCallback(async () => {
    if (disabled || loading) return;
    setLoading('share');
    await share('QR Code');
    setLoading(null);
  }, [disabled, loading, share]);

  const handlePdfDownload = useCallback(async () => {
    if (disabled || loading) return;
    setLoading('pdf');
    await downloadPDF('qrcode', pdfLabel || undefined);
    setLoading(null);
    setShowPdfInput(false);
  }, [disabled, loading, downloadPDF, pdfLabel]);

  const isDisabled = disabled || !qrInstance;

  const btnBase =
    'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* PNG - Primary */}
        <button
          disabled={isDisabled}
          onClick={withLoading('png', () => downloadPNG())}
          className={`${btnBase} bg-blue-600 text-white hover:bg-blue-700 active:scale-95`}
        >
          {loading === 'png' ? (
            <Spinner />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          PNG
        </button>

        {/* SVG */}
        <button
          disabled={isDisabled}
          onClick={withLoading('svg', () => downloadSVG())}
          className={`${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95`}
        >
          {loading === 'svg' ? <Spinner /> : null}
          SVG
        </button>

        {/* PDF */}
        <button
          disabled={isDisabled}
          onClick={() => {
            if (showPdfInput) {
              handlePdfDownload();
            } else {
              setShowPdfInput(true);
            }
          }}
          className={`${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95`}
        >
          {loading === 'pdf' ? <Spinner /> : null}
          PDF
        </button>

        {/* JPEG */}
        <button
          disabled={isDisabled}
          onClick={withLoading('jpeg', () => downloadJPEG())}
          className={`${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95`}
        >
          {loading === 'jpeg' ? <Spinner /> : null}
          JPEG
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-200 dark:bg-gray-700 self-stretch" />

        {/* Copy */}
        <button
          disabled={isDisabled}
          onClick={handleCopy}
          className={`${btnBase} ${
            copied
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          } active:scale-95`}
        >
          {loading === 'copy' ? (
            <Spinner />
          ) : copied ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>

        {/* Share */}
        {canShare && (
          <button
            disabled={isDisabled}
            onClick={handleShare}
            className={`${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95`}
          >
            {loading === 'share' ? (
              <Spinner />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
            Share
          </button>
        )}
      </div>

      {/* PDF label input */}
      {showPdfInput && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={pdfLabel}
            onChange={(e) => setPdfLabel(e.target.value)}
            placeholder="Optional label text under QR..."
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-blue-500"
          />
          <button
            onClick={handlePdfDownload}
            disabled={loading === 'pdf'}
            className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading === 'pdf' ? <Spinner /> : 'Download'}
          </button>
          <button
            onClick={() => setShowPdfInput(false)}
            className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
}
