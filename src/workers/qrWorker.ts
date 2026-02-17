import QRCodeStyling from 'qr-code-styling';

export interface WorkerGenerateMessage {
  type: 'generate';
  items: string[];
  options: {
    width: number;
    height: number;
    fgColor: string;
    bgColor: string;
    dotStyle: string;
    cornerStyle: string;
    errorCorrection: 'L' | 'M' | 'Q' | 'H';
    margin: number;
  };
}

export interface WorkerProgressMessage {
  type: 'progress';
  current: number;
  total: number;
}

export interface WorkerResultMessage {
  type: 'result';
  index: number;
  blob: Blob;
}

export interface WorkerCompleteMessage {
  type: 'complete';
}

export interface WorkerErrorMessage {
  type: 'error';
  message: string;
  index?: number;
}

export type WorkerOutMessage =
  | WorkerProgressMessage
  | WorkerResultMessage
  | WorkerCompleteMessage
  | WorkerErrorMessage;

const ctx = self as unknown as Worker;

ctx.addEventListener('message', async (e: MessageEvent<WorkerGenerateMessage>) => {
  const { items, options } = e.data;
  const total = items.length;

  for (let i = 0; i < total; i++) {
    try {
      const qr = new QRCodeStyling({
        width: options.width,
        height: options.height,
        data: items[i] || ' ',
        margin: options.margin,
        type: 'canvas',
        dotsOptions: {
          color: options.fgColor,
          type: options.dotStyle as 'square',
        },
        cornersSquareOptions: {
          color: options.fgColor,
          type: options.cornerStyle as 'square',
        },
        cornersDotOptions: {
          color: options.fgColor,
        },
        backgroundOptions: {
          color: options.bgColor,
        },
        qrOptions: {
          errorCorrectionLevel: options.errorCorrection,
        },
      });

      const raw = await qr.getRawData('png');
      if (raw) {
        const blob: Blob = raw instanceof Blob ? raw : new Blob([raw as BlobPart]);
        ctx.postMessage({ type: 'result', index: i, blob } satisfies WorkerResultMessage);
      }
    } catch (err) {
      ctx.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : 'Generation failed',
        index: i,
      } satisfies WorkerErrorMessage);
    }

    ctx.postMessage({ type: 'progress', current: i + 1, total } satisfies WorkerProgressMessage);
  }

  ctx.postMessage({ type: 'complete' } satisfies WorkerCompleteMessage);
});
