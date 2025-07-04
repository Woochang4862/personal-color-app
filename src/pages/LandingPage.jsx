import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import mainLogo from "../assets/main_logo.png";
import noise from "../assets/noise.svg";
import { sendOSCToTouchDesigner } from "../sendOSCToTouchDesigner";

const LandingPage = () => {
  const navigate = useNavigate();
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  const handleHome = async () => {
    const oscResult = await sendOSCToTouchDesigner(
      {
        apiResponse: {
          colorResult: {
            season: '초기화면',
          },
        },
      },
      `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
      Math.floor(Math.random() * 4)
    );
    console.log(oscResult);
    
  }

  useEffect(() => {
    const handleScroll = () => {
      isScrolling.current = true;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 200); // 200ms 동안 스크롤이 없으면 스크롤 종료로 간주
    };

    const handleKeyDown = (e) => {
      // 스크롤 중일 때 방향키(↑, ↓) 입력 막기
      console.log("test");
      if (isScrolling.current && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // 계절 버튼 클릭 핸들러
  const handleSeasonSelect = (season) => {
    sessionStorage.setItem("selectedSeason", season);
    navigate("/loading");
  };

  return (
    <div
      className="w-full scrollbar-hide"
    >
      <section className="h-screen w-full flex items-center justify-center snap-start">
        <div className="text-center max-w-4xl mx-auto px-6 h-screen w-full flex flex-col justify-between items-center py-8">
          <div className="flex-1 flex items-center justify-center w-full flex-col"></div>
          <div className="flex-1 flex items-center justify-center w-full flex-col">
            <img
              src={mainLogo}
              alt="mainLogo"
              className="w-2/3 max-w-lg mx-auto"
            />
          </div>
          <div className="flex-1 flex items-center justify-between w-full flex-col">
            <div className="h-full flex flex-col justify-center items-center">
              <span className="text-[#d3d3d3] text-2xl font-medium animate-pulse">
                - Press (↓) to Start -
              </span>
            </div>

            
          </div>
          <p className="w-full text-xs text-gray-400 text-center">
              Designed By USW DataScience Department
            </p>
        </div>
      </section>

      <section
        id="section2"
        className="h-screen w-full flex items-center flex-col justify-between snap-start"
      >
        <div className="text-center max-w-4xl mx-auto px-6 h-screen w-full flex flex-col justify-between items-center py-8">
          <div className="flex-1 flex items-center justify-center w-full flex-col">
            <p className="text-white text-xl text-center leading-relaxed">
              계절은 덧없게 지나갑니다.
              <br />
              행복도, 슬픔도, 아픔도, 사랑도.
              <br />
              우리의 모든 추억은 시간 속에서 계절과 함께 있습니다.
            </p>
          </div>
          {/* 스크롤 유도 애니메이션 */}
          <div className="mt-8 flex flex-col items-center">
            <span className="text-gray-300 text-sm mb-2">press (↓)</span>
            <svg
              className="w-8 h-8 animate-bounce text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className="h-screen w-full flex items-center justify-center snap-start">
        <div className="text-center max-w-4xl mx-auto px-6 h-screen w-full flex flex-col justify-between items-center py-8">
          <div className="flex-1 flex items-center justify-center w-full flex-col">
            <p className="text-white text-xl text-center leading-relaxed">
              <span className="font-black">봄</span>의 싱그러움🌿,{" "}
              <span className="font-black">여름</span>의 청량함🏖️,{" "}
              <span className="font-black">가을</span>의 차분함🍁,{" "}
              <span className="font-black">겨울</span>의 고요함⛄️
              <br />그 [날]은 왠지 그{" "}
              <span className="relative inline-block align-middle">
                <img
                  src={noise}
                  alt="noise"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 pointer-events-none select-none"
                  style={{ zIndex: 2 }}
                />
                <span className="font-black relative z-0">사계</span>
              </span>
              한 날씨와 참 잘 어울렸던 것 같습니다.
              <br />
              그야말로
              <span className="relative inline-block align-middle">
                <img
                  src={noise}
                  alt="noise"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 pointer-events-none select-none"
                  style={{ zIndex: 2 }}
                />
                <span className="font-black relative z-0">사계</span>
              </span>
              이었죠.
            </p>
          </div>
          {/* 스크롤 유도 애니메이션 */}
          <div className="mt-8 flex flex-col items-center">
            <span className="text-gray-300 text-sm mb-2">press (↓)</span>
            <svg
              className="w-8 h-8 animate-bounce text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className="h-screen w-full flex items-center justify-center snap-start">
        <div className="text-center max-w-4xl mx-auto px-6 h-screen w-full flex flex-col justify-between items-center py-8">
          <div className="flex-1 flex items-center justify-center w-full flex-col">
            <p className="text-white text-xl text-center leading-relaxed">
              ...?
              <br />
              그 [날]을 잊고 계시군요.
              <br />
              <br />
              걱정마세요. <br />
              제가 그 [날]의 기억을 당신 앞으로 가져와 드릴게요.
              <br />
              <span className="font-black">한가지</span> 묻겠습니다.
            </p>
          </div>
          {/* 스크롤 유도 애니메이션 */}
          <div className="mt-8 flex flex-col items-center">
            <span className="text-gray-300 text-sm mb-2">press (↓)</span>
            <svg
              className="w-8 h-8 animate-bounce text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className="h-screen w-full flex flex-col items-center justify-center snap-start">
        <p
          className="text-white text-xl text-center leading-relaxed"
          style={{ marginBottom: "138px" }}
        >
          당신은 그 [날]을 어떤 계절로 기억하고 있나요?
        </p>
        {/* 계절 선택 버튼 및 안내 메시지: 수직 배치 */}
        <div className="flex flex-col items-center w-full max-w-xl gap-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <button
              className="bg-white rounded-xl py-6 text-xl shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-black"
              onClick={() => handleSeasonSelect("봄")}
            >
              봄<span className="ml-1">🌿</span>
            </button>
            <button
              className="bg-white rounded-xl py-6 text-xl shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-black"
              onClick={() => handleSeasonSelect("여름")}
            >
              여름<span className="ml-1">🏖️</span>
            </button>
            <button
              className="bg-white rounded-xl py-6 text-xl shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-black"
              onClick={() => handleSeasonSelect("가을")}
            >
              가을<span className="ml-1">🍁</span>
            </button>
            <button
              className="bg-white rounded-xl py-6 text-xl shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-black"
              onClick={() => handleSeasonSelect("겨울")}
            >
              겨울<span className="ml-1">⛄️</span>
            </button>
          </div>
          <Link
            to="/memory"
            className="bg-[#4B61E6] rounded-2xl py-8 px-6 w-full text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 block"
            aria-label="잘 모르겠어요. 기억이 안 나요."
            onClick={() => {
              // 메모리 페이지로 이동하기 전에 세션 스토리지 초기화
              sessionStorage.clear();
            }}
          >
            <span className="text-white text-2xl font-semibold">
              잘 모르겠어요. 기억이 안 나요. <span className="ml-1">🤔</span>
            </span>
          </Link>
        </div>
      </section>
      {/* 리셋 버튼 */}
      <Link
        to="/"
        onClick={handleHome}
        className="absolute bottom-8 right-8 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors text-sm"
      >
        Reset
      </Link>
    </div>
  );
};

export default LandingPage;
