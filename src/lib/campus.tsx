import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import campusMapGlobal from '../assets/campus_map_global.jpg';
import campusMapSeoul from '../assets/campus_map_seoul.jpg';
import { loadCampusData, type CampusDataset, type CampusKey } from './data';

const CAMPUS_STORAGE_KEY = 'empty-classroom:selected-campus';

const campusMapByKey: Record<CampusKey, string> = {
  global: campusMapGlobal,
  seoul: campusMapSeoul,
};

interface CampusContextValue {
  campus: CampusKey;
  setCampus: (campus: CampusKey) => void;
  campusData: CampusDataset;
  campusMap: string;
}

const CampusContext = createContext<CampusContextValue | null>(null);

const isCampusKey = (value: string | null): value is CampusKey => value === 'global' || value === 'seoul';

const getInitialCampus = (): CampusKey => {
  if (typeof window === 'undefined') {
    return 'global';
  }

  const storedCampus = window.localStorage.getItem(CAMPUS_STORAGE_KEY);
  return isCampusKey(storedCampus) ? storedCampus : 'global';
};

export function CampusProvider({ children }: { children: ReactNode }) {
  const [campus, setCampus] = useState<CampusKey>(getInitialCampus);
  const [campusData, setCampusData] = useState<CampusDataset | null>(null);

  useEffect(() => {
    window.localStorage.setItem(CAMPUS_STORAGE_KEY, campus);
  }, [campus]);

  useEffect(() => {
    let isCancelled = false;

    setCampusData(null);

    loadCampusData(campus).then(data => {
      if (!isCancelled) {
        setCampusData(data);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [campus]);

  if (!campusData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">
          캠퍼스 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <CampusContext.Provider
      value={{
        campus,
        setCampus,
        campusData,
        campusMap: campusMapByKey[campus],
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);

  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider.');
  }

  return context;
}
