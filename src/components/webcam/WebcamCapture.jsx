import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onImageCapture, disabled = false }) => {
  const webcamRef = useRef(null);
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
      <div className="bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-white/10">
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
                className="w-full rounded-md"
              />
              {disabled && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md backdrop-blur-sm">
                  <div className="animate-pulse bg-black/70 px-6 py-4 rounded-full">
                    <p className="text-white font-medium">처리 중...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={retake}
                disabled={disabled}
                className={`px-6 py-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all duration-300 transform hover:-translate-y-1 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                다시 촬영하기
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative">
              {/* 얼굴 위치 가이드 오버레이 */}
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-52 border-3 border-dashed border-primary rounded-full opacity-70"></div>
              </div>
              
              {/* 웹캠 화면 - mirrored 속성을 false로 설정하여 좌우반전 제거 */}
              {isCameraActive && (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 480,
                    height: 480,
                    facingMode: "user",
                  }}
                  mirrored={false}
                  onUserMediaError={handleUserMediaError}
                  className="w-full rounded-lg"
                />
              )}
              
              {/* 로딩 오버레이 */}
              {disabled && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md backdrop-blur-sm">
                  <div className="animate-pulse bg-black/70 px-6 py-4 rounded-full">
                    <p className="text-white font-medium">처리 중...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={capture}
                disabled={disabled}
                className={`px-8 py-3 bg-primary text-white rounded-full hover:bg-primary-light transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                사진 촬영
              </button>
            </div>
            <p className="mt-3 text-xs text-white/70 text-center">
              스페이스바를 눌러 촬영할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture; 