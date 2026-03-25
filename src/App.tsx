/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import ProfessorSearch from './pages/ProfessorSearch';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="timetable/:place?" element={<Timetable />} />
          <Route path="professor" element={<ProfessorSearch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
