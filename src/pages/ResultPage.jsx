import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import colorAnalysisService from '../services/colorAnalysisService';
import useApiStatus from '../hooks/useApiStatus';
import html2canvas from 'html2canvas';

// 퍼스널 컬러 타입 정의
const colorTypes = {
  'spring-warm': {
    title: '봄 웜톤',
    description: '밝고 선명한 컬러가 어울리는 봄 웜톤입니다. 노란빛이 도는 따뜻한 색조가 잘 어울립니다.',
    characteristics: [
      '피부톤이 밝고 투명한 아이보리 또는 복숭아빛',
      '눈동자 색이 선명하고 밝은 갈색이나 다운브라운',
      '머리카락 색이 밝은 갈색이나 노란기가 도는 갈색'
    ],
    recommendedColors: ['#FF9E2C', '#FFE143', '#FF5C00', '#FFA629', '#FFCA3E', '#FF8674'],
    avoidColors: ['#808080', '#000080', '#4B0082', '#6B8E23', '#708090']
  },
  'summer-cool': {
    title: '여름 쿨톤',
    description: '부드럽고 밝은 파스텔 컬러가 어울리는 여름 쿨톤입니다. 파란빛이 도는 차가운 색조가 잘 어울립니다.',
    characteristics: [
      '피부톤이 붉은빛 또는 푸른빛이 도는 핑크베이지',
      '눈동자 색이 부드러운 갈색이나 회갈색',
      '머리카락 색이 재색 또는 쿨한 느낌의 갈색'
    ],
    recommendedColors: ['#7A9CC6', '#E8C6C6', '#D2E8E8', '#C2C2D1', '#AEC9C9', '#BDABBE'],
    avoidColors: ['#FF7518', '#FFA500', '#A0522D', '#F0E68C', '#CD853F']
  },
  'fall-warm': {
    title: '가을 웜톤',
    description: '깊고 중후한 컬러가 어울리는 가을 웜톤입니다. 노란빛이 도는 깊은 색조가 잘 어울립니다.',
    characteristics: [
      '피부톤이 황금빛이 도는 따뜻한 베이지색',
      '눈동자 색이 짙은 갈색이나 검은색',
      '머리카락 색이 진한 밤색, 적갈색 또는 카키색'
    ],
    recommendedColors: ['#825C06', '#987D51', '#814E18', '#6F5946', '#BE8A4A', '#947A45'],
    avoidColors: ['#FF80AB', '#80DEEA', '#B39DDB', '#E6E6FA', '#000000']
  },
  'winter-cool': {
    title: '겨울 쿨톤',
    description: '선명하고 강한 컬러가 어울리는 겨울 쿨톤입니다. 파란빛이 도는 차가운 색조가 잘 어울립니다.',
    characteristics: [
      '피부톤이 푸른빛이 도는 차가운 색감',
      '눈동자 색이 선명한 검은색이나 짙은 갈색',
      '머리카락 색이 짙은 갈색이나 검은색'
    ],
    recommendedColors: ['#E40046', '#1168D9', '#26648E', '#000000', '#FFFFFF', '#0F52BA'],
    avoidColors: ['#EEE8AA', '#F0E68C', '#BDB76B', '#FFDAB9', '#F5F5DC']
  }
};

