import { useEffect } from 'react';
import { X, BookOpen, CalendarDays, MapPin, User, Hash } from 'lucide-react';
import type { ParsedSubject, ParsedTimePlace } from '../lib/data';
import { useCampus } from '../lib/campus';

const DAY_LABELS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

interface LectureDetailModalProps {
  isOpen: boolean;
  subject: ParsedSubject | null;
  timeplace: ParsedTimePlace | null;
  isCurrent?: boolean;
  currentBadgeLabel?: string;
  onClose: () => void;
}

const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export default function LectureDetailModal({
  isOpen,
  subject,
  timeplace,
  isCurrent = false,
  currentBadgeLabel = '현재 진행 중',
  onClose,
}: LectureDetailModalProps) {
  const { campusData } = useCampus();
  const { formatPlaceLabel } = campusData;

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

  if (!isOpen || !subject || !timeplace) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-4 sm:items-center">
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {isCurrent && (
                <div className="mb-2 inline-flex rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm">
                  {currentBadgeLabel}
                </div>
              )}
              <h2 className="text-xl font-extrabold leading-tight">{subject.name}</h2>
              <p className="mt-1 text-sm font-medium text-cyan-50">{subject.professor} 교수님</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/25"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <CalendarDays size={18} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Time</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {DAY_LABELS[timeplace.day] ?? '요일 정보 없음'} {formatTime(timeplace.startMin)} - {formatTime(timeplace.endMin)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Place</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatPlaceLabel(timeplace.building, timeplace.room)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">강의실 코드 {timeplace.place}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <BookOpen size={18} className="mt-0.5 shrink-0 text-violet-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Type</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{subject.type || '유형 정보 없음'}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{subject.credit}학점</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <User size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Professor</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{subject.professor}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{subject.grade}학년 대상</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <Hash size={18} className="mt-0.5 shrink-0 text-rose-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Lecture</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{subject.code}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
            작은 시간표 블록에서 잘린 정보는 여기서 전체로 확인할 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
