import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  src: string;
  alt: string;
  title?: string;
  onClose: () => void;
}

export default function ImageLightbox({
  isOpen,
  src,
  alt,
  title,
  onClose,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-3 sm:p-6">
      <button
        type="button"
        aria-label="지도 모달 닫기"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold sm:text-lg">{title ?? alt}</h2>
            <p className="text-xs text-slate-300 sm:text-sm">클릭하거나 확대해서 크게 볼 수 있습니다.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-3 sm:p-6">
          <img
            src={src}
            alt={alt}
            className="mx-auto max-h-full min-h-full w-auto min-w-full rounded-2xl bg-white object-contain shadow-[0_20px_60px_rgba(15,23,42,0.45)]"
          />
        </div>
      </div>
    </div>
  );
}
