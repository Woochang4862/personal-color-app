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

  const analyzeImage = async () => {
    const imageToAnalyze = activeTab === 'webcam' ? capturedImage : uploadedImage;
    if (!imageToAnalyze) {
      setError('분석할 이미지가 없습니다. 사진을 촬영하거나 업로드해주세요.');
      return;
    }

    try {
      setError(null);
      const result = await colorAnalysisService.analyzeImageDirect(imageToAnalyze);
      
      if (result.success) {
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === 'Space' && 
        !isLoading && 
        (capturedImage || uploadedImage)
      ) {
        e.preventDefault();
        analyzeImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [capturedImage, uploadedImage, isLoading]);

  useEffect(() => {
    setError(null);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-800 mb-4 leading-tight">
            당신의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">계절</span>을 찾아보세요
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            자연광에서 촬영한 정면 사진으로 가장 정확한 퍼스널 컬러 분석을 받아보세요
          </p>
        </div>

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

        {/* Tab Selection */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-xl border border-gray-100">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('webcam')}
                disabled={isLoading}
                className={`flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  activeTab === 'webcam'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                웹캠 촬영
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                disabled={isLoading}
                className={`flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                이미지 업로드
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Tips */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 h-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-3"></span>
                촬영 가이드
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">자연광 활용</h4>
                    <p className="text-gray-600 text-sm">창가나 야외에서 자연광을 받으며 촬영하세요</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">정면 촬영</h4>
                    <p className="text-gray-600 text-sm">카메라를 정면으로 바라보며 촬영하세요</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">메이크업 최소화</h4>
                    <p className="text-gray-600 text-sm">자연스러운 피부톤 분석을 위해 진한 메이크업은 피해주세요</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Camera/Upload */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {activeTab === 'webcam' ? (
                <div className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">웹캠으로 촬영하기</h3>
                    <p className="text-gray-600">카메라를 허용하고 정면을 바라보며 촬영해주세요</p>
                  </div>
                  <WebcamCapture onImageCapture={handleImageCapture} disabled={isLoading} />
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

        {/* Analysis Button */}
        {(capturedImage || uploadedImage) && (
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">분석 준비 완료!</h3>
                <p className="text-gray-600">이제 퍼스널 컬러 분석을 시작할 수 있습니다</p>
              </div>
              
              <button
                onClick={analyzeImage}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    분석 중...
                  </div>
                ) : (
                  '🎨 퍼스널 컬러 분석 시작'
                )}
              </button>
              
              <p className="mt-4 text-sm text-gray-500 flex items-center justify-center">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">Space</kbd>
                스페이스바로도 분석할 수 있어요
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapturePage; 