import apiClient, { parseImageData, validateRequestData } from './api';
import apiResponseHandler from './apiResponseHandler';
import logger from '../utils/logger';

/**
 * 퍼스널 컬러 분석 서비스
 */
const colorAnalysisService = {
  // 로딩 상태를 추적하기 위한 상태 객체
  loadingState: {
    analyzeImage: false,
    getColorTypes: false
  },

  // 응답 캐싱을 위한 캐시 객체
  cache: {
    colorTypes: null,
    colorTypesTimestamp: null
  },

  /**
   * 로딩 상태를 가져옵니다.
   * @param {string} operation - 확인할 작업 이름 (예: 'analyzeImage')
   * @returns {boolean} 로딩 중인지 여부
   */
  isLoading: (operation) => {
    return colorAnalysisService.loadingState[operation] || false;
  },

  /**
   * 내부 로딩 상태를 설정합니다.
   * @param {string} operation - 설정할 작업 이름
   * @param {boolean} state - 설정할 상태
   */
  setLoading: (operation, state) => {
    colorAnalysisService.loadingState[operation] = state;
    logger.debug(`로딩 상태 변경: ${operation} = ${state}`);
  },

  /**
   * API 요청을 재시도 로직과 함께 실행합니다.
   * @param {Function} apiCall - 실행할 API 함수
   * @param {number} maxRetries - 최대 재시도 횟수
   * @param {number} delayMs - 재시도 간 지연 시간(ms)
   * @returns {Promise<any>} API 응답
   */
  async retryRequest(apiCall, maxRetries = 3, delayMs = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`API 요청 시도 ${attempt + 1}/${maxRetries + 1}`);
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        // 재시도가 가능한 오류인지 확인
        const isRetryable = 
          !error.response || // 서버 응답 없음
          error.code === 'ECONNABORTED' || // 타임아웃
          (error.response && (error.response.status >= 500 || error.response.status === 429)); // 서버 오류 또는 요청 제한
        
        // 마지막 시도이거나 재시도 불가능한 오류인 경우
        if (attempt === maxRetries || !isRetryable) {
          logger.warn(`API 요청 실패 (최종): ${error.message}`, {
            isRetryable,
            attempt: attempt + 1,
            maxRetries,
            status: error.response?.status
          });
          break;
        }
        
        // 재시도 전 지연 (백오프 전략 적용)
        const delay = delayMs * Math.pow(2, attempt);
        logger.info(`API 요청 실패, ${delay}ms 후 재시도 (${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  },

  /**
   * 이미지를 분석하여 퍼스널 컬러 결과를 가져옵니다.
   * @param {string} imageData - Base64 인코딩된 이미지 데이터
   * @param {Object} options - 옵션 객체
   * @param {number} options.maxRetries - 최대 재시도 횟수 (기본값: 2)
   * @returns {Promise<Object>} 분석 결과 객체
   */
  analyzeImage: async (imageData, options = { maxRetries: 2 }) => {
    try {
      // 로딩 상태 설정
      colorAnalysisService.setLoading('analyzeImage', true);
      
      // 이미지 데이터 유효성 검사
      if (!imageData) {
        throw new Error('이미지 데이터가 없습니다.');
      }
      
      // 이미지 데이터 파싱
      logger.debug('이미지 분석 시작');
      const { formData } = await parseImageData(imageData);
      
      // API 요청 실행
      return await colorAnalysisService.retryRequest(async () => {
        // API 요청 전송
        const response = await apiClient.post('/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // formData를 위한 Content-Type 변경
          },
        });
        
        // API 응답 처리
        return await apiResponseHandler.handleResponse(response, {
          endpoint: 'analyze',
          transformer: (data) => {
            // 응답 데이터 유효성 검사
            const resultSchema = {
              required: ['success', 'data'],
              types: {
                success: 'boolean',
                data: 'object',
                message: 'string'
              }
            };
            
            const validation = validateRequestData(data, resultSchema);
            if (!validation.valid) {
              logger.error('API 응답 데이터 유효성 검사 실패', validation);
              throw new Error('서버 응답 형식이 올바르지 않습니다.');
            }
            
            return data;
          }
        });
      }, options.maxRetries);
    } catch (error) {
      // API 오류 처리
      const errorResult = apiResponseHandler.handleError(error, {
        endpoint: 'analyze',
        customMessages: {
          400: '이미지 분석에 실패했습니다. 다른 이미지로 다시 시도해주세요.',
          413: '이미지 크기가 너무 큽니다. 더 작은 이미지를 사용해주세요.',
          default: '이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.'
        }
      });
      
      return errorResult;
    } finally {
      // 로딩 상태 해제
      colorAnalysisService.setLoading('analyzeImage', false);
    }
  },
  
  /**
   * 임시 분석 기능 - 실제 백엔드 없이 테스트용
   * @param {string} imageData - Base64 인코딩된 이미지 데이터
   * @returns {Promise<Object>} 더미 분석 결과 객체
   */
  analyzeImageMock: async (imageData) => {
    try {
      // 로딩 상태 설정
      colorAnalysisService.setLoading('analyzeImage', true);
      
      // 이미지 데이터 유효성 검사
      if (!imageData) {
        throw new Error('이미지 데이터가 없습니다.');
      }
      
      logger.debug('목업 이미지 분석 시작');
      
      // 백엔드 API가 준비되지 않은 경우 사용할 임시 구현
      return await new Promise((resolve, reject) => {
        // 2초 지연 후 결과 반환 (API 호출 시뮬레이션)
        setTimeout(() => {
          // 5%의 확률로 오류 발생 시뮬레이션
          if (Math.random() < 0.05) {
            logger.warn('목업 분석 의도적 실패 (시뮬레이션)');
            reject(new Error('목업 분석 실패 (시뮬레이션)'));
            return;
          }
          
          // 가능한 결과 타입들
          const resultTypes = [
            'spring-warm',
            'summer-cool',
            'fall-warm',
            'winter-cool'
          ];
          
          // 랜덤 결과 선택
          const resultType = resultTypes[Math.floor(Math.random() * resultTypes.length)];
          const confidence = Math.floor(Math.random() * 20 + 80); // 80~99% 신뢰도
          
          logger.info('목업 이미지 분석 완료', { colorType: resultType, confidence });
          
          resolve({
            success: true,
            data: {
              colorType: resultType,
              confidence,
              imageUrl: imageData // 원본 이미지 그대로 반환
            }
          });
        }, 2000);
      });
    } catch (error) {
      logger.error('목업 이미지 분석 중 오류:', error);
      throw error;
    } finally {
      // 로딩 상태 해제
      colorAnalysisService.setLoading('analyzeImage', false);
    }
  },
  
  /**
   * 모든 퍼스널 컬러 타입 정보를 가져옵니다.
   * @param {Object} options - 옵션 객체
   * @param {boolean} options.useCache - 캐싱된 결과 사용 여부 (기본값: true)
   * @param {number} options.cacheDuration - 캐시 유효 기간(ms) (기본값: 1시간)
   * @param {number} options.maxRetries - 최대 재시도 횟수 (기본값: 2)
   * @returns {Promise<Object>} 컬러 타입 정보 객체
   */
  getColorTypes: async (options = { useCache: true, cacheDuration: 3600000, maxRetries: 2 }) => {
    try {
      // 로딩 상태 설정
      colorAnalysisService.setLoading('getColorTypes', true);
      
      // 캐시 사용이 활성화되고 캐시가 유효한 경우 캐시된 결과 반환
      if (options.useCache && 
          colorAnalysisService.cache.colorTypes && 
          colorAnalysisService.cache.colorTypesTimestamp && 
          Date.now() - colorAnalysisService.cache.colorTypesTimestamp < options.cacheDuration) {
        logger.debug('캐시된 컬러 타입 정보 사용');
        return colorAnalysisService.cache.colorTypes;
      }
      
      logger.debug('컬러 타입 정보 가져오기 요청');
      
      // 캐시가 없거나 만료된 경우 새 요청 수행
      const data = await colorAnalysisService.retryRequest(async () => {
        const response = await apiClient.get('/colorTypes');
        
        // API 응답 처리
        return await apiResponseHandler.handleResponse(response, {
          endpoint: 'colorTypes',
          transformer: (data) => {
            // 응답 데이터 유효성 검사
            const resultSchema = {
              required: ['success', 'data'],
              types: {
                success: 'boolean',
                data: 'object'
              }
            };
            
            const validation = validateRequestData(data, resultSchema);
            if (!validation.valid) {
              logger.error('API 응답 데이터 유효성 검사 실패', validation);
              throw new Error('서버 응답 형식이 올바르지 않습니다.');
            }
            
            return data;
          }
        });
      }, options.maxRetries);
      
      logger.info('컬러 타입 정보 로드 완료');
      
      // 결과 캐싱
      colorAnalysisService.cache.colorTypes = data;
      colorAnalysisService.cache.colorTypesTimestamp = Date.now();
      
      return data;
    } catch (error) {
      // API 오류 처리
      const errorResult = apiResponseHandler.handleError(error, {
        endpoint: 'colorTypes',
        customMessages: {
          default: '컬러 타입 정보를 가져오는데 실패했습니다. 나중에 다시 시도해주세요.'
        }
      });
      
      return errorResult;
    } finally {
      // 로딩 상태 해제
      colorAnalysisService.setLoading('getColorTypes', false);
    }
  },
  
  /**
   * 임시 컬러 타입 정보 - 실제 백엔드 없이 테스트용
   * @param {Object} options - 옵션 객체
   * @param {boolean} options.useCache - 캐싱된 결과 사용 여부 (기본값: true) 
   * @param {number} options.cacheDuration - 캐시 유효 기간(ms) (기본값: 1시간)
   * @returns {Promise<Object>} 더미 컬러 타입 정보 객체
   */
  getColorTypesMock: async (options = { useCache: true, cacheDuration: 3600000 }) => {
    try {
      // 로딩 상태 설정
      colorAnalysisService.setLoading('getColorTypes', true);
      
      // 캐시 사용이 활성화되고 캐시가 유효한 경우 캐시된 결과 반환
      if (options.useCache && 
          colorAnalysisService.cache.colorTypes && 
          colorAnalysisService.cache.colorTypesTimestamp && 
          Date.now() - colorAnalysisService.cache.colorTypesTimestamp < options.cacheDuration) {
        logger.debug('캐시된 목업 컬러 타입 정보 사용');
        return colorAnalysisService.cache.colorTypes;
      }
      
      logger.debug('목업 컬러 타입 정보 가져오기');
      
      // 백엔드 API가 준비되지 않은 경우 사용할 임시 구현
      const data = await new Promise((resolve) => {
        // 0.5초 지연 후 결과 반환 (API 호출 시뮬레이션)
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              types: {
                'spring-warm': {
                  title: '봄 웜톤',
                  description: '밝고 선명한 컬러가 어울리는 봄 웜톤입니다. 노란빛이 도는 따뜻한 색조가 잘 어울립니다.',
                  characteristics: [
                    '피부톤이 밝고 투명한 아이보리 또는 복숭아빛',
                    '눈동자 색이 선명하고 밝은 갈색이나 다운브라운',
                    '머리카락 색이 밝은 갈색이나 노란기가 도는 갈색'
                  ],
                  recommendedColors: ['#FF9E2C', '#FFE143', '#FF5C00', '#FFA629', '#FFCA3E', '#FF8674'],
                  avoidColors: ['#808080', '#000080', '#4B0082', '#6B8E23', '#708090']
                },
                'summer-cool': {
                  title: '여름 쿨톤',
                  description: '부드럽고 밝은 파스텔 컬러가 어울리는 여름 쿨톤입니다. 파란빛이 도는 차가운 색조가 잘 어울립니다.',
                  characteristics: [
                    '피부톤이 붉은빛 또는 푸른빛이 도는 핑크베이지',
                    '눈동자 색이 부드러운 갈색이나 회갈색',
                    '머리카락 색이 재색 또는 쿨한 느낌의 갈색'
                  ],
                  recommendedColors: ['#7A9CC6', '#E8C6C6', '#D2E8E8', '#C2C2D1', '#AEC9C9', '#BDABBE'],
                  avoidColors: ['#FF7518', '#FFA500', '#A0522D', '#F0E68C', '#CD853F']
                },
                'fall-warm': {
                  title: '가을 웜톤',
                  description: '깊고 중후한 컬러가 어울리는 가을 웜톤입니다. 노란빛이 도는 깊은 색조가 잘 어울립니다.',
                  characteristics: [
                    '피부톤이 황금빛이 도는 따뜻한 베이지색',
                    '눈동자 색이 짙은 갈색이나 검은색',
                    '머리카락 색이 진한 밤색, 적갈색 또는 카키색'
                  ],
                  recommendedColors: ['#825C06', '#987D51', '#814E18', '#6F5946', '#BE8A4A', '#947A45'],
                  avoidColors: ['#FF80AB', '#80DEEA', '#B39DDB', '#E6E6FA', '#000000']
                },
                'winter-cool': {
                  title: '겨울 쿨톤',
                  description: '선명하고 강한 컬러가 어울리는 겨울 쿨톤입니다. 파란빛이 도는 차가운 색조가 잘 어울립니다.',
                  characteristics: [
                    '피부톤이 푸른빛이 도는 차가운 색감',
                    '눈동자 색이 선명한 검은색이나 짙은 갈색',
                    '머리카락 색이 짙은 갈색이나 검은색'
                  ],
                  recommendedColors: ['#E40046', '#1168D9', '#26648E', '#000000', '#FFFFFF', '#0F52BA'],
                  avoidColors: ['#EEE8AA', '#F0E68C', '#BDB76B', '#FFDAB9', '#F5F5DC']
                }
              }
            }
          });
        }, 500);
      });
      
      logger.info('목업 컬러 타입 정보 로드 완료');
      
      // 결과 캐싱
      colorAnalysisService.cache.colorTypes = data;
      colorAnalysisService.cache.colorTypesTimestamp = Date.now();
      
      return data;
    } catch (error) {
      logger.error('목업 컬러 타입 정보 가져오기 실패:', error);
      throw error;
    } finally {
      // 로딩 상태 해제
      colorAnalysisService.setLoading('getColorTypes', false);
    }
  },
  
  /**
   * 캐시를 초기화합니다.
   * @param {string} cacheKey - 초기화할 캐시 키 (없으면 모든 캐시 초기화)
   */
  clearCache: (cacheKey = null) => {
    if (cacheKey && colorAnalysisService.cache[cacheKey] !== undefined) {
      colorAnalysisService.cache[cacheKey] = null;
      colorAnalysisService.cache[`${cacheKey}Timestamp`] = null;
      logger.debug(`캐시 초기화: ${cacheKey}`);
    } else if (!cacheKey) {
      // 모든 캐시 초기화
      Object.keys(colorAnalysisService.cache).forEach(key => {
        colorAnalysisService.cache[key] = null;
      });
      logger.debug('모든 캐시 초기화');
    }
  }
};

export default colorAnalysisService; 