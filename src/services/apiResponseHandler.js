import logger from '../utils/logger';

/**
 * API 응답 처리 유틸리티
 */
const apiResponseHandler = {
  /**
   * API 응답을 처리합니다.
   * @param {Object} response - API 응답 객체
   * @param {Object} options - 옵션 객체
   * @param {string} options.endpoint - API 엔드포인트 이름 (로깅용)
   * @param {Function} options.transformer - 응답을 변환하는 함수
   * @returns {Promise<any>} 처리된 데이터
   */
  handleResponse: async (response, options = {}) => {
    const { endpoint = 'unknown', transformer } = options;
    
    try {
      // 응답이 없는 경우
      if (!response || !response.data) {
        throw new Error('응답 데이터가 없습니다.');
      }
      
      // 응답 상태가 2xx가 아닌 경우
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`API 응답 오류: ${response.status} ${response.statusText}`);
      }
      
      // 성공 응답이지만 서비스 오류 처리 (일부 API는 HTTP 200을 반환하면서 오류를 나타냄)
      if (response.data.error || (response.data.success === false)) {
        const errorMessage = response.data.message || response.data.error || '알 수 없는 오류';
        throw new Error(`서비스 오류: ${errorMessage}`);
      }
      
      // 데이터 변환이 필요한 경우
      if (transformer && typeof transformer === 'function') {
        return await transformer(response.data);
      }
      
      return response.data;
    } catch (error) {
      logger.error(`API 응답 처리 오류 (${endpoint}):`, error);
      throw error;
    }
  },
  
  /**
   * API 오류를 표준화하여 처리합니다.
   * @param {Error} error - 발생한 오류
   * @param {Object} options - 옵션 객체
   * @param {string} options.endpoint - API 엔드포인트 이름 (로깅용)
   * @param {Object} options.customMessages - 오류 유형별 사용자 정의 메시지
   * @returns {Object} 표준화된 오류 응답 객체
   */
  handleError: (error, options = {}) => {
    const { 
      endpoint = 'unknown', 
      customMessages = {} 
    } = options;
    
    // 기본 오류 응답
    const errorResponse = {
      success: false,
      status: 500,
      message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.',
      error: error
    };
    
    // axios 오류인 경우
    if (error.response) {
      // 서버가 응답했지만 2xx 범위가 아닌 상태 코드
      const status = error.response.status;
      errorResponse.status = status;
      
      // 상태 코드별 기본 메시지
      if (status === 400) {
        errorResponse.message = '잘못된 요청입니다. 요청 데이터를 확인해주세요.';
      } else if (status === 401) {
        errorResponse.message = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (status === 403) {
        errorResponse.message = '접근 권한이 없습니다.';
      } else if (status === 404) {
        errorResponse.message = '요청한 리소스를 찾을 수 없습니다.';
      } else if (status === 429) {
        errorResponse.message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      } else if (status >= 500) {
        errorResponse.message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      // 서버에서 응답한 메시지가 있으면 사용
      if (error.response.data && error.response.data.message) {
        errorResponse.message = error.response.data.message;
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      errorResponse.status = 0;
      errorResponse.message = '서버 응답이 없습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.';
    }
    
    // 사용자 정의 메시지 적용
    if (customMessages[errorResponse.status]) {
      errorResponse.message = customMessages[errorResponse.status];
    } else if (customMessages.default) {
      errorResponse.message = customMessages.default;
    }
    
    logger.error(`API 오류 (${endpoint}): ${errorResponse.message}`, {
      status: errorResponse.status,
      originalError: error.message
    });
    
    return errorResponse;
  },
  
  /**
   * API 요청 성공 시 일관된 응답 객체를 생성합니다.
   * @param {any} data - 응답 데이터
   * @param {Object} options - 옵션 객체
   * @param {string} options.message - 성공 메시지
   * @returns {Object} 표준화된 성공 응답 객체
   */
  createSuccessResponse: (data, options = {}) => {
    const { message = '요청이 성공적으로 처리되었습니다.' } = options;
    
    return {
      success: true,
      message,
      data
    };
  }
};

export default apiResponseHandler; 