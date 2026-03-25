/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

const Home = lazy(() => import('./pages/Home'));
const Timetable = lazy(() => import('./pages/Timetable'));
const ProfessorSearch = lazy(() => import('./pages/ProfessorSearch'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">
        불러오는 중...
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="timetable/:place?" element={<Timetable />} />
            <Route path="professor" element={<ProfessorSearch />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
