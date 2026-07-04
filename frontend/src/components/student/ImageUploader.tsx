import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onImageSelect: (file: File, base64: string) => void;
  onRemove?: () => void;
  onAnalyze: (file: File) => Promise<void>;
  analyzing: boolean;
}

export default function ImageUploader({ onImageSelect, onRemove, onAnalyze, analyzing }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generatePreview = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = reject;
      img.src = url;
    });

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    setSelectedFile(file);
    try {
      const previewBase64 = await generatePreview(file);
      setPreview(previewBase64);
      // Pass the original File (for multipart upload) and base64 (for AI preview)
      onImageSelect(file, previewBase64);
    } catch {
      toast.error('Could not process the image. Try a different file.');
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemove?.();
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        📸 Attach Photo
        <span className="text-xs font-normal text-gray-400">(optional — AI will analyze it)</span>
      </label>

      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${isDragging
              ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
              : 'border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center gap-2">
            <div className={`text-3xl transition-transform duration-200 ${isDragging ? 'scale-125' : ''}`}>
              🖼️
            </div>
            <p className="text-sm font-medium text-gray-600">
              {isDragging ? 'Drop it here!' : 'Drag & drop an image, or click to browse'}
            </p>
            <p className="text-xs text-gray-400">JPEG, PNG, WEBP up to 10MB</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          <img
            src={preview}
            alt="Issue preview"
            className="w-full max-h-56 object-cover"
          />
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 gap-2">
            <button
              type="button"
              onClick={() => selectedFile && onAnalyze(selectedFile)}
              disabled={analyzing}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all
                ${analyzing
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                }
              `}
            >
              {analyzing ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>✨ Analyze with AI</>
              )}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-black/40 hover:bg-black/60 transition-all active:scale-95"
            >
              ✕ Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
