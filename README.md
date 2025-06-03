# 퍼스널 컬러 분석 앱

React와 OpenAI API를 사용한 퍼스널 컬러 분석 웹 애플리케이션입니다.

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. OpenAI API 키 설정
프론트엔드에서 직접 OpenAI API를 호출하도록 구성되어 있습니다.

1. 프로젝트 루트에 `.env` 파일을 생성하세요:
```bash
# .env 파일 생성
touch .env
```

2. `.env` 파일에 OpenAI API 키를 추가하세요:
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

⚠️ **보안 주의사항**: 이 방식은 데모용입니다. 실제 배포에서는 API 키가 브라우저에 노출되므로 보안상 권장되지 않습니다.

### 3. 개발 서버 실행
```bash
npm run dev
```

## 🎨 주요 기능

- 웹캠을 통한 실시간 사진 촬영
- 이미지 파일 업로드
- OpenAI Vision API를 이용한 퍼스널 컬러 분석
- 분석 결과에 따른 추천 컬러 팔레트 제공

## 🛠 기술 스택

- **Frontend**: React, Vite, TailwindCSS
- **AI**: OpenAI GPT-4 Vision API
- **State Management**: React Context

## 📝 기존 React + Vite 템플릿 정보

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
