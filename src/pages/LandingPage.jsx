import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mainLogo from '../assets/main_logo.png';
import noise from '../assets/noise.svg';

const LandingPage = () => {
  const navigate = useNavigate();

  // 스페이스바 키 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // 기본 스크롤 동작 방지
        navigate('/capture');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  // 계절 버튼 클릭 핸들러
  const handleSeasonSelect = (season) => {
    sessionStorage.setItem('selectedSeason', season);
    navigate('/loading');
  };

  return (
    <div className="w-full">
      <section className="h-screen w-full flex items-center justify-center snap-start">
        <div className="text-center max-w-4xl mx-auto px-6 h-screen w-full flex flex-col justify-between items-center py-8">
          <div className="flex-1 flex items-center justify-center w-full">
            <img src={mainLogo} alt="mainLogo" className="w-2/3 max-w-lg mx-auto" />
          </div>
          <p className="w-full text-sm text-gray-400 text-center">Design By USW DataScience Department</p>
        </div> 
      </section>

      <section className="h-screen w-full flex items-center justify-center snap-start">
        <p className="text-white text-xl text-center leading-relaxed">
          계절은 덧없게 지나갑니다.<br/>
          행복도, 슬픔도, 아픔도, 사랑도.<br/>
          우리의 모든 추억은 시간 속에서 계절과 함께 있습니다.
        </p>
      </section>
      
      <section className="h-screen w-full flex items-center justify-center snap-start">
        <p className="text-white text-xl text-center leading-relaxed">
          <span className="font-black">봄</span>의 싱그러움🌿, <span className="font-black">여름</span>의 청량함🏖️, <span className="font-black">가을</span>의 차분함🍁, <span className="font-black">겨울</span>의 고요함⛄️<br/>
          그 [날]은 왠지 그 <span className="relative inline-block align-middle">
            <img src={noise} alt="noise" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 pointer-events-none select-none" style={{zIndex:2}} />
            <span className="font-black relative z-0">사계</span>
          </span>한 날씨와 참 잘 어울렸던 것 같습니다.<br/>
          그야말로 
          <span className="relative inline-block align-middle">
            <img src={noise} alt="noise" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 pointer-events-none select-none" style={{zIndex:2}} />
            <span className="font-black relative z-0">사계</span>
          </span>
          이었죠.
        </p>
      </section>
      
      <section className="h-screen w-full flex items-center justify-center snap-start">
        <p className="text-white text-xl text-center leading-relaxed">
          ...?<br/>
          그 [날]을 잊고 계시군요.<br/>
          <br/>
          걱정마세요. <br/>
          제가 그 [날]의 기억을 당신 앞으로 가져와 드릴게요.<br/>
          <span className="font-black">한가지</span> 묻겠습니다.
        </p>
      </section>

      <section className="h-screen w-full flex flex-col items-center justify-center snap-start">
        <p className="text-white text-xl text-center leading-relaxed" style={{ marginBottom: '138px' }}>
          당신은 그 [날]을 어떤 계절로 기억하고 있나요?
        </p>
        {/* 계절 선택 버튼 및 안내 메시지: 수직 배치 */}
        <div className="flex flex-col items-center w-full max-w-xl gap-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <button className="bg-white rounded-xl py-6 text-xl shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-black" onClick={() => handleSeasonSelect('봄')}>
              봄<span className="ml-1">🌿</span>
            </button>
            <button className="bg-white rounded-xl py-6 text-xl shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-black" onClick={() => handleSeasonSelect('여름')}>
              여름<span className="ml-1">🏖️</span>
            </button>
            <button className="bg-white rounded-xl py-6 text-xl shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-black" onClick={() => handleSeasonSelect('가을')}>
              가을<span className="ml-1">🍁</span>
            </button>
            <button className="bg-white rounded-xl py-6 text-xl shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-black" onClick={() => handleSeasonSelect('겨울')}>
              겨울<span className="ml-1">⛄️</span>
            </button>
          </div>
          <Link
            to="/memory"
            className="bg-[#4B61E6] rounded-2xl py-8 px-6 w-full text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 block"
            aria-label="잘 모르겠어요. 기억이 안 나요."
          >
            <span className="text-white text-2xl font-semibold">잘 모르겠어요. 기억이 안 나요. <span className="ml-1">🤔</span></span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 