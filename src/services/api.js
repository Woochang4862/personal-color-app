import axios from 'axios';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * 요청 데이터 유효성 검사 함수
 * @param {Object} data - 검사할 데이터
 * @param {Object} schema - 데이터 스키마 (필수 필드 목록)
 * @returns {boolean|Object} 유효성 검사 결과 (true 또는 오류 객체)
 */
const validateRequestData = (data, schema) => {
  if (!data) {
    return { valid: false, error: '데이터가 없습니다.' };
  }

  // 필수 필드 확인
  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (data[field] === undefined || data[field] === null) {
        return { valid: false, error: `필수 필드 '${field}'가 누락되었습니다.` };
      }
    }
  }

  // 타입 확인
  if (schema.types && typeof schema.types === 'object') {
    for (const [field, type] of Object.entries(schema.types)) {
      if (data[field] !== undefined && data[field] !== null) {
        // 타입이 일치하지 않는 경우
        if (
          (type === 'string' && typeof data[field] !== 'string') ||
          (type === 'number' && typeof data[field] !== 'number') ||
          (type === 'boolean' && typeof data[field] !== 'boolean') ||
          (type === 'object' && (typeof data[field] !== 'object' || Array.isArray(data[field]))) ||
          (type === 'array' && !Array.isArray(data[field]))
        ) {
          return { valid: false, error: `필드 '${field}'의 타입이 올바르지 않습니다. 예상: ${type}, 실제: ${typeof data[field]}` };
        }
      }
    }
  }

  return { valid: true };
};

/**
 * 이미지 데이터 유효성 검사 및 파싱
 * @param {string} imageData - 검사할 이미지 데이터 (Base64)
 * @returns {Promise<Object>} 파싱 결과 또는 오류 객체
 */
const parseImageData = async (imageData) => {
  if (!imageData) {
    throw new Error('이미지 데이터가 없습니다.');
  }

  // Base64 형식 확인
  if (typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
    throw new Error('유효하지 않은 이미지 형식입니다. Base64 인코딩된 이미지가 필요합니다.');
  }

  try {
    // Base64 이미지 데이터를 Blob으로 변환
    const blob = await fetch(imageData).then(r => r.blob());
    
    // 유효한 이미지 형식 확인
    if (!blob.type.startsWith('image/')) {
      throw new Error('유효하지 않은 이미지 형식입니다.');
    }
    
    // 이미지 크기 확인 (10MB 제한)
    if (blob.size > 10 * 1024 * 1024) {
      throw new Error('이미지 크기가 너무 큽니다. 10MB 이하의 이미지를 사용해주세요.');
    }
    
    // FormData 객체 생성 및 파일 추가
    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');
    
    return { formData, blob };
  } catch (error) {
    if (error.message.includes('유효하지 않은 이미지') || error.message.includes('이미지 크기')) {
      throw error;
    }
    throw new Error('이미지 데이터 처리 중 오류가 발생했습니다.');
  }
};

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15초 타임아웃
});

// 요청 인터셉터 (필요시 확장)
apiClient.interceptors.request.use(
  (config) => {
    // 요청 전에 수행할 작업
    // 예: 인증 토큰 추가 등
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (필요시 확장)
apiClient.interceptors.response.use(
  (response) => {
    // 응답 데이터 가공 등
    return response;
  },
  (error) => {
    // 오류 응답 처리
    return Promise.reject(error);
  }
);

export { validateRequestData, parseImageData };
export default apiClient; 