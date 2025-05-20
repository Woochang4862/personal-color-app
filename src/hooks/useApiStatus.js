import { useState, useEffect } from 'react';
import colorAnalysisService from '../services/colorAnalysisService';

/**
 * API 요청 상태를 관리하는 커스텀 훅
 * @param {string} operation - 상태를 확인할 작업 이름 (예: 'analyzeImage', 'getColorTypes')
 * @returns {boolean} 로딩 중인지 여부
 */
const useApiStatus = (operation) => {
  // 내부 상태 관리
  const [isLoading, setIsLoading] = useState(
    () => colorAnalysisService.isLoading(operation)
  );
  
  useEffect(() => {
    // API 서비스의 로딩 상태를 주기적으로 확인
    const checkInterval = setInterval(() => {
      const currentStatus = colorAnalysisService.isLoading(operation);
      if (currentStatus !== isLoading) {
        setIsLoading(currentStatus);
      }
    }, 100);
    
    return () => clearInterval(checkInterval);
  }, [operation, isLoading]);
  
  return isLoading;
};

export default useApiStatus; 