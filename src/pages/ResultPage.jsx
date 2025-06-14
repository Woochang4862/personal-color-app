import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { sendOSCToTouchDesigner } from '../sendOSCToTouchDesigner';

// 퍼스널 컬러 타입 정의
// const colorTypeInfo = {
//   'spring-warm': {
//     title: '봄 웜톤',
//     description: '밝고 선명한 컬러가 어울리는 봄 웜톤입니다. 노란빛이 도는 따뜻한 색조가 잘 어울립니다.',
//     characteristics: [
//       '피부톤이 밝고 투명한 아이보리 또는 복숭아빛',
//       '눈동자 색이 선명하고 밝은 갈색이나 다운브라운',
//       '머리카락 색이 밝은 갈색이나 노란기가 도는 갈색'
//     ],
//     recommendedColors: ['#FF9E2C', '#FFE143', '#FF5C00', '#FFA629', '#FFCA3E', '#FF8674'],
//     avoidColors: ['#808080', '#000080', '#4B0082', '#6B8E23', '#708090']
//   },
//   'summer-cool': {
//     title: '여름 쿨톤',
//     description: '부드럽고 밝은 파스텔 컬러가 어울리는 여름 쿨톤입니다. 파란빛이 도는 차가운 색조가 잘 어울립니다.',
//     characteristics: [
//       '피부톤이 붉은빛 또는 푸른빛이 도는 핑크베이지',
//       '눈동자 색이 부드러운 갈색이나 회갈색',
//       '머리카락 색이 재색 또는 쿨한 느낌의 갈색'
//     ],
//     recommendedColors: ['#7A9CC6', '#E8C6C6', '#D2E8E8', '#C2C2D1', '#AEC9C9', '#BDABBE'],
//     avoidColors: ['#FF7518', '#FFA500', '#A0522D', '#F0E68C', '#CD853F']
//   },
//   'fall-warm': {
//     title: '가을 웜톤',
//     description: '깊고 중후한 컬러가 어울리는 가을 웜톤입니다. 노란빛이 도는 깊은 색조가 잘 어울립니다.',
//     characteristics: [
//       '피부톤이 황금빛이 도는 따뜻한 베이지색',
//       '눈동자 색이 짙은 갈색이나 검은색',
//       '머리카락 색이 진한 밤색, 적갈색 또는 카키색'
//     ],
//     recommendedColors: ['#825C06', '#987D51', '#814E18', '#6F5946', '#BE8A4A', '#947A45'],
//     avoidColors: ['#FF80AB', '#80DEEA', '#B39DDB', '#E6E6FA', '#000000']
//   },
//   'winter-cool': {
//     title: '겨울 쿨톤',
//     description: '선명하고 강한 컬러가 어울리는 겨울 쿨톤입니다. 파란빛이 도는 차가운 색조가 잘 어울립니다.',
//     characteristics: [
//       '피부톤이 푸른빛이 도는 차가운 색감',
//       '눈동자 색이 선명한 검은색이나 짙은 갈색',
//       '머리카락 색이 짙은 갈색이나 검은색'
//     ],
//     recommendedColors: ['#E40046', '#1168D9', '#26648E', '#000000', '#FFFFFF', '#0F52BA'],
//     avoidColors: ['#EEE8AA', '#F0E68C', '#BDB76B', '#FFDAB9', '#F5F5DC']
//   }
// };

