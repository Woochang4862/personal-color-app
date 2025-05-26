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
      <h2 className="text-4xl font-bold mb-10 text-gray-800 modern-text">
        <span className="text-primary">사진</span> 촬영 또는 업로드
      </h2>
      
      {/* 오류 메시지 표시 */}
      {error && (
        <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-600 rounded-xl">
          <p>{error}</p>
        </div>
      )}
      
      {/* 탭 선택 UI */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-full shadow-lg overflow-hidden" role="group">
          <button
            type="button"
            className={`px-6 py-4 text-base font-medium transition-colors ${
              activeTab === 'webcam'
                ? 'bg-primary text-white'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
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
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('upload')}
            disabled={isLoading}
          >
            이미지 업로드
          </button>
        </div>
      </div>

      {/* 안내 메시지 */}
      <p className="mb-10 text-gray-600 text-lg tracking-wide">
        {activeTab === 'webcam'
          ? '자연광 아래에서 정면을 바라보고 촬영해주세요.'
          : '얼굴이 또렷하게 나온 정면 사진을 업로드해주세요.'}
      </p>

      {/* 웹캠 또는 업로드 UI */}
      {activeTab === 'webcam' ? (
        <WebcamCapture onImageCapture={handleImageCapture} disabled={isLoading} />
      ) : (
        <div className="w-full max-w-md mx-auto">
          <div className="bg-gray-50 rounded-xl overflow-hidden shadow-lg p-6 border border-gray-200">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {uploadedImage ? (
                <div>
                  <img
                    src={uploadedImage}
                    alt="업로드된 사진"
                    className="max-w-full h-auto mx-auto rounded-md"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="mt-6 px-5 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    다시 업로드
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-6"
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
                  <p className="mb-3 text-base text-gray-600">
                    <span className="font-semibold">클릭하여 사진 업로드</span> 또는 파일을 끌어서 놓기
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG, JPEG (최대 10MB)</p>
                  <input
                    id="fileUpload"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 분석 버튼 */}
      {(capturedImage || uploadedImage) && (
        <div className="mt-10">
          <button
            onClick={analyzeImage}
            disabled={isLoading}
            className={`btn-gradient text-xl font-semibold py-4 px-10 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover: ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? '분석 중...' : '퍼스널 컬러 분석하기'}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            스페이스바를 눌러 분석을 시작할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
};

export default CapturePage; 