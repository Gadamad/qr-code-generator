import { useEffect, useState, useMemo } from 'react';
import { useQRGenerator } from '../hooks/useQRGenerator';
import type { QRGeneratorOptions } from '../hooks/useQRGenerator';
import type QRCodeStyling from 'qr-code-styling';

interface QRPreviewProps {
  payload: string;
  options?: Partial<Omit<QRGeneratorOptions, 'data'>>;
  onInstanceReady?: (instance: QRCodeStyling | null) => void;
}

export default function QRPreview({ payload, options = {}, onInstanceReady }: QRPreviewProps) {
  const [visible, setVisible] = useState(false);
  const [previewHidden, setPreviewHidden] = useState(false);

  const qrOptions = useMemo((): QRGeneratorOptions => ({
    data: payload,
    width: options.width ?? 300,
    height: options.height ?? options.width ?? 300,
    fgColor: options.fgColor ?? '#000000',
    bgColor: options.bgColor ?? '#ffffff',
    gradientType: options.gradientType ?? 'none',
    gradientColor1: options.gradientColor1,
    gradientColor2: options.gradientColor2,
    logo: options.logo ?? null,
    logoSize: options.logoSize ?? 0.2,
    cornerStyle: options.cornerStyle ?? 'square',
    dotStyle: options.dotStyle ?? 'square',
    errorCorrection: options.errorCorrection ?? 'M',
    margin: options.margin ?? 4,
  }), [
    payload,
    options.width, options.height,
    options.fgColor, options.bgColor,
    options.gradientType, options.gradientColor1, options.gradientColor2,
    options.logo, options.logoSize,
    options.cornerStyle, options.dotStyle,
    options.errorCorrection, options.margin,
  ]);

  const { qrRef, qrInstance, isGenerating, refresh } = useQRGenerator(qrOptions);

  // Notify parent of qrInstance changes
  useEffect(() => {
    onInstanceReady?.(qrInstance);
  }, [qrInstance, onInstanceReady]);

  // Fade-in after render
  useEffect(() => {
    if (payload && !isGenerating) {
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    }
    if (!payload) setVisible(false);
  }, [payload, isGenerating]);

  const hasPayload = payload.trim().length > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Preview Area */}
      <div className="relative w-full max-w-xs mx-auto aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
        {hasPayload ? (
          <>
            {previewHidden ? (
              <div className="text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Preview hidden
                </p>
              </div>
            ) : (
              <>
                <div
                  ref={qrRef}
                  className="flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                  style={{ opacity: visible && !isGenerating ? 1 : 0.3, transition: 'opacity 0.3s ease' }}
                />
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm2 2v3h3V5h-3zM5 5v3h3V5H5zm0 11v3h3v-3H5zm9 1h1v1h-1v-1zm2 0h1v1h-1v-1zm2 0h1v1h-1v-1zm0 2h1v1h-1v-1zm-2 2h1v1h-1v-1zm2 0h1v1h-1v-1zm-4-2h1v1h-1v-1zm0 2h1v1h-1v-1z" />
            </svg>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-3">
              Enter data to generate QR code
            </p>
          </div>
        )}
      </div>

      {/* Controls: Status + Hide/Show + Refresh */}
      {hasPayload && (
        <div className="flex items-center gap-3 text-sm flex-wrap justify-center">
          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Ready to scan
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            onClick={() => {
              const wasHidden = previewHidden;
              setPreviewHidden(!previewHidden);
              if (wasHidden) refresh();
            }}
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label={previewHidden ? 'Show QR preview' : 'Hide QR preview'}
          >
            {previewHidden ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            )}
            {previewHidden ? 'Show' : 'Hide'}
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label="Regenerate QR code"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

export type { QRGeneratorOptions };
