import subjectsGlobalData from '../data/subjects_global.json';
import subjectsSeoulData from '../data/subjects_seoul.json';

export type CampusKey = 'global' | 'seoul';

export interface TimePlace {
  day: string;
  start: string;
  end: string;
  place: string;
}

export interface Subject {
  code: string;
  name: string;
  professor: string;
  type: string;
  grade: string;
  time: string;
  credit: string;
  capacity: string;
  lectureId: string;
  timeplaces: TimePlace[];
}

export interface ParsedTimePlace {
  day: number;
  startMin: number;
  endMin: number;
  building: string;
  room: string;
  place: string;
}

export interface ParsedSubject extends Subject {
  parsedTimeplaces: ParsedTimePlace[];
}

export interface ScheduleItem {
  subject: ParsedSubject;
  timeplace: ParsedTimePlace;
}

export interface CampusDataset {
  key: CampusKey;
  label: string;
  shortLabel: string;
  buildingNames: Record<string, string>;
  subjects: ParsedSubject[];
  buildings: string[];
  roomsByBuilding: Record<string, Set<string>>;
  scheduleByPlace: Record<string, ScheduleItem[]>;
  scheduleByProfessor: Record<string, ParsedSubject[]>;
  getBuildingName: (building: string) => string;
  formatPlaceLabel: (building: string, room: string) => string;
}

interface CampusDefinition {
  key: CampusKey;
  label: string;
  shortLabel: string;
  buildingNames: Record<string, string>;
  subjectsData: Subject[];
}

const globalBuildingNames: Record<string, string> = {
  '0': '백년관',
  '1': '어문학관',
  '2': '교양관',
  '3': '자연과학관',
  '4': '인문경상관',
  '5': '공학관',
  '6': '학생회관',
  '7': '도서관',
};

const seoulBuildingNames: Record<string, string> = {
  '0': '본관',
  '1': '인문과학관',
  '2': '교수학습개발원',
  '3': '사회과학관',
  '4': '학생회관 및 기숙사',
  '5': '법학관',
  '6': '대학원',
  '7': '외국어연수평가원',
  '8': '국제관',
  '9': '도서관',
  B: 'Minerva Complex',
  C: '사이버관',
};

const campusDefinitions = {
  global: {
    key: 'global',
    label: '글로벌 캠퍼스',
    shortLabel: '글로벌',
    buildingNames: globalBuildingNames,
    subjectsData: subjectsGlobalData as Subject[],
  },
  seoul: {
    key: 'seoul',
    label: '서울 캠퍼스',
    shortLabel: '서울',
    buildingNames: seoulBuildingNames,
    subjectsData: subjectsSeoulData as Subject[],
  },
} satisfies Record<CampusKey, CampusDefinition>;

const isNumericCode = (value: string) => /^\d+$/.test(value);

const compareCodes = (a: string, b: string) => {
  const aIsNumeric = isNumericCode(a);
  const bIsNumeric = isNumericCode(b);

  if (aIsNumeric && bIsNumeric) {
    return Number(a) - Number(b);
  }

  if (aIsNumeric) {
    return -1;
  }

  if (bIsNumeric) {
    return 1;
  }

  return a.localeCompare(b, 'ko');
};

const buildSortableBuildingCodes = (buildingNames: Record<string, string>) =>
  Object.keys(buildingNames).sort((a, b) => b.length - a.length || compareCodes(a, b));

const normalizePlaceToken = (place: string) => String(place ?? '').trim().toUpperCase();

const parsePlace = (rawPlace: string, buildingCodes: string[]) => {
  const normalized = normalizePlaceToken(rawPlace);

  if (!normalized) {
    return null;
  }

  const candidates = Array.from(new Set([normalized, ...normalized.split(/\s+/).reverse()]));

  for (const candidate of candidates) {
    if (!candidate || candidate.includes('/')) {
      continue;
    }

    for (const building of buildingCodes) {
      if (!candidate.startsWith(building) || candidate.length <= building.length) {
        continue;
      }

      const room = candidate.slice(building.length);

      if (!/^[0-9A-Z-]+$/.test(room)) {
        continue;
      }

      return {
        building,
        room,
        place: candidate,
      };
    }
  }

  return null;
};

const shouldAppendRoomSuffix = (room: string) => /^[0-9]+(?:-[0-9]+)?$/.test(room);

const createCampusDataset = (definition: CampusDefinition): CampusDataset => {
  const buildingCodes = buildSortableBuildingCodes(definition.buildingNames);
  const getBuildingName = (building: string) => definition.buildingNames[building] ?? building;
  const formatPlaceLabel = (building: string, room: string) => {
    if (!building && !room) {
      return '강의실 정보 없음';
    }

    if (!room) {
      return getBuildingName(building);
    }

    if (shouldAppendRoomSuffix(room)) {
      return `${getBuildingName(building)} ${room}호`;
    }

    return `${getBuildingName(building)} ${room}`;
  };

  const subjects: ParsedSubject[] = definition.subjectsData.map(subject => ({
    ...subject,
    parsedTimeplaces: subject.timeplaces.flatMap(timeplace => {
      const parsedPlace = parsePlace(timeplace.place, buildingCodes);

      if (!parsedPlace) {
        return [];
      }

      return [{
        day: parseInt(timeplace.day, 10),
        startMin: parseInt(timeplace.start, 10) * 5,
        endMin: parseInt(timeplace.end, 10) * 5,
        ...parsedPlace,
      }];
    }),
  }));

  const roomsByBuilding = subjects.reduce((acc, subject) => {
    subject.parsedTimeplaces.forEach(timeplace => {
      if (!acc[timeplace.building]) {
        acc[timeplace.building] = new Set<string>();
      }

      acc[timeplace.building].add(timeplace.room);
    });

    return acc;
  }, {} as Record<string, Set<string>>);

  const buildings = Object.keys(roomsByBuilding).sort(compareCodes);

  const scheduleByPlace = subjects.reduce((acc, subject) => {
    subject.parsedTimeplaces.forEach(timeplace => {
      if (!acc[timeplace.place]) {
        acc[timeplace.place] = [];
      }

      acc[timeplace.place].push({ subject, timeplace });
    });

    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  const scheduleByProfessor = subjects.reduce((acc, subject) => {
    if (!acc[subject.professor]) {
      acc[subject.professor] = [];
    }

    acc[subject.professor].push(subject);
    return acc;
  }, {} as Record<string, ParsedSubject[]>);

  return {
    key: definition.key,
    label: definition.label,
    shortLabel: definition.shortLabel,
    buildingNames: definition.buildingNames,
    subjects,
    buildings,
    roomsByBuilding,
    scheduleByPlace,
    scheduleByProfessor,
    getBuildingName,
    formatPlaceLabel,
  };
};

export const campusDataByKey = {
  global: createCampusDataset(campusDefinitions.global),
  seoul: createCampusDataset(campusDefinitions.seoul),
} satisfies Record<CampusKey, CampusDataset>;

export const campusOptions = (Object.keys(campusDefinitions) as CampusKey[]).map(key => ({
  key,
  label: campusDefinitions[key].label,
  shortLabel: campusDefinitions[key].shortLabel,
}));
