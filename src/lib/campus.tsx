import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import campusMapGlobal from '../assets/campus_map_global.jpg';
import campusMapSeoul from '../assets/campus_map_seoul.jpg';
import { campusDataByKey, type CampusDataset, type CampusKey } from './data';

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

  useEffect(() => {
    window.localStorage.setItem(CAMPUS_STORAGE_KEY, campus);
  }, [campus]);

  return (
    <CampusContext.Provider
      value={{
        campus,
        setCampus,
        campusData: campusDataByKey[campus],
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
