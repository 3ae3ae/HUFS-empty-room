import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatPlaceLabel, scheduleByPlace } from '../lib/data';
import { Search, ChevronLeft, Calendar as CalendarIcon, BookOpen, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { isCurrentTimePlace, useCurrentTime } from '../lib/currentTime';
import LectureDetailModal from '../components/LectureDetailModal';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const START_HOUR = 9;
const END_HOUR = 21;
const HOUR_HEIGHT = 64;

export default function Timetable() {
  const { place } = useParams();
  const navigate = useNavigate();
  const [searchPlace, setSearchPlace] = useState(place || '');
  const [selectedLectureIndex, setSelectedLectureIndex] = useState<number | null>(null);
  const now = useCurrentTime();

  const schedule = useMemo(() => {
    if (!searchPlace) return [];
    return scheduleByPlace[searchPlace] || [];
  }, [searchPlace]);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/timetable/${searchPlace}`);
  };

  const searchBuilding = searchPlace.charAt(0);
  const searchRoom = searchPlace.substring(1);
  const selectedLecture = selectedLectureIndex === null ? null : schedule[selectedLectureIndex] ?? null;

  return (
    <>
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3 px-2">
          <button onClick={() => navigate(-1)} className="p-2.5 -ml-2.5 text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">강의실 시간표</h1>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={searchPlace}
            onChange={e => {
              setSearchPlace(e.target.value);
              setSelectedLectureIndex(null);
            }}
            placeholder="건물/강의실 검색 (예: 0209)"
            className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </form>

        {searchPlace && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <div className="flex items-center min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mr-4 shadow-sm shadow-blue-100/50">
                  <CalendarIcon size={24} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-extrabold text-slate-900 text-lg truncate">{formatPlaceLabel(searchBuilding, searchRoom)}</h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">강의 블록을 클릭하면 전체 정보를 볼 수 있습니다.</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
                <CalendarIcon size={14} className="mr-1.5" />
                주간 시간표
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[820px] p-4">
                <div className="grid grid-cols-8 border-b-2 border-slate-200 pb-2 mb-2">
                  <div className="text-center text-xs font-bold text-slate-400">시간</div>
                  {DAYS.map(day => (
                    <div key={day} className="text-center text-sm font-bold text-slate-700">{day}</div>
                  ))}
                </div>

                <div className="relative mt-2" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
                  {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                    <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: `${i * HOUR_HEIGHT}px` }}>
                      <div className="w-1/8 text-center text-xs font-medium text-slate-400 -mt-2.5 bg-white inline-block px-1">
                        {`${(START_HOUR + i).toString().padStart(2, '0')}:00`}
                      </div>
                    </div>
                  ))}

                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="absolute h-full border-l border-slate-100/70" style={{ left: `${(i + 1) * (100 / 8)}%` }} />
                  ))}

                  {schedule.map((item, idx) => {
                    const top = (item.timeplace.startMin - START_HOUR * 60) * (HOUR_HEIGHT / 60);
                    const height = (item.timeplace.endMin - item.timeplace.startMin) * (HOUR_HEIGHT / 60);
                    const isCurrent = isCurrentTimePlace(item.timeplace, now);
                    const showCurrentBadge = isCurrent && height >= 56;
                    const showTime = height >= 42;
                    const showPlace = height >= 58;
                    const showType = height >= 76;

                    if (top < 0 || top + height > (END_HOUR - START_HOUR) * HOUR_HEIGHT) {
                      return null;
                    }

                    return (
                      <button
                        key={`${item.subject.lectureId}-${idx}`}
                        type="button"
                        onClick={() => setSelectedLectureIndex(idx)}
                        className={cn(
                          'absolute flex flex-col items-start justify-start rounded-2xl px-3 py-2 overflow-hidden border transition-all text-left cursor-pointer',
                          selectedLectureIndex === idx && 'ring-2 ring-blue-300',
                          isCurrent
                            ? 'z-10 border-emerald-300 bg-gradient-to-br from-emerald-100 via-cyan-50 to-white shadow-md shadow-emerald-100/80 ring-2 ring-emerald-200/80'
                            : 'border-slate-200 bg-slate-50/95 shadow-sm shadow-slate-200/60 hover:border-emerald-200 hover:bg-slate-50'
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `calc(${(item.timeplace.day + 1) * (100 / 8)}% + 4px)`,
                          width: `calc(${100 / 8}% - 8px)`,
                        }}
                      >
                        {showCurrentBadge && (
                          <div className="mb-1 inline-flex rounded-full bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            진행 중
                          </div>
                        )}
                        <div className={cn(
                          'shrink-0 text-xs font-extrabold leading-tight',
                          height < 42 ? 'line-clamp-1' : 'line-clamp-2',
                          isCurrent ? 'text-slate-950' : 'text-slate-800'
                        )}>
                          {item.subject.name}
                        </div>
                        {showTime && (
                          <div className={cn(
                            'mt-1 shrink-0 text-[11px]',
                            isCurrent ? 'font-semibold text-emerald-700' : 'font-medium text-slate-600'
                          )}>
                            {formatTime(item.timeplace.startMin)} - {formatTime(item.timeplace.endMin)}
                          </div>
                        )}
                        {showPlace && (
                          <div className={cn(
                            'mt-1 flex shrink-0 items-center text-[10px]',
                            isCurrent ? 'font-medium text-slate-700' : 'font-medium text-slate-500'
                          )}>
                            <MapPin size={11} className={cn('mr-1 shrink-0', isCurrent ? 'text-emerald-500' : 'text-slate-400')} />
                            <span className="truncate">{formatPlaceLabel(item.timeplace.building, item.timeplace.room)}</span>
                          </div>
                        )}
                        {showType && (
                          <div className={cn(
                            'mt-1 flex shrink-0 items-center text-[10px]',
                            isCurrent ? 'font-medium text-slate-600' : 'font-medium text-slate-400'
                          )}>
                            <BookOpen size={11} className={cn('mr-1 shrink-0', isCurrent ? 'text-emerald-500' : 'text-slate-400')} />
                            <span className="truncate">{item.subject.type}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {searchPlace && schedule.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-900 font-bold text-lg mb-1">시간표 정보가 없습니다</p>
            <p className="text-slate-500 text-sm">해당 강의실의 이번 학기 일정이 없습니다.</p>
          </div>
        )}
      </div>

      <LectureDetailModal
        isOpen={selectedLecture !== null}
        subject={selectedLecture?.subject ?? null}
        timeplace={selectedLecture?.timeplace ?? null}
        isCurrent={selectedLecture ? isCurrentTimePlace(selectedLecture.timeplace, now) : false}
        onClose={() => setSelectedLectureIndex(null)}
      />
    </>
  );
}