const ResultPage = () => {
  const navigate = useNavigate();
  const [resultImage, setResultImage] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [colorTypeInfo, setColorTypeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareImageUrl, setShareImageUrl] = useState(null);
  
  // 결과 캡처를 위한 ref
  const resultCardRef = useRef(null);
  
  // 컬러타입 정보 로딩 상태
  const isLoadingColorTypes = useApiStatus('getColorTypes');
  
  // 스페이스바 키 이벤트 처리 - 홈 화면으로 이동
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // 기본 스크롤 동작 방지
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
  
  // 결과 및 컬러 타입 정보 로드
  useEffect(() => {
    const fetchResultData = async () => {
      try {
        // 세션 스토리지에서 분석 결과 가져오기
        const savedResultData = sessionStorage.getItem('analysisResult');
        const savedImage = sessionStorage.getItem('analyzedImage');
        
        if (!savedResultData || !savedImage) {
          setError('분석 결과를 찾을 수 없습니다. 다시 촬영해주세요.');
          return;
        }
        
        // 결과 설정
        const parsedResult = JSON.parse(savedResultData);
        setResultData(parsedResult);
        setResultImage(savedImage);
        
        // 컬러 타입 정보 가져오기 (GitHub Pages 배포 환경에서는 항상 Mock API 사용)
        // const isProd = import.meta.env.MODE === 'production';
        // const colorTypesData = isProd 
        //   ? await colorAnalysisService.getColorTypes({ useCache: true })
        //   : await colorAnalysisService.getColorTypesMock({ useCache: true });
        
        const colorTypesData = await colorAnalysisService.getColorTypesMock({ useCache: true });
        
        if (colorTypesData.success && colorTypesData.data.types) {
          setColorTypeInfo(colorTypesData.data.types);
        } else {
          throw new Error('컬러 타입 정보를 가져오지 못했습니다.');
        }
      } catch (err) {
        console.error('결과 로딩 중 오류:', err);
        setError(err.message || '결과를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResultData();
  }, []);

  // 결과 카드 캡처 함수
  const captureResultCard = async () => {
    if (!resultCardRef.current) return null;

    console.log(resultCardRef.current);

    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#000000',
        scale: 2, // 고해상도로 캡처
        logging: false,
        useCORS: true
      });
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('이미지 캡처 중 오류:', error);
      return null;
    }
  };
  
  // 결과 이미지 캡처 및 저장
  const generateResultImage = async () => {
    const imageUrl = await captureResultCard();
    if (imageUrl) {
      setShareImageUrl(imageUrl);
      return imageUrl;
    }
    return null;
  };
  
  // 이미지 다운로드 함수
  const downloadResult = async () => {
    // 이미지 URL이 없으면 생성
    const imageUrl = shareImageUrl || await generateResultImage();
    if (!imageUrl) {
      alert('이미지 생성에 실패했습니다.');
      return;
    }
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `퍼스널컬러_${resultData.colorType}_결과.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 결과 공유 함수
  const shareResult = async () => {
    // 이미지 URL이 없으면 생성
    const imageUrl = shareImageUrl || await generateResultImage();
    if (!imageUrl) {
      alert('이미지 생성에 실패했습니다.');
      return;
    }
    
    try {
      // 웹 공유 API가 있는지 확인
      if (navigator.share) {
        // 이미지 URL을 Blob으로 변환
        const blob = await fetch(imageUrl).then(r => r.blob());
        const file = new File([blob], '퍼스널컬러결과.png', { type: 'image/png' });
        
        await navigator.share({
          title: '내 퍼스널 컬러 분석 결과',
          text: `나의 퍼스널 컬러는 ${colorTypeInfo[resultData.colorType].title}입니다!`,
          files: [file]
        });
      } else {
        // 공유 API가 없으면 다운로드로 대체
        downloadResult();
        alert('공유 기능이 지원되지 않는 브라우저입니다. 이미지가 다운로드되었습니다.');
      }
    } catch (error) {
      console.error('공유 중 오류:', error);
      alert('결과를 공유하는 중 오류가 발생했습니다.');
    }
  };
  
  // 로딩 중 표시
  if (isLoading || isLoadingColorTypes) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-8"></div>
        <p className="text-white text-xl">결과를 불러오는 중입니다...</p>
      </div>
    );
  }
  
  // 오류 표시
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-black/40 backdrop-blur-md border border-red-500/50 text-red-400 px-8 py-6 rounded-xl mb-8" role="alert">
          <strong className="font-bold">오류 발생!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
        <Link
          to="/capture"
          className="inline-block bg-primary hover:bg-primary-light text-white font-semibold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
        >
          다시 시도하기
        </Link>
      </div>
    );
  }
  
  // 결과 데이터나 컬러 타입 정보가 없는 경우
  if (!resultData || !colorTypeInfo || !colorTypeInfo[resultData.colorType]) {
    return (
      <div className="text-center py-20">
        <div className="bg-black/40 backdrop-blur-md border border-yellow-500/50 text-yellow-400 px-8 py-6 rounded-xl mb-8" role="alert">
          <strong className="font-bold">오류!</strong>
          <span className="block sm:inline ml-2">결과 데이터가 올바르지 않습니다.</span>
        </div>
        <Link
          to="/capture"
          className="inline-block bg-primary hover:bg-primary-light text-white font-semibold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
        >
          다시 촬영하기
        </Link>
      </div>
    );
  }
  
  // 결과 정보 추출
  const colorType = resultData.colorType;
  const confidence = resultData.confidence || 95;
  const colorInfo = colorTypeInfo[colorType];
  
  return (
    <div className="text-center pb-10">
      {/* 결과를 담은 메인 컨테이너를 resultCardRef로 참조 */}
      <div ref={resultCardRef} className="result-content mb-16">
        <h2 className="text-5xl font-bold mb-10 text-white modern-text tracking-tight">
          퍼스널 컬러 <span className="text-primary">분석 결과</span>
        </h2>
        
        {/* 신뢰도 표시 */}
        <div className="mb-10">
          <div className="flex justify-center items-center">
            <span className="text-base text-white/80 mr-3">신뢰도:</span>
            <div className="w-60 h-5 bg-black/40 backdrop-blur-md rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <span className="ml-3 text-lg font-semibold text-white">{confidence}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* 촬영된 이미지 */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl p-8">
            <h3 className="text-2xl font-semibold mb-6 text-white">촬영 이미지</h3>
            {resultImage && (
              <div className="rounded-lg overflow-hidden border border-white/10">
                <img 
                  src={resultImage} 
                  alt="분석된 이미지" 
                  className="w-full max-w-xs mx-auto"
                />
              </div>
            )}
          </div>
          
          {/* 분석 결과 */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl p-8 text-left">
            <h3 className="text-3xl font-bold mb-6 text-white text-center">
              당신은 <span className="text-primary">{colorInfo.title}</span> 입니다
            </h3>
            <p className="mb-6 text-white/80 text-lg leading-relaxed">{colorInfo.description}</p>
            
            <h4 className="font-semibold text-xl mb-4 text-white">특징:</h4>
            <ul className="list-disc list-inside mb-6 text-white/80 text-lg">
              {colorInfo.characteristics.map((char, index) => (
                <li key={index} className="mb-2">{char}</li>
              ))}
            </ul>
            
            <h4 className="font-semibold text-xl mb-4 text-white">추천 컬러:</h4>
            <div className="flex flex-wrap gap-4 mb-6">
              {colorInfo.recommendedColors.map((color, index) => (
                <div 
                  key={index}
                  className="w-14 h-14 rounded-full shadow-lg border border-white/20 transform transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={color}
                ></div>
              ))}
            </div>
            
            <h4 className="font-semibold text-xl mb-4 text-white">피해야 할 컬러:</h4>
            <div className="flex flex-wrap gap-4">
              {colorInfo.avoidColors.map((color, index) => (
                <div 
                  key={index}
                  className="w-14 h-14 rounded-full shadow-lg border border-white/20 transform transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={color}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-6 mb-16">
        <button
          onClick={downloadResult}
          className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          결과 저장하기
        </button>
        <button
          onClick={shareResult}
          className="px-8 py-4 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
          </svg>
          결과 공유하기
        </button>
        <Link
          to="/capture"
          className="px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          다시 촬영하기
        </Link>
      </div>
      
      <div className="mt-10 p-8 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl max-w-3xl mx-auto">
        <h3 className="text-2xl font-semibold mb-6 text-white modern-text">컬러 활용 팁</h3>
        <p className="text-white/80 mb-6 text-lg leading-relaxed">
          퍼스널 컬러를 활용하여 다음과 같은 영역에서 당신의 매력을 더욱 돋보이게 하세요:
        </p>
        <ul className="list-disc list-inside text-white/80 text-left pl-6 text-lg">
          <li className="mb-3"><strong className="text-white">의류:</strong> 위에 제안된 컬러 팔레트를 참고하여 의류를 선택하세요.</li>
          <li className="mb-3"><strong className="text-white">액세서리:</strong> 귀걸이, 목걸이, 시계 등 액세서리도 추천 컬러로 선택하면 좋습니다.</li>
          <li className="mb-3"><strong className="text-white">메이크업:</strong> 립스틱, 아이섀도우, 블러셔 등의 색상을 선택할 때 참고하세요.</li>
          <li><strong className="text-white">헤어 염색:</strong> 머리카락 염색 시 어울리는 컬러를 참고하세요.</li>
        </ul>
      </div>
      
      {/* 하단에 홈으로 이동 버튼 및 스페이스바 안내 추가 */}
      <div className="mt-16">
        <Link
          to="/"
          className="inline-block bg-primary hover:bg-primary-light text-white font-semibold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
        >
          홈으로 돌아가기
        </Link>
        <p className="mt-4 text-sm text-white/70">
          스페이스바를 눌러 홈으로 돌아갈 수 있습니다
        </p>
      </div>
    </div>
  );
};

export default ResultPage; 