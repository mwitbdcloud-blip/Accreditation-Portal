import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, Undo2, Upload, PenTool, Sparkles, Image as ImageIcon } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  initialValue?: string;
  disabled?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  initialValue,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(initialValue));
  const [confirmed, setConfirmed] = useState(Boolean(initialValue));
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);

    ctx.strokeStyle = '#0f2b5c'; // Megaworld navy blue
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialValue && initialValue.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
        setConfirmed(true);
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setHistory((prev) => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || confirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveHistoryState();
    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || confirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setConfirmed(false);
    setUploadSuccessMessage(null);
    setHistory([]);
    onSave('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const undo = () => {
    if (history.length === 0 || confirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    const previousState = newHistory.pop();
    setHistory(newHistory);

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setConfirmed(true);
    onSave(dataUrl);
  };

  // Upload photo with auto remove background
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          setIsProcessingUpload(false);
          return;
        }

        // Offscreen canvas to process the photo
        const offCanvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        offCanvas.width = w;
        offCanvas.height = h;
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) {
          setIsProcessingUpload(false);
          return;
        }

        offCtx.drawImage(img, 0, 0, w, h);
        const imgData = offCtx.getImageData(0, 0, w, h);
        const d = imgData.data;

        // Auto background removal:
        // Paper background is usually lighter than the pen/marker ink.
        // We calculate luminance and threshold out the light paper background.
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

          if (brightness > 185) {
            // Paper background -> 100% transparent
            d[i + 3] = 0;
          } else if (brightness > 140) {
            // Edge feathering
            const alpha = ((185 - brightness) / 45) * 255;
            d[i + 3] = Math.round(alpha);
            // Convert to rich Megaworld navy ink
            d[i] = 15;
            d[i + 1] = 43;
            d[i + 2] = 92;
          } else {
            // Dark ink stroke -> solid navy ink
            d[i] = 15;
            d[i + 1] = 43;
            d[i + 2] = 92;
            d[i + 3] = 255;
          }
        }

        offCtx.putImageData(imgData, 0, 0);
        const transparentPng = offCanvas.toDataURL('image/png');

        // Draw onto the display canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = canvas.getBoundingClientRect();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Scale to fit nicely in canvas
          const renderRatio = Math.min((rect.width * 0.9) / w, (rect.height * 0.9) / h, 1);
          const drawW = w * renderRatio;
          const drawH = h * renderRatio;
          const drawX = (rect.width - drawW) / 2;
          const drawY = (rect.height - drawH) / 2;

          const renderedImg = new Image();
          renderedImg.onload = () => {
            ctx.drawImage(renderedImg, drawX, drawY, drawW, drawH);
            setHasDrawn(true);
            setConfirmed(true);
            setUploadSuccessMessage('Background removed automatically. Clean transparent signature generated.');
            setIsProcessingUpload(false);
            onSave(transparentPng);
          };
          renderedImg.src = transparentPng;
        } else {
          setIsProcessingUpload(false);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div id="signature-pad-container" className="space-y-3">
      {/* Mode Selector: Draw vs Upload Photo */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSignatureMode('draw')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
              signatureMode === 'draw'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> Draw Signature
          </button>
          <button
            type="button"
            onClick={() => setSignatureMode('upload')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
              signatureMode === 'upload'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload Photo (Auto-Remove Background)
          </button>
        </div>

        {uploadSuccessMessage && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Auto-Background Removed
          </span>
        )}
      </div>

      {/* Upload Box if in upload mode and hasn't confirmed yet */}
      {signatureMode === 'upload' && !confirmed && (
        <div className="p-4 bg-blue-50/60 rounded-xl border-2 border-dashed border-blue-200 text-center space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
            id="signature-photo-input"
          />
          <div className="flex justify-center">
            <span className="p-3 bg-white rounded-full text-blue-900 shadow-xs border border-blue-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Upload Photo of Handwritten Signature</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Take a photo of your signature written on paper. Our system will automatically remove the paper background and isolate the ink into a transparent signature.
            </p>
          </div>
          <label
            htmlFor="signature-photo-input"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            {isProcessingUpload ? 'Processing & Removing Background...' : 'Choose Signature Photo (JPG / PNG)'}
          </label>
        </div>
      )}

      <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/60 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          id="signature-canvas"
          className={`w-full h-44 touch-none cursor-crosshair ${
            confirmed ? 'bg-emerald-50/30' : 'bg-white'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {!hasDrawn && !confirmed && signatureMode === 'draw' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm">
            <span>✍️ Draw your official signature here using mouse or finger</span>
          </div>
        )}

        {confirmed && (
          <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
            <Check className="w-3.5 h-3.5" /> Signature Confirmed
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="clear-signature-btn"
            onClick={clear}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            <Eraser className="w-3.5 h-3.5" /> Clear
          </button>
          {signatureMode === 'draw' && (
            <button
              type="button"
              id="undo-signature-btn"
              onClick={undo}
              disabled={disabled || history.length === 0 || confirmed}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </button>
          )}
        </div>

        <div>
          {!confirmed ? (
            <button
              type="button"
              id="confirm-signature-btn"
              onClick={handleConfirm}
              disabled={disabled || !hasDrawn}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-40 rounded-lg shadow-sm transition"
            >
              <Check className="w-3.5 h-3.5" /> Confirm Signature
            </button>
          ) : (
            <button
              type="button"
              id="reedit-signature-btn"
              onClick={() => {
                setConfirmed(false);
                setUploadSuccessMessage(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              Change Signature
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

