import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

  return (
    <div className="snap-y snap-mandatory h-screen w-full overflow-y-auto scroll-smooth overflow-x-hidden">
      <section className="snap-start h-screen w-full flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-6">
          <h2 className="text-6xl font-bold mb-8 text-white modern-text tracking-tight">
            <span className="block mb-3">당신만의</span>
            <span className="text-gradient">컬러</span>를 발견하세요
          </h2>
          <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto leading-relaxed tracking-wide">
            퍼스널 컬러 진단을 통해 당신의 피부톤, 머리카락, 눈동자 색상을 분석하여 
            가장 잘 어울리는 색상을 알아보세요.
          </p>
          
          <Link
            to="/capture"
            className="inline-block btn-gradient font-semibold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
          >
            지금 진단 시작하기
          </Link>
          
          <p className="mt-4 text-sm text-white/70">
            스페이스바를 눌러 진단을 시작할 수 있습니다
          </p>
        </div>
      </section>

      <section className="snap-start h-screen w-full flex items-center justify-center">
        <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-12 hover:shadow-2xl transition-all duration-300 max-w-2xl mx-6">
          <div className="mb-8">
            <svg className="h-20 w-20 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 className="text-3xl font-semibold mb-8 text-white text-center">간편한 <span className="text-gradient">사진 촬영</span></h3>
          <p className="text-white/70 text-xl text-center leading-relaxed">
            웹캠으로 바로 촬영하거나 기존 사진을 업로드하세요. 자연광 아래에서 촬영된 정면 사진이 가장 정확한 분석 결과를 제공합니다.
            특별한 장비나 설정 없이도 몇 초 만에 촬영을 완료할 수 있습니다.
          </p>
        </div>
      </section>
      
      <section className="snap-start h-screen w-full flex items-center justify-center">
        <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-12 hover:shadow-2xl transition-all duration-300 max-w-2xl mx-6">
          <div className="mb-8">
            <svg className="h-20 w-20 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h3 className="text-3xl font-semibold mb-8 text-white text-center"><span className="text-gradient">AI 기반</span> 분석</h3>
          <p className="text-white/70 text-xl text-center leading-relaxed">
            고급 알고리즘으로 당신의 고유한 컬러 특성을 정확하게 진단합니다. 피부톤, 머리카락, 눈동자 색을 복합적으로 분석하여
            당신에게 가장 잘 어울리는 계절 타입을 결정합니다. 95% 이상의 높은 정확도를 자랑합니다.
          </p>
        </div>
      </section>
      
      <section className="snap-start h-screen w-full flex items-center justify-center">
        <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-12 hover:shadow-2xl transition-all duration-300 max-w-2xl mx-6">
          <div className="mb-8">
            <svg className="h-20 w-20 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
            </svg>
          </div>
          <h3 className="text-3xl font-semibold mb-8 text-white text-center">맞춤형 <span className="text-gradient">컬러 팔레트</span></h3>
          <p className="text-white/70 text-xl text-center leading-relaxed">
            당신에게 가장 잘 어울리는 색상 팔레트를 받아보세요. 의류, 메이크업, 액세서리 선택에 활용할 수 있는
            구체적인 컬러 가이드와 피해야 할 색상까지 상세하게 제공합니다. 이제 쇼핑이 더 쉬워집니다.
          </p>
        </div>
      </section>

      <section className="snap-start h-screen w-full flex items-center justify-center">
        <div className="text-center max-w-4xl px-6">
          <h3 className="text-3xl font-semibold mb-8 text-white modern-text">퍼스널 <span className="text-gradient">컬러</span>란?</h3>
          <p className="text-white/80 text-xl max-w-3xl mx-auto leading-relaxed mb-12">
            퍼스널 컬러는 개인의 피부톤, 머리카락, 눈동자 색과 조화를 이루는 색상 그룹입니다. 
            올바른 퍼스널 컬러를 찾으면 더 건강하고 활기찬 모습으로 보이게 하며, 
            패션과 메이크업 선택을 더 쉽고 자신감 있게 만들어줍니다.
          </p>
          
          <Link
            to="/capture"
            className="inline-block btn-gradient font-semibold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
          >
            지금 진단 시작하기
          </Link>
          
          <p className="mt-4 text-sm text-white/70">
            스페이스바를 눌러 진단을 시작할 수 있습니다
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 