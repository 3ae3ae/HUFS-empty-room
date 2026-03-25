import { useState, useMemo } from 'react';
import { formatPlaceLabel, scheduleByProfessor } from '../lib/data';
import { Search, User, BookOpen, Clock, MapPin } from 'lucide-react';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export default function ProfessorSearch() {
  const [searchTerm, setSearchTerm] = useState('');

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
        <p className="text-sm font-medium text-slate-500">교수님 이름으로 이번 학기 담당 수업을 검색해보세요.</p>
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
        {results.map(({ prof, subjects }) => (
          <div key={prof} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mr-4 shadow-sm shadow-blue-100/50">
                <User size={24} />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">{prof} 교수님</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">총 {subjects.length}개의 수업</p>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {subjects.map((sub, idx) => (
                <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-bold text-slate-800 flex items-center text-base">
                      <BookOpen size={18} className="mr-2.5 text-blue-400" />
                      {sub.name}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg whitespace-nowrap ml-3">
                      {sub.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 ml-7">
                    {sub.parsedTimeplaces.map((tp, i) => (
                      <div key={i} className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                        <div className="flex items-center bg-slate-50 px-2.5 py-1 rounded-md">
                          <Clock size={14} className="mr-1.5 text-slate-400" />
                          {DAYS[tp.day]}요일 {formatTime(tp.startMin)} - {formatTime(tp.endMin)}
                        </div>
                        <div className="flex items-center bg-slate-50 px-2.5 py-1 rounded-md">
                          <MapPin size={14} className="mr-1.5 text-slate-400" />
                          {formatPlaceLabel(tp.building, tp.room)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

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
