import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import colorAnalysisService from '../services/colorAnalysisService';
import useApiStatus from '../hooks/useApiStatus';
import html2canvas from 'html2canvas';

// 퍼스널 컬러 타입 정의
const colorTypeInfo = {
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
        
        // API 응답 데이터가 있으면 콘솔에 출력 (디버깅용)
        if (parsedResult.apiResponse) {
          console.log('API 응답 원본 데이터:', parsedResult.apiResponse);
        }
        
        // 컬러 타입 정보 가져오기 (Mock API 사용)
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
  // 대표 톤 이름: colorType(기존) 또는 season(신규)
  const colorType = resultData.colorType || resultData.season;
  // 신뢰도: confidence(기존) 또는 probabilities에서 해당 톤의 확률(신규)
  const confidence = resultData.confidence;
  const reason = resultData.reason || resultData.apiResponse.reason;
  const description = resultData.description || resultData.apiResponse.description;
  const feature = resultData.feature || resultData.apiResponse.feature;
  const recommend = resultData.recommend || resultData.apiResponse.recommend;
  const avoid = resultData.avoid || resultData.apiResponse.avoid;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {error ? (
        <div className="text-center">
          <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-600 rounded-xl">
            <p>{error}</p>
          </div>
          <Link
            to="/capture"
            className="inline-block btn-gradient font-semibold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
          >
            다시 촬영하기
          </Link>
        </div>
      ) : isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">결과를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div>
          {/* 결과 카드 */}
          <div ref={resultCardRef} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                당신의 퍼스널 컬러는
                <br />
                <span className="text-gradient">{colorType}</span>
                입니다
              </h2>
              <p className="text-gray-600 text-lg">
                {description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 분석된 이미지 */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">분석된 이미지</h3>
                <div className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={resultImage}
                    alt="분석된 이미지"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 특징 */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">당신의 특징</h3>
                <ul className="space-y-3">
                  {feature.map((char, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-600">{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 신뢰도 바 */}
            <div className="mb-8 mt-12">
              <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">분석 신뢰도</h3>
                <span className="text-sm font-medium text-primary">{confidence}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${confidence}` }}
                ></div>
              </div>
            </div>

            {/* 추천 컬러 팔레트 */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-800">추천 컬러 팔레트</h3>
              <p className="mt-2 text-gray-600 text-sm text-left mb-4">
                이 컬러들을 활용하여 의상, 메이크업, 액세서리를 선택해보세요
              </p>
              <div className="grid grid-cols-6 gap-4">
                {recommend.map((color, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-lg shadow-md relative group"
                    style={{ backgroundColor: color.rgb }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg transition-opacity duration-200 whitespace-nowrap">
                      {color.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 피해야 할 컬러 */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-800">피해야 할 컬러</h3>
              <p className="mt-2 text-gray-600 text-sm text-left mb-4">
                이 컬러들은 가급적 피하는 것이 좋습니다
              </p>
              <div className="grid grid-cols-6 gap-4">
                {avoid.map((color, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-lg shadow-md relative group"
                    style={{ backgroundColor: color.rgb }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg transition-opacity duration-200 whitespace-nowrap">
                      {color.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={downloadResult}
              className="w-full sm:w-auto px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              결과 저장하기
            </button>
            <button
              onClick={shareResult}
              className="w-full sm:w-auto px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
              결과 공유하기
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              홈으로 돌아가기
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">
            스페이스바를 눌러 홈으로 돌아갈 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultPage; 