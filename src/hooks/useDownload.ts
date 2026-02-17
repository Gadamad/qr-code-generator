import { useCallback } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import { jsPDF } from 'jspdf';

async function getRawBlob(instance: QRCodeStyling, ext: 'png' | 'svg' = 'png'): Promise<Blob | null> {
  const raw = await instance.getRawData(ext);
  if (!raw) return null;
  // In browser, getRawData returns Blob; cast to satisfy union type
  return raw as Blob;
}

export function useDownload(qrInstance: QRCodeStyling | null) {
  const downloadPNG = useCallback(
    async (filename: string = 'qrcode') => {
      if (!qrInstance) return;
      await qrInstance.download({
        name: filename,
        extension: 'png',
      });
    },
    [qrInstance],
  );

  const downloadSVG = useCallback(
    async (filename: string = 'qrcode') => {
      if (!qrInstance) return;
      await qrInstance.download({
        name: filename,
        extension: 'svg',
      });
    },
    [qrInstance],
  );

  const downloadJPEG = useCallback(
    async (filename: string = 'qrcode') => {
      if (!qrInstance) return;
      const blob = await getRawBlob(qrInstance);
      if (!blob) return;

      const img = new Image();
      const url = URL.createObjectURL(blob);

      await new Promise<void>((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve();
            return;
          }
          // JPEG needs white background (no transparency)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(jpegBlob);
                link.download = `${filename}.jpeg`;
                link.click();
                URL.revokeObjectURL(link.href);
              }
              resolve();
            },
            'image/jpeg',
            0.95,
          );
        };
        img.src = url;
      });

      URL.revokeObjectURL(url);
    },
    [qrInstance],
  );

  const downloadPDF = useCallback(
    async (filename: string = 'qrcode', label?: string) => {
      if (!qrInstance) return;
      const blob = await getRawBlob(qrInstance);
      if (!blob) return;

      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const qrSize = 80;
      const x = (pageWidth - qrSize) / 2;
      const y = 40;

      pdf.addImage(dataUrl, 'PNG', x, y, qrSize, qrSize);

      if (label) {
        pdf.setFontSize(14);
        pdf.setTextColor(51, 51, 51);
        const textWidth = pdf.getTextWidth(label);
        pdf.text(label, (pageWidth - textWidth) / 2, y + qrSize + 12);
      }

      pdf.save(`${filename}.pdf`);
    },
    [qrInstance],
  );

  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    if (!qrInstance) return false;
    try {
      const blob = await getRawBlob(qrInstance);
      if (!blob) return false;
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return true;
    } catch {
      return false;
    }
  }, [qrInstance]);

  const share = useCallback(
    async (title: string = 'QR Code'): Promise<boolean> => {
      if (!qrInstance || !navigator.share) return false;
      try {
        const blob = await getRawBlob(qrInstance);
        if (!blob) return false;
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        await navigator.share({
          title,
          files: [file],
        });
        return true;
      } catch {
        return false;
      }
    },
    [qrInstance],
  );

  return {
    downloadPNG,
    downloadSVG,
    downloadPDF,
    downloadJPEG,
    copyToClipboard,
    share,
  };
}
