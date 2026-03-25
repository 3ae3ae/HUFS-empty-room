import subjectsData from '../data/subjects.json';

export const buildingNames: Record<string, string> = {
  '0': '백년관',
  '1': '어문학관',
  '2': '교양관',
  '3': '자연과학관',
  '4': '인문경상관',
  '5': '공학관',
  '6': '학생회관',
  '7': '도서관',
};

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

export const getBuildingName = (building: string) => buildingNames[building] ?? building;

export const formatPlaceLabel = (building: string, room: string) => {
  if (!building && !room) return '강의실 정보 없음';
  if (!room) return getBuildingName(building);
  return `${getBuildingName(building)} ${room}호`;
};

const isValidPlace = (place: string) => /^\d{2,}$/.test(place);

export const subjects: ParsedSubject[] = (subjectsData as Subject[]).map(sub => ({
  ...sub,
  parsedTimeplaces: sub.timeplaces.flatMap(tp => {
    const place = String(tp.place ?? '').trim();

    if (!isValidPlace(place)) {
      return [];
    }

    const startMin = parseInt(tp.start, 10) * 5;
    const endMin = parseInt(tp.end, 10) * 5;
    const building = place.charAt(0);
    const room = place.substring(1);

    return [{
      day: parseInt(tp.day, 10),
      startMin,
      endMin,
      building,
      room,
      place,
    }];
  })
}));

export const buildings = Array.from(new Set(subjects.flatMap(s => s.parsedTimeplaces.map(tp => tp.building)))).sort();

export const roomsByBuilding = subjects.reduce((acc, sub) => {
  sub.parsedTimeplaces.forEach(tp => {
    if (!acc[tp.building]) acc[tp.building] = new Set();
    acc[tp.building].add(tp.room);
  });
  return acc;
}, {} as Record<string, Set<string>>);

export const scheduleByPlace = subjects.reduce((acc, sub) => {
  sub.parsedTimeplaces.forEach(tp => {
    if (!acc[tp.place]) acc[tp.place] = [];
    acc[tp.place].push({ subject: sub, timeplace: tp });
  });
  return acc;
}, {} as Record<string, { subject: ParsedSubject, timeplace: ParsedTimePlace }[]>);

export const scheduleByProfessor = subjects.reduce((acc, sub) => {
  if (!acc[sub.professor]) acc[sub.professor] = [];
  acc[sub.professor].push(sub);
  return acc;
}, {} as Record<string, ParsedSubject[]>);