const ResultPage = () => {
  const navigate = useNavigate();
  const [resultImage, setResultImage] = useState(null);
  const [resultData, setResultData] = useState(null);
  // const [colorTypeInfo, setColorTypeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  
  // 결과 캡처를 위한 ref
  const resultCardRef = useRef(null);
  
  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
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
        
        // API 응답 데이터가 있으면 콘솔에 출력 (디버깅용)
        // if (parsedResult.apiResponse) {
        //   console.log('API 응답 원본 데이터:', parsedResult.apiResponse);
        // }
        
        // // 컬러 타입 정보 가져오기 (Mock API 사용)
        // const colorTypesData = await colorAnalysisService.getColorTypesMock({ useCache: true });
        
        // if (colorTypesData.success && colorTypesData.data.types) {
        //   setColorTypeInfo(colorTypesData.data.types);
        // } else {
        //   throw new Error('컬러 타입 정보를 가져오지 못했습니다.');
        // }
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
      return imageUrl;
    }
    return null;
  };
  
  // 이미지 다운로드 함수
  const downloadResult = async () => {
    // 이미지 URL이 없으면 생성
    const imageUrl = await generateResultImage();
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
    const imageUrl = await generateResultImage();
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
  
  // 컬러 선택 처리
  const handleColorSelect = (colorIndex) => {
    setSelectedColor(colorIndex);
  };

  // 확인하기 버튼 처리
  const handleConfirm = async () => {
    if (selectedColor !== null) {
      try {
        // 선택된 컬러 정보를 저장
        sessionStorage.setItem('selectedColorIndex', selectedColor.toString());
        
        // TouchDesigner로 OSC 데이터 전송
        console.log('🚀 Sending OSC data to TouchDesigner...');
        const oscResult = await sendOSCToTouchDesigner(resultData, selectedColor);
        
        // if (oscResult.success) {
        //   alert(`컬러가 선택되었습니다!\n${oscResult.message}`);
        //   console.log('✅ OSC data sent successfully');
        // } else {
        //   alert(`컬러가 선택되었지만 TouchDesigner 전송에 실패했습니다.\n${oscResult.error || '알 수 없는 오류'}`);
        //   console.error('❌ OSC transmission failed:', oscResult.error);
        // }
        
        // 여기서 다음 페이지로 이동하거나 추가 처리 가능
        navigate('/');
        
      } catch (error) {
        console.error('❌ Error in handleConfirm:', error);
        alert('컬러가 선택되었지만 처리 중 오류가 발생했습니다.');
      }
    } else {
      alert('컬러를 선택해주세요.');
    }
  };
  
  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-8"></div>
          <p className="text-white text-xl">결과를 불러오는 중입니다...</p>
        </div>
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
  if (!resultData /* || !colorTypeInfo || !colorTypeInfo[resultData.colorType] */) {
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
  // 대표 톤 이름: colorType(기존) 또는 season(신규)
  const colorType = resultData.apiResponse.season || resultData.season;
  // 신뢰도: confidence(기존) 또는 probabilities에서 해당 톤의 확률(신규)
  const confidence = resultData.confidence;
  const reason = resultData.reason || resultData.apiResponse.reason;
  const description = resultData.description || resultData.apiResponse.description;
  const feature = resultData.feature || resultData.apiResponse.feature;
  const recommend = resultData.recommend || resultData.apiResponse.recommend;
  const avoid = resultData.avoid || resultData.apiResponse.avoid;
  
  return (
    <div className="px-20 w-full overflow-y-auto snap-y snap-mandatory" style={{ height: '100vh' }}>
      {/* 첫 번째 섹션: 진단 결과 */}
      <section className="h-screen w-full flex snap-start" ref={resultCardRef}>
        {/* 왼쪽 영역 */}
        <div className="w-1/2 flex flex-col justify-center items-center">
          <h1 className="text-white text-[40px] font-normal mb-8 tracking-wider">
            당신의 그 [날]은 <span className="font-bold text-[50px]">{colorType.split(' ')[0]}</span> 입니다.
          </h1>
          
          {/* 이미지 영역 - 파란색 테두리 */}
          <div className="w-96 h-96 border-2 border-blue-500 rounded-[44px] overflow-hidden">
            <img
              src={resultImage}
              alt="분석된 이미지"
              className="w-full h-full object-cover"
            />
          </div>
          
          <p className="text-white text-lg text-center mt-16 leading-relaxed">
            당신을 보면 햇살 아래 피어난 봄꽃🌼 이 떠올라요.
          </p>
        </div>
        
        {/* 오른쪽 영역 */}
        <div className="w-1/2 flex flex-col justify-center">
          {/* 진단 결과 */}
          <div className="mb-12">
            <h2 className="text-white text-[22px] font-bold mb-3 leading-relaxed">
              [진단 결과]
            </h2>
            <p className="text-white text-[18px] leading-relaxed ps-4">
              {description}
            </p>
          </div>
          
          {/* 코디 제안 */}
          <div>
            <h2 className="text-white text-[22px] font-bold mb-3 leading-relaxed">
              [코디 제안]
            </h2>
            <div className="text-white text-[18px] leading-relaxed ps-4">
              <p className="mb-4">
                이너로: 크림 베이지, 라이트 옐로우, 피치빛 톤의 티셔츠<br />
                → 파란 가디건과 부드럽게 어우러지면서 봄 특유의 따뜻한 무드를 살릴 수 있어요!
              </p>
              <p className="mb-4">
                액세서리: 골드 귀걸이, 밝은 코랄 립<br />
                → 봄 웜톤에게 잘 어울리는 따뜻한 느낌의 포인트로 얼굴이 더 생기 있어 보여요.
              </p>
              <p>
                신발: 아이보리 로퍼나 연한 카멜색 플랫 슈즈<br />
                → 흰 바지와 자연스럽게 연결되면서 전체적으로 부드럽고 세련된 인상을 줄 수 있어요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 두 번째 섹션: 컬러 선택 */}
      <section className="h-screen w-full flex flex-col justify-center items-center snap-start">
        <h2 className="text-white text-3xl font-normal mb-8 text-center">
          당신에게는 이런 컬러가 어울릴 것 같아요
        </h2>
        
        {/* 컬러 선택 영역 */}
        <div className="flex gap-20 mb-16">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => handleColorSelect(index)}
              className={`w-24 h-24 rounded-full transition-all duration-300 ${
                selectedColor === index 
                  ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-gray-800' 
                  : 'hover:scale-110'
              }`}
              style={{ 
                backgroundColor: recommend[index]?.rgb || '#D9D9D9'
              }}
            />
          ))}
        </div>
        
        <p className="text-[#A0A0A0] text-[18px] mb-[200px] text-center">
          한가지 컬러를 선택해주세요
        </p>
        
        <p className="text-white text-xl mb-8 text-center">
          나비🦋 가 되어 그 [날]로 들어가볼까요?
        </p>
        
        {/* 확인하기 버튼 */}
        <button
          onClick={handleConfirm}
          disabled={selectedColor === null}
          className={`px-10 py-2 rounded-full text-white text-xl font-bold transition-all duration-300 ${
            selectedColor !== null
              ? 'bg-[#3A4EFF] hover:bg-[#596aff] hover:shadow-lg'
              : 'bg-gray-500 cursor-not-allowed opacity-50'
          }`}
        >
          확인하기
        </button>

        {/* 홈으로 돌아가기 버튼 (하단 우측) */}
        <Link
          to="/"
          className="absolute bottom-8 right-8 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors text-sm"
        >
          홈으로 돌아가기 (Space)
        </Link>
      </section>
    </div>
  );
};

export default ResultPage; 