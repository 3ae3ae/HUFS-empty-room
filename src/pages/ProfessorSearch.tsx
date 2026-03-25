import { useMemo, useState } from 'react';
import { formatPlaceLabel, scheduleByProfessor } from '../lib/data';
import { Search, User, Calendar as CalendarIcon, BookOpen, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { isCurrentTimePlace, useCurrentTime } from '../lib/currentTime';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const START_HOUR = 9;
const END_HOUR = 21;
const HOUR_HEIGHT = 64;

export default function ProfessorSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const now = useCurrentTime();

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];

    return Object.entries(scheduleByProfessor)
      .filter(([prof]) => prof.includes(searchTerm))
      .map(([prof, subjects]) => ({ prof, subjects }));
  }, [searchTerm]);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2 px-2">
        <h1 className="text-2xl font-extrabold text-slate-900">교수님 스케줄 검색</h1>
        <p className="text-sm font-medium text-slate-500">교수님 이름으로 이번 학기 담당 수업을 시간표 형태로 확인하세요.</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="교수님 이름 검색 (예: 홍지훈)"
          className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      <div className="space-y-5">
        {results.map(({ prof, subjects }) => {
          const scheduleItems = subjects
            .flatMap(subject =>
              subject.parsedTimeplaces.map(timeplace => ({
                subject,
                timeplace,
              }))
            )
            .sort((a, b) => a.timeplace.day - b.timeplace.day || a.timeplace.startMin - b.timeplace.startMin);

          return (
            <div key={prof} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mr-4 shadow-sm shadow-blue-100/50">
                    <User size={24} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-slate-900 text-lg truncate">{prof} 교수님</h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">총 {subjects.length}개 과목, {scheduleItems.length}개 시간 블록</p>
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

                    {scheduleItems.map((item, idx) => {
                      const top = (item.timeplace.startMin - START_HOUR * 60) * (HOUR_HEIGHT / 60);
                      const height = (item.timeplace.endMin - item.timeplace.startMin) * (HOUR_HEIGHT / 60);
                      const isCurrent = isCurrentTimePlace(item.timeplace, now);

                      if (top < 0 || top + height > (END_HOUR - START_HOUR) * HOUR_HEIGHT) {
                        return null;
                      }

                      return (
                        <div
                          key={`${item.subject.lectureId}-${idx}`}
                          className={cn(
                            'absolute rounded-2xl px-3 py-2 overflow-hidden border transition-all',
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
                          {isCurrent && (
                            <div className="mb-1 inline-flex rounded-full bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              진행 중
                            </div>
                          )}
                          <div className={cn(
                            'text-xs font-extrabold leading-tight line-clamp-2',
                            isCurrent ? 'text-slate-950' : 'text-slate-800'
                          )}>
                            {item.subject.name}
                          </div>
                          <div className={cn(
                            'mt-1 text-[11px]',
                            isCurrent ? 'font-semibold text-emerald-700' : 'font-medium text-slate-600'
                          )}>
                            {formatTime(item.timeplace.startMin)} - {formatTime(item.timeplace.endMin)}
                          </div>
                          <div className={cn(
                            'mt-1 flex items-center text-[10px]',
                            isCurrent ? 'font-medium text-slate-700' : 'font-medium text-slate-500'
                          )}>
                            <MapPin size={11} className={cn('mr-1 shrink-0', isCurrent ? 'text-emerald-500' : 'text-slate-400')} />
                            <span className="truncate">{formatPlaceLabel(item.timeplace.building, item.timeplace.room)}</span>
                          </div>
                          <div className={cn(
                            'mt-1 flex items-center text-[10px]',
                            isCurrent ? 'font-medium text-slate-600' : 'font-medium text-slate-400'
                          )}>
                            <BookOpen size={11} className={cn('mr-1 shrink-0', isCurrent ? 'text-emerald-500' : 'text-slate-400')} />
                            <span className="truncate">{item.subject.type}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {searchTerm && results.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-900 font-bold text-lg mb-1">검색 결과가 없습니다</p>
            <p className="text-slate-500 text-sm">다른 이름으로 검색해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
