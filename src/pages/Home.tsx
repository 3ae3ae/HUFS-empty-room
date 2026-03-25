import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildings, formatPlaceLabel, getBuildingName, scheduleByPlace, roomsByBuilding } from '../lib/data';
import { ChevronDown, Clock, MapPin, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import campusMap from '../assets/campus_map.jpg';
import ImageLightbox from '../components/ImageLightbox';

const hourOptions = Array.from({ length: 12 }, (_, index) => index + 9);

const formatHourValue = (hour: number) => hour.toString().padStart(2, '0');

const formatHourLabel = (hour: string) => `${hour}시`;

export default function Home() {
  const navigate = useNavigate();
  const initialNow = new Date();
  const [timeMode, setTimeMode] = useState<'now' | 'custom'>('now');
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([...buildings]);

  const [customDay, setCustomDay] = useState<number>(initialNow.getDay() === 0 ? 6 : initialNow.getDay() - 1);
  const [customStartTime, setCustomStartTime] = useState<string>(formatHourValue(initialNow.getHours()));
  const [customEndTime, setCustomEndTime] = useState<string>('');

  const [currentTime, setCurrentTime] = useState(initialNow);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (timeMode === 'now') {
      const timer = setInterval(() => setCurrentTime(new Date()), 60000);
      return () => clearInterval(timer);
    }
  }, [timeMode]);

  const targetDay = timeMode === 'now' ? (currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1) : customDay;
  const startMin = timeMode === 'now'
    ? currentTime.getHours() * 60 + currentTime.getMinutes()
    : parseInt(customStartTime, 10) * 60;
  const endMin = timeMode === 'custom' && customEndTime ? parseInt(customEndTime, 10) * 60 : null;
  const hasInvalidRange = endMin !== null && endMin <= startMin;

  const emptyRooms = useMemo(() => {
    if (hasInvalidRange) {
      return [];
    }

    const result: { building: string, room: string, place: string, emptyUntil: number | null }[] = [];
    
    Object.entries(roomsByBuilding).forEach(([bldg, rooms]) => {
      if (!selectedBuildings.includes(bldg)) return;
      
      rooms.forEach(room => {
        const place = bldg + room;
        const classes = scheduleByPlace[place] || [];
        const todayClasses = classes.filter(c => c.timeplace.day === targetDay).sort((a, b) => a.timeplace.startMin - b.timeplace.startMin);
        
        let isCurrentlyEmpty = true;
        let emptyUntil: number | null = null;
        
        for (const c of todayClasses) {
          const overlapsStart = startMin >= c.timeplace.startMin && startMin < c.timeplace.endMin;
          const overlapsRange = endMin !== null && c.timeplace.startMin < endMin && c.timeplace.endMin > startMin;

          if (overlapsStart || overlapsRange) {
            isCurrentlyEmpty = false;
            break;
          }
          if (c.timeplace.startMin > startMin) {
            emptyUntil = c.timeplace.startMin;
            break;
          }
        }
        
        if (isCurrentlyEmpty) {
          result.push({ building: bldg, room, place, emptyUntil });
        }
      });
    });
    
    return result.sort((a, b) => a.building.localeCompare(b.building) || a.room.localeCompare(b.room));
  }, [endMin, hasInvalidRange, selectedBuildings, startMin, targetDay]);

  const groupedEmptyRooms = useMemo(() => {
    return emptyRooms.reduce<Record<string, typeof emptyRooms>>((acc, room) => {
      if (!acc[room.building]) {
        acc[room.building] = [];
      }
      acc[room.building].push(room);
      return acc;
    }, {});
  }, [emptyRooms]);

  useEffect(() => {
    setExpandedBuildings(prev => {
      const next = Object.keys(groupedEmptyRooms).reduce<Record<string, boolean>>((acc, building) => {
        acc[building] = prev[building] ?? false;
        return acc;
      }, {});
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, [groupedEmptyRooms]);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const toggleAll = () => {
    if (selectedBuildings.length === buildings.length) {
      setSelectedBuildings([]);
    } else {
      setSelectedBuildings([...buildings]);
    }
  };

  const toggleBuilding = (bldg: string) => {
    setSelectedBuildings(prev => {
      if (prev.length === buildings.length) {
        // If "All" is currently active, clicking a specific building should deselect that building
        // and leave the rest selected.
        return prev.filter(b => b !== bldg);
      }
      
      const next = prev.includes(bldg) ? prev.filter(b => b !== bldg) : [...prev, bldg];
      return next;
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '좋은 아침입니다! ☀️';
    if (hour < 18) return '활기찬 오후 되세요! ☕';
    return '편안한 저녁 되세요! 🌙';
  };

  const toggleExpandedBuilding = (building: string) => {
    setExpandedBuildings(prev => ({
      ...prev,
      [building]: !prev[building],
    }));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-400 rounded-[2rem] p-6 sm:p-8 text-white shadow-lg overflow-hidden min-h-[40vh]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.28),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.18),_transparent_24%)]"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-36 h-36 bg-white/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 bg-cyan-200/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-2">
              <Sparkles size={16} className="mr-1.5 text-amber-200" />
              HUFS 빈 강의실 찾기
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {getGreeting()}
            </h1>
            <p className="text-cyan-50 text-lg sm:text-xl font-medium max-w-sm leading-relaxed">
              지금 바로 사용할 수 있는<br />쾌적한 강의실을 찾아보세요.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-white/25 blur-2xl scale-95 rounded-[2rem]"></div>
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className="relative block w-full rounded-[1.75rem] border border-white/45 bg-white/18 p-3 text-left backdrop-blur-md shadow-[0_20px_60px_rgba(15,23,42,0.22)] transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-white/70 sm:p-4"
              aria-label="캠퍼스 지도를 크게 보기"
            >
              <div className="rounded-[1.2rem] bg-gradient-to-br from-slate-100 via-white to-cyan-50 p-2 shadow-inner">
                <img
                  src={campusMap}
                  alt="캠퍼스 강의실 지도"
                  className="w-full rounded-2xl border border-slate-200/80 bg-white object-cover shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 px-1">
                <p className="text-sm font-semibold text-white/95">강의실 위치를 한눈에 확인하세요</p>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white/90 border border-white/20">
                  클릭해서 확대
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-5">
        <div className="flex bg-gray-50 p-1.5 rounded-xl">
          <button
            className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", timeMode === 'now' ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700")}
            onClick={() => setTimeMode('now')}
          >
            지금 당장
          </button>
          <button
            className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", timeMode === 'custom' ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700")}
            onClick={() => setTimeMode('custom')}
          >
            시간 직접 선택
          </button>
        </div>

        {timeMode === 'custom' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-3">
              <select 
                value={customDay} 
                onChange={e => setCustomDay(parseInt(e.target.value))}
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {['월', '화', '수', '목', '금', '토', '일'].map((d, i) => (
                  <option key={i} value={i}>{d}요일</option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="block text-xs font-semibold text-gray-500">시작 시간</span>
                <select
                  value={customStartTime}
                  onChange={e => setCustomStartTime(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {hourOptions.map(hour => {
                    const value = formatHourValue(hour);
                    return (
                      <option key={value} value={value}>
                        {formatHourLabel(value)}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="block text-xs font-semibold text-gray-500">끝 시간</span>
                <div className="flex items-center gap-2">
                  <select
                    value={customEndTime}
                    onChange={e => setCustomEndTime(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">선택 안 함</option>
                    {hourOptions.map(hour => {
                      const value = formatHourValue(hour);
                      return (
                        <option key={value} value={value}>
                          {formatHourLabel(value)}
                        </option>
                      );
                    })}
                  </select>
                  {customEndTime && (
                    <button
                      type="button"
                      onClick={() => setCustomEndTime('')}
                      className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
                    >
                      초기화
                    </button>
                  )}
                </div>
              </label>
            </div>

            {hasInvalidRange && (
              <p className="text-sm font-medium text-rose-600">끝 시간은 시작 시간보다 늦어야 합니다.</p>
            )}

            {customEndTime && !hasInvalidRange && (
              <p className="text-sm font-medium text-gray-500">
                선택한 강의실은 {formatHourLabel(customStartTime)}부터 {formatHourLabel(customEndTime)}까지 전부 비어 있어야 합니다.
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-gray-700">건물 선택 (다중 선택 가능)</h3>
            {selectedBuildings.length > 0 && selectedBuildings.length < buildings.length && (
              <button 
                onClick={() => setSelectedBuildings([...buildings])}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                초기화
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleAll}
              className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all border", 
                selectedBuildings.length === buildings.length
                  ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              전체
            </button>
            {buildings.map(bldg => {
              const isSelected = selectedBuildings.includes(bldg);
              return (
                <button
                  key={bldg}
                  onClick={() => toggleBuilding(bldg)}
                  className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all border", 
                    isSelected 
                      ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {getBuildingName(bldg)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-base font-bold text-gray-800">
            검색 결과 <span className="text-blue-600 ml-1">{emptyRooms.length}</span>
          </h2>
        </div>
        
        {emptyRooms.length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedEmptyRooms).map(([building, rooms]) => {
              const isExpanded = expandedBuildings[building] ?? false;
              const visibleRooms = isExpanded ? rooms : rooms.slice(0, 3);
              const hasMoreRooms = rooms.length > 3;

              return (
                <section
                  key={building}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 px-4 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-gray-900">{getBuildingName(building)}</h3>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                          {rooms.length}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">빈 강의실 {rooms.length}개</p>
                    </div>
                  </div>

                  <div>
                    {visibleRooms.map(room => (
                      <button
                        key={room.place}
                        type="button"
                        onClick={() => navigate(`/timetable/${room.place}`)}
                        className="group flex w-full items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 text-left transition-colors hover:bg-blue-50/60"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                            <MapPin size={17} className="mr-1.5 shrink-0 text-blue-500" />
                            <span className="truncate">{formatPlaceLabel(room.building, room.room)}</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm font-semibold text-emerald-700">
                            <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            {timeMode === 'custom' && customEndTime
                              ? `${formatHourLabel(customStartTime)} - ${formatHourLabel(customEndTime)} 비어있음`
                              : `현재 비어있음 ${room.emptyUntil ? `- ${formatTime(room.emptyUntil)}까지` : '- 오늘 일정 없음'}`}
                          </div>
                        </div>
                        <ChevronDown
                          size={18}
                          className="-rotate-90 shrink-0 text-gray-300 transition-colors group-hover:text-blue-400"
                        />
                      </button>
                    ))}

                    {hasMoreRooms && (
                      <div className="border-t border-gray-100 px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleExpandedBuilding(building)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                        >
                          {isExpanded ? '접기' : `${rooms.length - 3}개 더보기`}
                          <ChevronDown
                            size={16}
                            className={cn('transition-transform', isExpanded && 'rotate-180')}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
        
        {emptyRooms.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-bold text-lg mb-1">
              {hasInvalidRange ? '시간 범위를 다시 확인해주세요' : '빈 강의실이 없습니다'}
            </p>
            <p className="text-gray-500 text-sm">다른 시간대나 건물을 선택해보세요.</p>
          </div>
        )}
      </div>

      <ImageLightbox
        isOpen={isMapOpen}
        src={campusMap}
        alt="캠퍼스 강의실 지도"
        title="캠퍼스 지도"
        onClose={() => setIsMapOpen(false)}
      />
    </div>
  );
}
