import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onImageCapture, onRetake, disabled = false }) => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(true);

  // 사진 촬영 함수
  const capture = useCallback(() => {
    if (webcamRef.current && !disabled) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      
      if (onImageCapture && typeof onImageCapture === 'function') {
        onImageCapture(imageSrc);
      }
      
      setIsCameraActive(false);
    }
  }, [webcamRef, onImageCapture, disabled]);

  // 다시 촬영 함수
  const retake = () => {
    if (!disabled) {
      setImgSrc(null);
      setIsCameraActive(true);
      // 부모 컴포넌트의 상태도 초기화
      if (onRetake && typeof onRetake === 'function') {
        onRetake();
      }
    }
  };

  // 웹캠 접근 오류 처리
  const handleUserMediaError = useCallback((error) => {
    console.error('웹캠 접근 오류:', error);
    setError('카메라에 접근할 수 없습니다. 카메라 권한을 확인하거나 이미지 업로드 기능을 이용해주세요.');
  }, []);

  // 스페이스바 키 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (e) => {
      // 스페이스바 키가 눌렸고, 카메라가 활성화된 상태이며, 비활성화되지 않은 경우
      if (e.code === 'Space' && isCameraActive && !disabled) {
        e.preventDefault(); // 기본 스크롤 동작 방지
        capture();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [capture, isCameraActive, disabled]);



  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-xl overflow-hidden">
        {error ? (
          <div className="p-6 text-red-400 bg-black/40 backdrop-blur-md rounded-lg">
            <p>{error}</p>
          </div>
        ) : imgSrc ? (
          <div className="p-6">
            <div className="relative">
              <img 
                src={imgSrc} 
                alt="촬영된 사진" 
                className="w-full rounded-3xl"
              />
            </div>
            <div className="mt-6 flex justify-between gap-8 px-8">
              <button
                onClick={retake}
                disabled={disabled}
                className={`flex-1 bg-gray-500 rounded-2xl py-3 px-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
                }`}
              >
                <span className="text-white text-base font-medium">다시 촬영하기</span>
              </button>
              <button
                onClick={() => {
                  // 촬영된 이미지를 세션 스토리지에 저장
                  if (imgSrc) {
                    sessionStorage.setItem('capturedImage', imgSrc);
                    sessionStorage.setItem('imageSource', 'webcam');
                  }
                  // 로딩 페이지로 이동
                  navigate('/loading');
                }}
                disabled={disabled}
                className={`flex-1 bg-[#4B61E6] rounded-2xl py-3 px-6 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-white text-base font-medium">다음</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative">
              
              {/* 웹캠 화면 - mirrored 속성을 false로 설정하여 좌우반전 제거 */}
              {isCameraActive && (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 480,
                    height: 560,
                    facingMode: "user",
                  }}
                  mirrored={true}
                  onUserMediaError={handleUserMediaError}
                  className="w-full rounded-3xl"
                />
              )}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={capture}
                disabled={disabled}
                className={`bg-[#4B61E6] rounded-2xl py-2 px-8 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 inline-block ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-white text-base font-medium">촬영하기</span>
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              스페이스바를 눌러 촬영할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture; 