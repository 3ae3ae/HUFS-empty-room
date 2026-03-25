import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatPlaceLabel, scheduleByPlace } from '../lib/data';
import { Search, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';

const DAYS = ['월', '화', '수', '목', '금'];
const START_HOUR = 9;
const END_HOUR = 18;

export default function Timetable() {
  const { place } = useParams();
  const navigate = useNavigate();
  const [searchPlace, setSearchPlace] = useState(place || '');

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

  return (
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
          onChange={e => setSearchPlace(e.target.value)}
          placeholder="건물/강의실 검색 (예: 0209)"
          className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </form>

      {searchPlace && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center">
              <CalendarIcon size={20} className="mr-2.5 text-blue-500" />
              {formatPlaceLabel(searchBuilding, searchRoom)} 시간표
            </h2>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[600px] p-4">
              <div className="grid grid-cols-6 border-b-2 border-slate-200 pb-2 mb-2">
                <div className="text-center text-xs font-bold text-slate-400">시간</div>
                {DAYS.map(day => (
                  <div key={day} className="text-center text-sm font-bold text-slate-700">{day}</div>
                ))}
              </div>
              
              <div className="relative mt-2" style={{ height: `${(END_HOUR - START_HOUR) * 65}px` }}>
                {/* Grid lines */}
                {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                  <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: `${i * 65}px` }}>
                    <div className="w-1/6 text-center text-xs font-medium text-slate-400 -mt-2.5 bg-white inline-block px-1">
                      {START_HOUR + i}:00
                    </div>
                  </div>
                ))}
                
                {/* Vertical dividers */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="absolute h-full border-l border-slate-100/50" style={{ left: `${(i + 1) * (100 / 6)}%` }} />
                ))}

                {/* Classes */}
                {schedule.map((item, idx) => {
                  if (item.timeplace.day > 4) return null; // Skip weekends for now
                  const top = (item.timeplace.startMin - START_HOUR * 60) * (65/60);
                  const height = (item.timeplace.endMin - item.timeplace.startMin) * (65/60);
                  if (top < 0 || top + height > (END_HOUR - START_HOUR) * 65) return null; // Out of bounds

                  return (
                    <div
                      key={idx}
                      className="absolute rounded-xl p-2 overflow-hidden shadow-sm border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:shadow-md transition-all cursor-default group"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `calc(${(item.timeplace.day + 1) * (100 / 6)}% + 4px)`,
                        width: `calc(${100 / 6}% - 8px)`,
                      }}
                    >
                      <div className="text-xs font-extrabold text-blue-900 leading-tight line-clamp-2 group-hover:text-blue-700">{item.subject.name}</div>
                      <div className="text-[11px] font-medium text-blue-600 mt-1 truncate">{item.subject.professor}</div>
                      <div className="text-[10px] font-medium text-blue-400 mt-0.5">{formatTime(item.timeplace.startMin)} - {formatTime(item.timeplace.endMin)}</div>
                    </div>
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
  );
}
