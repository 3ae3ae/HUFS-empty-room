import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calendar, Sparkles, MessageSquareHeart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCampus } from '../lib/campus';

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { campus, setCampus } = useCampus();
  const nextCampus = campus === 'seoul' ? 'global' : 'seoul';

  const navItems = [
    { path: '/', label: '빈 강의실 찾기', icon: Home },
    { path: '/timetable', label: '강의실 주간 시간표', icon: Calendar },
    { path: '/professor', label: '교수님 찾기', icon: MessageSquareHeart },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-200">
              <Sparkles size={18} />
            </div>
            HUFS 강의실 찾기
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCampus(nextCampus)}
              className="relative inline-grid h-10 w-[126px] grid-cols-2 items-center rounded-full bg-slate-100 p-1 text-xs font-bold text-slate-500 shadow-inner transition-colors hover:bg-slate-200/70"
              aria-label={`현재 ${campus === 'seoul' ? '서울' : '글로벌'} 캠퍼스 선택됨, 클릭해서 ${nextCampus === 'seoul' ? '서울' : '글로벌'} 캠퍼스로 전환`}
              aria-pressed={campus === 'global'}
            >
              <span
                className={cn(
                  'absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-[left]',
                  campus === 'seoul' ? 'left-1' : 'left-[calc(50%)]'
                )}
                aria-hidden="true"
              />
              <span className={cn('relative z-10 px-2', campus === 'seoul' ? 'text-blue-700' : 'text-slate-500')}>
                서울
              </span>
              <span className={cn('relative z-10 px-2', campus === 'global' ? 'text-blue-700' : 'text-slate-500')}>
                글로벌
              </span>
            </button>
            <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          <div className="w-72 bg-white h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 h-16 flex items-center justify-between border-b border-slate-100">
              <span className="font-bold text-slate-800 ml-2">메뉴</span>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 py-6 px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all",
                      isActive 
                        ? "text-blue-700 bg-blue-50 shadow-sm shadow-blue-100/50" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon size={20} className={cn("mr-3", isActive ? "text-blue-600" : "text-slate-400")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      <footer className="max-w-7xl w-full mx-auto px-4 pb-6 sm:px-6">
        <p className="text-xs text-slate-400 text-center">
          이 사이트는 과목 개설 시간표를 기준으로 제작되었으므로, 실제 강의실 사용 여부는 반드시 직접 확인해 주세요.
        </p>
      </footer>
    </div>
  );
}
