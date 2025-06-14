import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 이미지 import
import memoryImage1 from '../assets/memory_image1.png'; // 봄 - 피크닉
import memoryImage2 from '../assets/memory_image2.png'; // 여름 - 장미 테라스
import memoryImage3 from '../assets/memory_image3.png'; // 가을 - 일본 정원
import memoryImage4 from '../assets/memory_image4.png'; // 겨울 - 나비

const MemoryPage = () => {
  const navigate = useNavigate();
  const [hoveredImage, setHoveredImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [outfitDescription, setOutfitDescription] = useState('');

  // 페이지 로드 시 스크롤을 상단으로 이동
  useEffect(() => {
    const mainElement = document.getElementsByTagName("main")[0];
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }
  }, []);

  const memoryImages = [
    {
      id: 'spring',
      src: memoryImage1,
      season: '봄',
      title: '따스한 햇살 아래 피크닉',
      description: '하늘은 수채화 물감을 끼얹은 것 같았어요',
      emotion: '설렘과 희망이 가득한'
    },
    {
      id: 'summer',
      src: memoryImage2,
      season: '여름',
      title: '장미가 만발한 테라스',
      description: '뜨거운 태양과 푸른 하늘\n열정적이고 활기찬 계절',
      emotion: '에너지 넘치는'
    },
    {
      id: 'autumn',
      src: memoryImage3,
      season: '가을',
      title: '단풍이 물든 정원',
      description: '낙엽이 떨어지고 단풍이 드는\n차분하고 성숙한 계절',
      emotion: '깊이 있고 고요한'
    },
    {
      id: 'winter',
      src: memoryImage4,
      season: '겨울',
      title: '고요한 겨울 나비',
      description: '눈이 내리고 모든 것이 고요한\n순수하고 깨끗한 계절',
      emotion: '평온하고 신비로운'
    }
  ];

  const handleImageSelect = (season, imageData) => {
    setSelectedImage({ season, ...imageData });
  };

  const handleOutfitSubmit = (e) => {
    e.preventDefault();
    if (outfitDescription.trim()) {
      // 선택된 계절과 옷차림 설명을 저장하고 로딩 페이지로 이동
      sessionStorage.setItem('selectedSeason', selectedImage.season);
      sessionStorage.setItem('selectedImageData', JSON.stringify(selectedImage));
      sessionStorage.setItem('outfitDescription', outfitDescription.trim());
      // 더미 이미지를 설정 (실제로는 사용자가 업로드한 이미지가 있어야 함)
      sessionStorage.setItem('capturedImage', selectedImage.src);
      sessionStorage.setItem('imageSource', 'memory');
      navigate('/capture');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleOutfitSubmit(e);
    }
  };

  const handleBackToSelection = () => {
    setSelectedImage(null);
    setOutfitDescription('');
  };

  // 이미지 선택 후 텍스트 입력 화면
  if (selectedImage) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto w-full min-h-screen flex items-center justify-center">
        <div className="text-center w-full">
          {/* 질문 텍스트 */}
          <h1 className="text-white text-2xl mb-12 leading-relaxed">
            그 [날] 당신은 어떤 모습이었나요?
          </h1>

          {/* 텍스트 입력창 */}
          <form onSubmit={handleOutfitSubmit} className="mb-8">
            <input
              type="text"
              value={outfitDescription}
              onChange={(e) => setOutfitDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="흰 셔츠, 베이지색 바지, 귀여운 키링이 달린 배낭"
              className="w-full max-w-2xl px-6 py-4 text-lg text-gray-700 bg-white rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
              autoFocus
            />
          </form>

          {/* 안내 텍스트 */}
          <p className="text-gray-400 text-sm mb-12">
            Tip. 오늘 당신의 옷차림을 입력해주세요
          </p>

          {/* 뒤로가기 버튼 */}
          <button
            onClick={handleBackToSelection}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm border border-white/20"
          >
            ← 이미지 선택으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 기본 이미지 선택 화면
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 텍스트 */}
          <div className="text-center mb-16">
            <p className="text-white text-xl text-center leading-relaxed">
              괜찮아요. 제가 떠올릴 수 있도록 도와드릴게요.<br/>
              그 날은 어떤 풍경이었나요?
            </p>
          </div>

          {/* 이미지 그리드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-80 justify-items-center max-w-6xl mx-auto mb-20">
            {memoryImages.map((image, index) => (
              <div
                key={image.id}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => handleImageSelect(image.season, image)}
              >
                {/* 이미지 컨테이너 */}
                <div className="relative w-80 h-[500px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  
                    {/* 호버 오버레이 */}
                    <div className={`absolute inset-0 transition-all duration-500 ${
                      hoveredImage === index 
                        ? 'bg-black/30 backdrop-blur-sm' 
                        : 'bg-transparent'
                    }`}>
                      {/* 글래스모피즘 설명 박스 - 항상 블러 효과 유지 */}
                      <div className={`absolute inset-x-4 bottom-1/2 translate-y-1/2 transition-opacity duration-300 transform backdrop-blur-sm ${
                        hoveredImage === index 
                          ? 'opacity-100' 
                          : 'opacity-0'
                      }`} style={{transform: 'translateZ(0) translateY(50%)'}}>
                                                 <div className="bg-white/20 rounded-xl px-2 py-1 border border-white/30 shadow-xl will-change-transform" style={{transform: 'translateZ(0)'}}>
                          <div className="flex items-center justify-center min-h-[30px]">
                            <p className="text-sm text-white leading-relaxed whitespace-pre-line text-center" style={{textShadow: '0 0 10px rgba(0, 0, 0, 0.5)'}}>
                              {image.description}
                            </p>
                          </div>
                        </div>
                    </div>
                  </div>

                  {/* 계절 라벨 (항상 표시) */}
                  {/* <div className="absolute top-4 left-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <span className="text-white font-semibold text-sm">
                        {image.season}
                      </span>
                    </div>
                  </div> */}

                  {/* 선택 표시 */}
                  {/* <div className={`absolute top-4 right-4 transition-all duration-300 ${
                    hoveredImage === index 
                      ? 'scale-100 opacity-100' 
                      : 'scale-75 opacity-0'
                  }`}>
                    <div className="bg-blue-500/80 backdrop-blur-sm rounded-full p-2 border border-white/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div> */}
                </div>
              </div>
            ))}
          </div>

          {/* 하단 안내 메시지 */}
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-6">
              가장 비슷한 느낌의 이미지를 선택해주세요
            </p>
            
            {/* 뒤로가기 버튼 */}
            <button
              onClick={() => navigate('/')}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm border border-white/20"
            >
              ← 처음으로 돌아가기
            </button>
          </div>
        </div>
    </div>
  );
};

export default MemoryPage; 