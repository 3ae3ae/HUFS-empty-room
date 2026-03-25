import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildings, scheduleByPlace, roomsByBuilding } from '../lib/data';
import { Clock, MapPin, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const [timeMode, setTimeMode] = useState<'now' | 'custom'>('now');
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([...buildings]);

  const [customDay, setCustomDay] = useState<number>(0);
  const [customTime, setCustomTime] = useState<string>('09:00');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (timeMode === 'now') {
      const timer = setInterval(() => setCurrentTime(new Date()), 60000);
      return () => clearInterval(timer);
    }
  }, [timeMode]);

  const targetDay = timeMode === 'now' ? (currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1) : customDay;
  const targetMin = timeMode === 'now' ? currentTime.getHours() * 60 + currentTime.getMinutes() : parseInt(customTime.split(':')[0]) * 60 + parseInt(customTime.split(':')[1]);

  const emptyRooms = useMemo(() => {
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
          if (targetMin >= c.timeplace.startMin && targetMin < c.timeplace.endMin) {
            isCurrentlyEmpty = false;
            break;
          }
          if (c.timeplace.startMin > targetMin) {
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
  }, [targetDay, targetMin, selectedBuildings]);

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

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-teal-400 rounded-[2rem] p-8 text-white shadow-lg overflow-hidden flex flex-col justify-center min-h-[40vh]">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-2">
            <Sparkles size={16} className="mr-1.5 text-yellow-200" />
            HUFS 빈 강의실 찾기
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {getGreeting()}
          </h1>
          <p className="text-blue-50 text-lg sm:text-xl font-medium max-w-sm leading-relaxed">
            지금 바로 사용할 수 있는<br/>쾌적한 강의실을 찾아보세요.
          </p>
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
          <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
            <select 
              value={customDay} 
              onChange={e => setCustomDay(parseInt(e.target.value))}
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {['월', '화', '수', '목', '금', '토', '일'].map((d, i) => (
                <option key={i} value={i}>{d}요일</option>
              ))}
            </select>
            <input 
              type="time" 
              value={customTime}
              onChange={e => setCustomTime(e.target.value)}
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
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
                  {bldg}관
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {emptyRooms.map((room, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(`/timetable/${room.place}`)}
              className="group bg-white p-5 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center text-xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                  <MapPin size={20} className="mr-1.5 text-blue-500" />
                  {room.building}관 {room.room}호
                </div>
              </div>
              <div className="flex items-center text-sm text-emerald-700 font-bold bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                현재 비어있음 {room.emptyUntil ? `- ${formatTime(room.emptyUntil)}까지` : '- 오늘 일정 없음'}
              </div>
            </div>
          ))}
        </div>
        
        {emptyRooms.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-bold text-lg mb-1">빈 강의실이 없습니다</p>
            <p className="text-gray-500 text-sm">다른 시간대나 건물을 선택해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
