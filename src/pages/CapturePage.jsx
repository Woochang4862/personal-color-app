import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from '../components/webcam/WebcamCapture';
import colorAnalysisService from '../services/colorAnalysisService';
import useApiStatus from '../hooks/useApiStatus';

const CapturePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('webcam'); // 'webcam' 또는 'upload'
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);
  
  // useApiStatus 훅을 사용하여 API 로딩 상태 관리
  const isLoading = useApiStatus('analyzeImage');

  // 웹캠으로 촬영한 이미지 처리
  const handleImageCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setError(null); // 새 이미지를 캡처하면 이전 오류 초기화
  };

  // 이미지 업로드 처리
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result);
      setError(null); // 새 이미지를 업로드하면 이전 오류 초기화
    };
    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
  };

  // 이미지 분석 요청
  const analyzeImage = async () => {
    const imageToAnalyze = activeTab === 'webcam' ? capturedImage : uploadedImage;
    if (!imageToAnalyze) {
      setError('분석할 이미지가 없습니다. 사진을 촬영하거나 업로드해주세요.');
      return;
    }

    try {
      setError(null);
      
      // analyzeImageMock 함수를 사용하여 분석 요청 (이제 실제 API 호출을 구현함)
      const result = await colorAnalysisService.analyzeImageMock(imageToAnalyze);
      
      if (result.success) {
        // 결과 저장 및 결과 페이지로 이동
        sessionStorage.setItem('analysisResult', JSON.stringify(result.data));
        sessionStorage.setItem('analyzedImage', imageToAnalyze);
        navigate('/result');
      } else {
        setError(result.message || '분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('분석 중 오류 발생:', error);
      setError(error.message || '분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 스페이스바 키 감지 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 이미지가 존재하고, 분석 중이 아니며, 스페이스바를 눌렀을 때
      if (
        e.code === 'Space' && 
        !isLoading && 
        (capturedImage || uploadedImage)
      ) {
        e.preventDefault(); // 스크롤 방지
        analyzeImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [capturedImage, uploadedImage, isLoading]);

  // 탭 변경 시 상태 초기화
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-10 text-white modern-text">
        <span className="text-primary">사진</span> 촬영 또는 업로드
      </h2>
      
      {/* 오류 메시지 표시 */}
      {error && (
        <div className="mb-8 p-5 bg-black/40 backdrop-blur-md border border-red-500/50 text-red-400 rounded-xl">
          <p>{error}</p>
        </div>
      )}
      
      {/* 탭 선택 UI */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-full shadow-2xl overflow-hidden" role="group">
          <button
            type="button"
            className={`px-6 py-4 text-base font-medium transition-colors ${
              activeTab === 'webcam'
                ? 'bg-primary text-white'
                : 'text-white bg-black/30 backdrop-blur-md hover:bg-black/50'
            }`}
            onClick={() => setActiveTab('webcam')}
            disabled={isLoading}
          >
            웹캠으로 촬영
          </button>
          <button
            type="button"
            className={`px-6 py-4 text-base font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-primary text-white'
                : 'text-white bg-black/30 backdrop-blur-md hover:bg-black/50'
            }`}
            onClick={() => setActiveTab('upload')}
            disabled={isLoading}
          >
            이미지 업로드
          </button>
        </div>
      </div>

      {/* 안내 메시지 */}
      <p className="mb-10 text-white/80 text-lg tracking-wide">
        {activeTab === 'webcam'
          ? '자연광 아래에서 정면을 바라보고 촬영해주세요.'
          : '얼굴이 또렷하게 나온 정면 사진을 업로드해주세요.'}
      </p>

      {/* 웹캠 또는 업로드 UI */}
      {activeTab === 'webcam' ? (
        <WebcamCapture onImageCapture={handleImageCapture} disabled={isLoading} />
      ) : (
        <div className="w-full max-w-md mx-auto">
          <div className="bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl p-6 border border-white/10">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              {uploadedImage ? (
                <div>
                  <img
                    src={uploadedImage}
                    alt="업로드된 사진"
                    className="max-w-full h-auto mx-auto rounded-md"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="mt-6 px-5 py-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    disabled={isLoading}
                  >
                    다시 업로드
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    className="w-16 h-16 text-white/50 mx-auto mb-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="mb-3 text-base text-white/80">
                    <span className="font-semibold">클릭하여 사진 업로드</span> 또는 파일을 끌어서 놓기
                  </p>
                  <p className="text-sm text-white/50">PNG, JPG, JPEG (최대 10MB)</p>
                  <input
                    id="fileUpload"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="fileUpload"
                    className={`mt-8 inline-block px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-full text-base transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-xl ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    파일 선택
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 분석 버튼 */}
      <div className="mt-12">
        <button
          onClick={analyzeImage}
          disabled={isLoading || !(capturedImage || uploadedImage)}
          className={`px-10 py-4 rounded-full text-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
            isLoading
              ? 'bg-black/50 cursor-not-allowed'
              : capturedImage || uploadedImage
              ? 'bg-primary hover:bg-primary-light text-white'
              : 'bg-black/50 cursor-not-allowed text-white/60'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              분석중...
            </span>
          ) : (
            '퍼스널 컬러 분석하기'
          )}
        </button>
        {(capturedImage || uploadedImage) && !isLoading && (
          <p className="mt-3 text-sm text-white/70">
            스페이스바를 눌러서 분석을 시작할 수 있습니다
          </p>
        )}
      </div>
    </div>
  );
};

export default CapturePage; 