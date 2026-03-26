import { useMemo, useState } from 'react';
import { Search, User, Calendar as CalendarIcon, BookOpen, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { isCurrentTimePlace, useCurrentTime } from '../lib/currentTime';
import { useCampus } from '../lib/campus';

const DAYS = ['월', '화', '수', '목', '금'];
const START_HOUR = 9;
const END_HOUR = 21;
const HOUR_HEIGHT = 64;
const TIME_COLUMN_WIDTH = 32;

export default function ProfessorSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const now = useCurrentTime();
  const { campusData } = useCampus();
  const { formatPlaceLabel, scheduleByProfessor, shortLabel } = campusData;

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

  const buildProfessorStatusText = (
    prof: string,
    currentItem: { subject: (typeof results)[number]['subjects'][number]; timeplace: (typeof results)[number]['subjects'][number]['parsedTimeplaces'][number] } | undefined
  ) => {
    if (!currentItem) {
      return `${prof} 교수님의 현재 수업 정보가 없어요. 😭😭😭`;
    }

    const placeLabel = formatPlaceLabel(currentItem.timeplace.building, currentItem.timeplace.room);

    return `${prof} 교수님은 ${placeLabel}에서 ${currentItem.subject.name} 수업 중이세요.`;
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2 px-2">
        <h1 className="text-2xl font-extrabold text-slate-900">교수님 찾기</h1>
        <p className="text-sm font-medium text-slate-500">우리 교수님, 지금은 뭐하고 계실까?</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="교수님 이름 검색"
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
            .filter(item => item.timeplace.day < DAYS.length)
            .sort((a, b) => a.timeplace.day - b.timeplace.day || a.timeplace.startMin - b.timeplace.startMin);
          const currentItem = scheduleItems.find(item => isCurrentTimePlace(item.timeplace, now));
          const statusText = buildProfessorStatusText(prof, currentItem);

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

              <div className="px-5 py-4 border-b border-slate-100">
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm font-semibold',
                    currentItem ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-600'
                  )}
                >
                  {statusText}
                </div>
              </div>

              <div className="overflow-hidden px-1.5 py-3 sm:px-4">
                <div
                  className="grid border-b-2 border-slate-200 pb-2 mb-2"
                  style={{ gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(${DAYS.length}, minmax(0, 1fr))` }}
                >
                  <div />
                  {DAYS.map(day => (
                    <div key={day} className="text-center text-[11px] font-bold text-slate-700 sm:text-sm">{day}</div>
                  ))}
                </div>

                <div className="relative mt-2" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
                  {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                    <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: `${i * HOUR_HEIGHT}px` }}>
                      <div
                        className="text-center text-[10px] font-medium text-slate-400 -mt-2.5 bg-white inline-block"
                        style={{ width: `${TIME_COLUMN_WIDTH}px` }}
                      >
                        {START_HOUR + i}
                      </div>
                    </div>
                  ))}

                  {Array.from({ length: DAYS.length }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-full border-l border-slate-100/70"
                      style={{ left: `calc(${TIME_COLUMN_WIDTH}px + ${(i + 1)} * ((100% - ${TIME_COLUMN_WIDTH}px) / ${DAYS.length}))` }}
                    />
                  ))}

                  {scheduleItems.map((item, idx) => {
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
                      <div
                        key={`${item.subject.lectureId}-${idx}`}
                        className={cn(
                          'absolute rounded-xl px-1.5 py-1.5 sm:rounded-2xl sm:px-3 sm:py-2 overflow-hidden border transition-all',
                          isCurrent
                            ? 'z-10 border-emerald-300 bg-gradient-to-br from-emerald-100 via-cyan-50 to-white shadow-md shadow-emerald-100/80 ring-2 ring-emerald-200/80'
                            : 'border-slate-200 bg-slate-50/95 shadow-sm shadow-slate-200/60 hover:border-emerald-200 hover:bg-slate-50'
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `calc(${TIME_COLUMN_WIDTH}px + ${item.timeplace.day} * ((100% - ${TIME_COLUMN_WIDTH}px) / ${DAYS.length}) + 2px)`,
                          width: `calc(((100% - ${TIME_COLUMN_WIDTH}px) / ${DAYS.length}) - 4px)`,
                        }}
                      >
                        {showCurrentBadge && (
                          <div className="mb-1 inline-flex rounded-full bg-emerald-600/10 px-1 py-0.5 text-[9px] font-bold text-emerald-700 sm:px-1.5 sm:text-[10px]">
                            진행 중
                          </div>
                        )}
                        <div className={cn(
                          'text-[11px] font-extrabold leading-tight break-words sm:text-xs',
                          isCurrent ? 'text-slate-950' : 'text-slate-800'
                        )}>
                          {item.subject.name}
                        </div>
                        {showTime && (
                          <div className={cn(
                            'mt-1 text-[10px] sm:text-[11px]',
                            isCurrent ? 'font-semibold text-emerald-700' : 'font-medium text-slate-600'
                          )}>
                            {formatTime(item.timeplace.startMin)} - {formatTime(item.timeplace.endMin)}
                          </div>
                        )}
                        {showPlace && (
                          <div className={cn(
                            'mt-1 flex items-center text-[9px] sm:text-[10px]',
                            isCurrent ? 'font-medium text-slate-700' : 'font-medium text-slate-500'
                          )}>
                            <MapPin size={10} className={cn('mr-1 shrink-0 sm:h-[11px] sm:w-[11px]', isCurrent ? 'text-emerald-500' : 'text-slate-400')} />
                            <span className="truncate">{formatPlaceLabel(item.timeplace.building, item.timeplace.room)}</span>
                          </div>
                        )}
                        {showType && (
                          <div className={cn(
                            'mt-1 flex items-center text-[9px] sm:text-[10px]',
                            isCurrent ? 'font-medium text-slate-600' : 'font-medium text-slate-400'
                          )}>
                            <BookOpen size={10} className={cn('mr-1 shrink-0 sm:h-[11px] sm:w-[11px]', isCurrent ? 'text-emerald-500' : 'text-slate-400')} />
                            <span className="truncate">{item.subject.type}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
