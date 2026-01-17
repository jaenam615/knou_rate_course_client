# KNOU 강의평가 - Frontend Client

한국방송통신대학교 강의 후기 플랫폼 프론트엔드 클라이언트

## 개요

이 프로젝트는 순수 JavaScript(Vanilla JS)로 작성된 SPA(Single Page Application)입니다. 별도의 빌드 과정 없이 브라우저에서 바로 실행됩니다.

## 기능

- **강의 검색**: 강의명으로 검색
- **학과별 탐색**: 22개 학과별 강의 목록 조회
- **필터링**: 정렬(평점순, 후기순, 최신순), 평가방식 태그 필터
- **강의 상세**: 강의 정보 및 수강 후기 조회
- **후기 작성**: 로그인 후 평점, 난이도, 과제량, 태그와 함께 후기 작성
- **회원 기능**: 회원가입(@knou.ac.kr 전용), 이메일 인증, 로그인

## 프로젝트 구조

```
knou_rate_course_client/
├── index.html                 # HTML 엔트리 포인트
├── css/
│   └── styles.css             # 전체 스타일시트
└── js/
    ├── app.js                 # 앱 초기화 및 라우트 설정
    ├── api.js                 # 백엔드 API 클라이언트
    ├── router.js              # 해시 기반 클라이언트 라우터
    ├── state.js               # 상태 관리
    ├── components/            # 재사용 가능한 UI 컴포넌트
    │   ├── header.js          # 헤더 네비게이션
    │   ├── courseCard.js      # 강의 카드 및 그리드
    │   ├── filterBar.js       # 검색 및 필터 컨트롤
    │   ├── loading.js         # 로딩 및 빈 상태
    │   └── review.js          # 후기 표시 및 작성 폼
    └── pages/                 # 페이지 컴포넌트
        ├── home.js            # 홈 (학과 목록, 인기 강의)
        ├── courses.js         # 강의 목록
        ├── courseDetail.js    # 강의 상세
        └── auth.js            # 로그인, 회원가입, 이메일 인증
```

## 실행 방법

### 1. 정적 서버로 실행

Python 3:
```bash
cd knou_rate_course_client
python -m http.server 8080
```

Node.js (npx):
```bash
cd knou_rate_course_client
npx serve .
```

### 2. 브라우저에서 접속

```
http://localhost:8080
```

## 백엔드 연동

프론트엔드는 동일 origin의 `/api/v1` 경로로 API 요청을 보냅니다.

### 개발 환경 설정

백엔드가 다른 포트(예: 8000)에서 실행 중인 경우:

**방법 1: API URL 변경**

`js/api.js` 파일의 `API_BASE_URL` 수정:
```javascript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

**방법 2: 리버스 프록시 설정**

nginx 예시:
```nginx
server {
    listen 8080;

    location / {
        root /path/to/knou_rate_course_client;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

## 페이지 라우트

| 경로 | 설명 |
|------|------|
| `#/` | 홈 페이지 |
| `#/courses` | 전체 강의 목록 |
| `#/courses?major_id=1` | 특정 학과 강의 목록 |
| `#/courses?q=검색어` | 강의 검색 결과 |
| `#/courses/:id` | 강의 상세 페이지 |
| `#/login` | 로그인 |
| `#/signup` | 회원가입 |
| `#/verify-email?token=...` | 이메일 인증 |

## 기술 스택

- **JavaScript**: ES6+ 모듈 (빌드 도구 없음)
- **CSS**: CSS Custom Properties, Flexbox, Grid
- **라우팅**: Hash-based SPA 라우터
- **상태 관리**: 간단한 pub/sub 패턴 스토어
- **인증**: JWT (localStorage 저장)

## 브라우저 지원

ES6 모듈을 지원하는 모던 브라우저:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+
