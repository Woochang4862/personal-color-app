# 🎨 퍼스널 컬러 진단 웹 애플리케이션

**당신만의 색을 찾아보세요!** 이 프로젝트는 사용자의 사진을 기반으로 퍼스널 컬러를 진단하고, 어울리는 색상 팔레트와 스타일링을 제안하는 인터랙티브 웹 애플리케이션입니다. React와 Tailwind CSS를 사용하여 제작되었으며, OpenAI의 Vision API를 통해 색상을 분석하고, 실시간으로 TouchDesigner와 연동하여 화려한 시각적 효과를 제공합니다.

## ✨ 주요 기능

-   **📸 이미지 기반 퍼스널 컬러 분석**: 웹캠으로 실시간 촬영하거나, 가지고 있는 사진을 업로드하여 퍼스널 컬러를 진단받을 수 있습니다.
-   **🤖 OpenAI Vision API 활용**: 사용자의 이미지를 OpenAI의 강력한 Vision API로 분석하여 정확하고 신뢰도 높은 사계절 톤(봄, 여름, 가을, 겨울)을 결과로 제공합니다.
-   **🎨 맞춤형 결과 페이지**: 진단된 톤에 맞는 상세 설명과 함께, 어울리는 색상 팔레트를 시각적으로 제공하여 사용자가 자신에게 맞는 색을 쉽게 이해하고 활용할 수 있도록 돕습니다.
-   **💎 TouchDesigner 연동**: OSC(Open Sound Control) 통신을 통해 웹 애플리케이션의 상태(진단 결과, 현재 페이지 등)를 실시간으로 TouchDesigner로 전송하여, 외부 스크린이나 프로젝션 맵핑 등에 화려하고 동적인 시각 효과를 구현할 수 있습니다.
-   **📱 세련되고 인터랙티브한 UI/UX**: Tailwind CSS를 활용한 현대적인 디자인과 함께, 사용자의 행동에 즉각적으로 반응하는 부드러운 애니메이션과 인터랙션을 통해 몰입감 높은 사용자 경험을 제공합니다.
-   **🖼️ 결과 이미지 저장**: `html2canvas` 라이브러리를 사용하여 진단 결과 페이지를 이미지 파일로 저장할 수 있습니다.

## 🛠️ 기술 스택

### Frontend

-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Routing**: React Router
-   **State Management**: React Hooks (useState, useContext, useRef)
-   **HTTP Client**: Axios
-   **Webcam Integration**: `react-webcam`
-   **Capture to Image**: `html2canvas`

### AI & External Integration

-   **AI Analysis**: OpenAI Vision API
-   **Real-time Visualization**: TouchDesigner
-   **Communication Protocol**: OSC (via `osc-js`, 추정)

### Deployment

-   **Hosting**: GitHub Pages

## 🚀 프로젝트 설치 및 실행

1.  **저장소 복제**
    ```bash
    git clone https://github.com/woochang4862/personal-color-app.git
    cd personal-color-app
    ```

2.  **의존성 설치**
    ```bash
    npm install
    ```

3.  **환경 변수 설정**
    프로젝트 루트 디렉토리에 `.env` 파일을 생성하고, 아래와 같이 OpenAI API 키를 입력해주세요.
    ```
    VITE_OPENAI_API_KEY="여러분의 OpenAI API 키를 입력하세요"
    ```

4.  **개발 서버 실행**
    ```bash
    npm run dev
    ```
    이제 브라우저에서 `http://localhost:5173` (또는 터미널에 표시되는 주소)으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

```
personal-color-app/
├── public/              # 정적 에셋 (이미지, SVG 등)
├── src/
│   ├── assets/          # 빌드 과정에 포함될 에셋
│   ├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── contexts/        # React Context (테마 등)
│   ├── hooks/           # 커스텀 훅
│   ├── pages/           # 라우팅 단위의 페이지 컴포넌트
│   ├── services/        # API 호출, OSC 통신 등 비즈니스 로직
│   ├── utils/           # 유틸리티 함수 (로거 등)
│   ├── App.jsx          # 최상위 컴포넌트 및 라우팅 설정
│   ├── main.jsx         # 애플리케이션 진입점
│   └── index.css        # 전역 스타일
├── .env                 # 환경 변수 설정 파일
├── package.json         # 의존성 및 스크립트 정보
└── README.md            # 프로젝트 소개
```

## 🖼️ 화면 스크린샷

*프로젝트의 주요 화면 스크린샷이나 GIF를 여기에 추가하여 시각적으로 보여주세요.*

**1. 랜딩 페이지**
(랜딩 페이지 이미지)

**2. 촬영 가이드 및 이미지 업로드 페이지**
(촬영 페이지 이미지)

**3. 로딩 및 분석 중 화면**
(로딩 페이지 이미지)

**4. 퍼스널 컬러 진단 결과 페이지**
(결과 페이지 이미지)


## 💡 향후 개선 사항

-   **[ ] 사용자 계정 시스템**: 사용자가 자신의 진단 기록을 저장하고, 시간의 흐름에 따른 변화를 확인할 수 있는 기능을 추가합니다.
-   **[ ] 상세 스타일링 추천**: 진단된 톤을 기반으로 패션, 헤어, 메이크업 등 구체적인 스타일링 팁을 제공하는 기능을 확장합니다.
-   **[ ] 다국어 지원**: 더 많은 사용자를 위해 영어, 일본어 등 다국어 지원을 추가합니다.
-   **[ ] 서버리스 백엔드**: 현재 클라이언트 측에서 처리되는 OpenAI API 호출을 AWS Lambda나 Vercel Functions 같은 서버리스 환경으로 이전하여 API 키를 안전하게 관리하고, 서버 로직을 확장합니다.

---
*이 프로젝트는 개인 포트폴리오용으로 제작되었으며, 모든 코드는 [GitHub](https://github.com/woochang4862/personal-color-app)에서 확인하실 수 있습니다.*
