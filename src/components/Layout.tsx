import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calendar, User, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: '빈 강의실 찾기', icon: Home },
    { path: '/timetable', label: '강의실 주간 시간표', icon: Calendar },
    { path: '/professor', label: '교수님 찾기 ❤️', icon: User },
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
          <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <Menu size={24} />
          </button>
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
    </div>
  );
}
