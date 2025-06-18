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
  const placeholder = "흰 셔츠, 베이지색 바지, 귀여운 키링이 달린 배낭";
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
      description: '오밀조밀하고 귀여운 일러스트',
      emotion: '설렘과 희망이 가득한'
    },
    {
      id: 'summer',
      src: memoryImage2,
      season: '여름',
      title: '장미가 만발한 테라스',
      description: '강렬한 붓 스트로크로 표현되는 \n 고전적인 유화',
      emotion: '에너지 넘치는'
    },
    {
      id: 'autumn',
      src: memoryImage3,
      season: '가을',
      title: '단풍이 물든 정원',
      description: '사람의 시야를 그대로 담은 사진',
      emotion: '깊이 있고 고요한'
    },
    {
      id: 'winter',
      src: memoryImage4,
      season: '겨울',
      title: '고요한 겨울 나비',
      description: '변형되고 뒤틀린 우연의 미학',
      emotion: '평온하고 신비로운'
    }
  ];

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  const handleOutfitSubmit = (e) => {
    e.preventDefault();
    if (outfitDescription.trim()) {
      // 선택된 계절과 옷차림 설명을 저장하고 로딩 페이지로 이동
      setOutfitDescription(placeholder);
    }
    sessionStorage.setItem('selectedImage', selectedImage);
    sessionStorage.setItem('outfitDescription', outfitDescription.trim());
    navigate('/capture');
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
              placeholder={placeholder}
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
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full h-full flex items-center justify-center">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 텍스트 */}
          <div className="text-center mb-16">
            <p className="text-white text-xl text-center leading-relaxed">
              괜찮아요. 제가 떠올릴 수 있도록 도와드릴게요.<br/>
              당신의 눈에 들어오는 세계는 무엇인가요?
            </p>
          </div>

          {/* 이미지 그리드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-80 justify-items-center max-w-6xl mx-auto mb-20">
            {memoryImages.map((image, index) => (
              <div
                key={image.id}
                className="relative group cursor-pointer h-[500px] flex flex-col justify-center items-center"
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => handleImageSelect(index)}
              >
                {/* 이미지 컨테이너 */}
                <div className="relative w-80 h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl flex items-center justify-center">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  {/* 호버 오버레이 */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                    hoveredImage === index 
                      ? 'bg-black/30 backdrop-blur-sm' 
                      : 'bg-transparent'
                  }`}>
                    {/* 설명 박스 */}
                    <div className={`transition-opacity duration-300 ${hoveredImage === index ? 'opacity-100' : 'opacity-0'}`}> 
                      <div className="bg-white/20 rounded-xl px-4 py-2 border border-white/30 shadow-xl flex items-center justify-center min-h-[60px]">
                        <p className="text-sm text-white leading-relaxed whitespace-pre-line text-center" style={{textShadow: '0 0 10px rgba(0, 0, 0, 0.5)'}}>
                          {image.description}
                        </p>
                      </div>
                    </div>
                  </div>
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