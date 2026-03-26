# HUFS 빈 강의실 찾기

한국외국어대학교 서울/글로벌 캠퍼스의 강의 시간표 데이터를 바탕으로 빈 강의실을 빠르게 찾기 위한 웹 앱입니다. 현재 시간 기준 조회와 사용자 지정 시간대 조회를 지원하며, 강의실 주간 시간표와 교수님 시간표 검색 기능도 포함되어 있습니다.

배포 주소: <https://3ae3ae.github.io/HUFS-empty-room/>

## 주요 기능

- 현재 시각 기준으로 사용 가능한 빈 강의실 탐색
- 요일/시작 시각/종료 시각을 직접 지정해서 빈 강의실 조회
- 서울 캠퍼스와 글로벌 캠퍼스 간 전환
- 건물별 강의실 목록과 빈 시간 정보 확인
- 특정 강의실의 주간 시간표 검색
- 교수명 기준 시간표 조회 및 현재 수업 여부 확인
- 캠퍼스 지도 확대 보기

## 기술 스택

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Lucide React

## 프로젝트 구조

```text
src/
  components/     공통 UI 컴포넌트
  pages/          화면 단위 페이지
  lib/            데이터 로딩, 시간 계산, 유틸리티
  data/           캠퍼스별 강의 데이터 JSON
  assets/         캠퍼스 지도 이미지
```

핵심 파일:

- `src/pages/Home.tsx`: 빈 강의실 탐색 메인 화면
- `src/pages/Timetable.tsx`: 강의실 주간 시간표 화면
- `src/pages/ProfessorSearch.tsx`: 교수 검색 화면
- `src/lib/data.ts`: 강의 데이터 파싱 및 인덱싱
- `src/lib/campus.tsx`: 캠퍼스 상태 관리

## 시작하기

### 요구 사항

- Node.js 18 이상 권장
- npm

### 설치 및 실행

```bash
npm install
npm run dev
```

기본 개발 서버 주소:

- `http://localhost:3000`

## 사용 가능한 스크립트

```bash
npm run dev
```

Vite 개발 서버를 `3000` 포트에서 실행합니다.

```bash
npm run build
```

프로덕션 빌드를 생성합니다.

```bash
npm run preview
```

빌드 결과물을 로컬에서 미리 확인합니다.

```bash
npm run lint
```

TypeScript 타입 체크를 수행합니다.

```bash
npm run clean
```

`dist/` 디렉터리를 삭제합니다.

```bash
npm run deploy
```

GitHub Pages용 정적 빌드를 배포합니다.

## 데이터 및 동작 방식

- 강의 데이터는 `src/data/subjects_seoul.json`, `src/data/subjects_global.json`에서 불러옵니다.
- 앱은 과목 시간표를 파싱해 강의실별, 교수별 인덱스를 생성합니다.
- 빈 강의실 판단은 해당 요일의 수업 시간 블록과 현재 또는 지정 시간대를 비교해 계산합니다.
- 캠퍼스 선택 상태는 브라우저 `localStorage`에 저장됩니다.

## 배포

이 프로젝트는 GitHub Pages 배포를 기준으로 설정되어 있습니다.

- `vite.config.ts`의 `base`: `/HUFS-empty-room/`
- `package.json`의 `homepage`: `https://3ae3ae.github.io/HUFS-empty-room/`

리포지토리 이름이나 배포 경로가 바뀌면 두 값을 함께 수정해야 합니다.

## 검증

변경 후 최소한 아래 두 명령은 통과시키는 것을 권장합니다.

```bash
npm run lint
npm run build
```

## 주의 사항

- 이 서비스는 개설 과목 시간표를 기준으로 빈 강의실을 추정합니다.
- 실제 수업 변경, 보강, 시험, 행사, 자율 사용 등은 반영되지 않을 수 있습니다.
- 실제 사용 전에는 현장 상황을 직접 확인하는 것이 안전합니다.
