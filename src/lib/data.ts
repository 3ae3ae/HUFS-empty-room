import subjectsData from '../data/subjects.json';

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

export const subjects: ParsedSubject[] = (subjectsData as Subject[]).map(sub => ({
  ...sub,
  parsedTimeplaces: sub.timeplaces.map(tp => {
    const startMin = parseInt(tp.start, 10) * 5;
    const endMin = parseInt(tp.end, 10) * 5;
    const building = tp.place.charAt(0);
    const room = tp.place.substring(1);
    return {
      day: parseInt(tp.day, 10),
      startMin,
      endMin,
      building,
      room,
      place: tp.place
    };
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
