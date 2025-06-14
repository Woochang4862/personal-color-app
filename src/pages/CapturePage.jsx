import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from '../components/webcam/WebcamCapture';
import colorAnalysisService from '../services/colorAnalysisService';
import useApiStatus from '../hooks/useApiStatus';

const CapturePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('webcam');
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);
  
  const isLoading = useApiStatus('analyzeImage');

  const handleImageCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setError(null);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result);
      setError(null);
    };
    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
  };



  useEffect(() => {
    setError(null);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#343434] p-6 justify-center items-center">
      <div className="max-w-6xl mx-auto">

        {/* Error Message */}
        {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-xl shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="mb-12">
          {activeTab === 'webcam' ? (
            <div className="p-8">
              <div className="text-center mb-4">
                <p className="text-white text-lg">당신의 모습을 보여주세요</p>
              </div>
                              <WebcamCapture onImageCapture={handleImageCapture} onRetake={handleRetake} disabled={isLoading} />
            </div>
          ) : (
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">이미지 업로드하기</h3>
                <p className="text-gray-600">얼굴이 또렷하게 나온 정면 사진을 선택해주세요</p>
              </div>
              
              {uploadedImage ? (
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={uploadedImage}
                      alt="업로드된 사진"
                      className="max-w-full max-h-96 rounded-xl shadow-lg"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      disabled={isLoading}
                      className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-4 text-gray-600">이미지가 업로드되었습니다!</p>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        // 업로드된 이미지를 세션 스토리지에 저장
                        sessionStorage.setItem('capturedImage', uploadedImage);
                        sessionStorage.setItem('imageSource', 'upload');
                        // 로딩 페이지로 이동
                        navigate('/loading');
                      }}
                      disabled={isLoading}
                      className="bg-[#4B61E6] text-white px-8 py-3 rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-medium"
                    >
                      분석 시작하기
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="fileUpload" className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">사진을 업로드하세요</h4>
                    <p className="text-gray-600 mb-4">클릭하거나 파일을 드래그해서 업로드</p>
                    <p className="text-sm text-gray-500">PNG, JPG, JPEG (최대 10MB)</p>
                  </div>
                  <input
                    id="fileUpload"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                </label>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapturePage; 