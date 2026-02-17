import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type {
  Options as QROptions,
  DotType,
  CornerSquareType,
} from 'qr-code-styling';

export interface QRGeneratorOptions {
  data: string;
  width?: number;
  height?: number;
  fgColor?: string;
  bgColor?: string;
  gradientType?: 'linear' | 'none';
  gradientColor1?: string;
  gradientColor2?: string;
  logo?: string | null;
  logoSize?: number;
  cornerStyle?: 'square' | 'extra-rounded' | 'dot';
  dotStyle?: 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded';
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
}

export function useQRGenerator(options: QRGeneratorOptions) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);
  const [qrInstance, setQrInstance] = useState<QRCodeStyling | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const qrOptions = useMemo((): QROptions => {
    const ec = options.logo ? 'H' : (options.errorCorrection ?? 'M');
    const width = options.width ?? 300;

    const dotsColor =
      options.gradientType === 'linear' &&
      options.gradientColor1 &&
      options.gradientColor2
        ? undefined
        : (options.fgColor ?? '#000000');

    const dotsGradient =
      options.gradientType === 'linear' &&
      options.gradientColor1 &&
      options.gradientColor2
        ? {
            type: 'linear' as const,
            colorStops: [
              { offset: 0, color: options.gradientColor1 },
              { offset: 1, color: options.gradientColor2 },
            ],
          }
        : undefined;

    return {
      width,
      height: options.height ?? width,
      data: options.data || ' ',
      margin: options.margin ?? 4,
      type: 'svg',
      image: options.logo ?? undefined,
      dotsOptions: {
        color: dotsColor,
        gradient: dotsGradient,
        type: (options.dotStyle ?? 'square') as DotType,
      },
      cornersSquareOptions: {
        color: dotsColor,
        gradient: dotsGradient,
        type: (options.cornerStyle ?? 'square') as CornerSquareType,
      },
      cornersDotOptions: {
        color: dotsColor,
        gradient: dotsGradient,
      },
      backgroundOptions: {
        color: options.bgColor ?? '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 4,
        imageSize: options.logoSize ?? 0.2,
      },
      qrOptions: {
        errorCorrectionLevel: ec,
      },
    };
  }, [options, renderKey]);

  // Recreate instance whenever options change
  useEffect(() => {
    if (!qrRef.current) return;

    setIsGenerating(true);

    // Clean up previous
    qrRef.current.innerHTML = '';
    qrInstanceRef.current = null;

    const instance = new QRCodeStyling(qrOptions);
    qrInstanceRef.current = instance;
    setQrInstance(instance);
    instance.append(qrRef.current);

    // Brief delay for SVG to render
    const timer = setTimeout(() => setIsGenerating(false), 100);

    return () => {
      clearTimeout(timer);
    };
  }, [qrOptions]);

  const refresh = useCallback(() => {
    setRenderKey((k) => k + 1);
  }, []);

  return {
    qrRef,
    qrInstance,
    isGenerating,
    refresh,
  };
}
