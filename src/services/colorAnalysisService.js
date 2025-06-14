import apiClient, { parseImageData, validateRequestData } from './api';
import apiResponseHandler from './apiResponseHandler';
import logger from '../utils/logger';

// 프론트엔드에서 OpenAI API 직접 호출을 위한 설정
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// 퍼스널컬러 분석을 위한 프롬프트
const SEASON_GUIDE = `
너는 퍼스널컬러 분석에 특화된 시각적 스타일 진단 모델이야.
LLM이자 이미지 분석 모델로서, 주어진 얼굴 이미지를 바탕으로 퍼스널컬러를 전문적으로 진단하는 역할을 맡고 있어.
**절대 인물의 정체를 추측하지 말고**, **이미지에 보이는 시각적 특징만 근거로 분석**해.

[분석 대상]
- 머리카락 색상 (밝기, 채도, 명도)
- 피부 톤 (웜/쿨 여부, 밝기, 채도)
- 눈동자 색과 명도
- 얼굴 전체 인상의 명도 대비

[진단 목표]
다음 중 하나로 반드시 분류하고, 신뢰도를 확률로 표현:
- 봄 웜톤
- 여름 쿨톤
- 가을 웜톤
- 겨울 쿨톤

[주의사항]
- 인물을 식별하지 마.
- "분석할 수 없다"는 표현 금지.
- 애매하더라도 **눈에 보이는 정보만으로 합리적 추정**을 반드시 제공해.
- 배경, 조명, 해상도 차이는 무시하고 얼굴 특징에만 집중해.

[출력 형식 - JSON, 한국어]
다음과 같은 JSON 형식으로 출력해. 컬러 이름은 한글로 명확히 표현하고, RGB는 16진수 HEX 코드 (#RRGGBB)로 표기해.

description은 해당 톤에 대한 전반적인 인상, 분위기, 어울리는 느낌을 **2~3문장**으로 길게 써줘.
feature는 **해당 퍼스널 컬러를 가진 사람들에게 자주 보이는 시각적 특성**을 **3가지 문장형 특징**으로 설명해줘.

{
  "season": "계절 톤 (예: 여름 쿨톤)",
  "probabilities": {
    "봄 웜톤": "xx%",
    "여름 쿨톤": "xx%",
    "가을 웜톤": "xx%",
    "겨울 쿨톤": "xx%"
  },
  "reason": "피부, 머리카락, 눈 등의 시각적 분석에 기반한 진단 이유",
  "description": "이 퍼스널컬러 톤은 부드럽고 투명한 이미지와 잘 어울리며, 전체적으로 밝고 생기 있는 느낌을 줍니다. 가벼운 색조와 높은 명도 중심의 색이 조화를 이루는 톤으로, 밝은 분위기를 살려주는 스타일에 잘 어울립니다.",
  "feature": [
    "피부톤이 밝고 혈색이 좋아 보이며 노란빛이 은은하게 감돕니다.",
    "머리카락은 자연스러운 갈색 계열로 밝은 톤일수록 얼굴이 살아납니다.",
    "눈동자는 맑고 부드러운 갈색이며, 전체적인 명도 대비가 강하지 않습니다."
  ],
  "recommend": [
    {"name": "밝은 살구색", "rgb": "#FFD1B2"},
    {"name": "연한 코랄", "rgb": "#FFAD9E"},
    {"name": "라이트 옐로우", "rgb": "#FFF4B2"}
  ],
  "avoid": [
    {"name": "어두운 네이비", "rgb": "#001F4E"},
    {"name": "딥 퍼플", "rgb": "#4B0082"}
  ]
}
`;

const COORDI_PROMPT = `
너는 퍼스널컬러에 맞춘 스타일링을 추천해주는 패션 스타일리스트야.
사용자의 [현재 착장]과 [퍼스널 컬러]를 고려해서 스타일 키워드 출력 형식에 맞춰 설명.
설명할 때 말투는 친절하게.

!!주의사항!! 블랙이나 화이트 무채색 아이템은 추천 금지

[출력 형식 - JSON, 한국어]
RGB는 16진수 HEX 코드 (#RRGGBB)로 표기.

{
  "style_keywords": ["#청량한", "#내추럴", "#미니멀"],
  "recommend_items": [
    {"item": "연청 데님 자켓", "description": "맑은 피부톤을 살려주는 밝은 데님은 봄 웜톤에게 잘 어울려요.", "rgb": "#ADD8E6"},
    {"item": "라이트 옐로우 린넨 셔츠", "description": "가볍고 밝은 컬러감으로 생기 있는 인상을 더할 수 있어요.", "rgb": "#FFFFE0"}
  ],
}
`;

/**
 * 이미지를 Base64 문자열로 변환하는 함수
 * @param {File} file - 변환할 이미지 파일
 * @returns {Promise<string>} Base64 인코딩된 이미지 데이터
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * OpenAI API를 직접 호출하여 퍼스널컬러 분석을 수행하는 함수
 * @param {string} imageData - Base64 인코딩된 이미지 데이터 (data URL 형식)
 * @returns {Promise<Object>} 분석 결과 객체
 */
async function analyzeImageWithOpenAI(imageData) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. VITE_OPENAI_API_KEY 환경 변수를 확인해주세요.');
  }

  try {
    logger.debug('OpenAI API를 통한 이미지 분석 시작');

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          { role: "system", content: SEASON_GUIDE },
          {
            role: "user",
            content: [
              { type: "text", text: "전문가 기준으로 진단하고, 반드시 순서대로 논리적으로 생각한 뒤 결과를 판단해줘." },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('OpenAI API 요청 실패', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API 오류: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.choices || !result.choices.length || !result.choices[0].message?.content) {
      throw new Error('OpenAI API 응답 형식이 올바르지 않습니다.');
    }

    const analysisResult = JSON.parse(result.choices[0].message.content);
    logger.info('OpenAI API 분석 완료', analysisResult);

    const responseStyle = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          { role: "system", content: COORDI_PROMPT },
          {
            role: "user",
            content: `[퍼스널컬러] :  ${personalColorResult.season}, [사용자의 복장 정보]  /${styleTxt}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    return {
      colorResult:analysisResult,
      styleResult:responseStyle
    };
  } catch (error) {
    logger.error('OpenAI API 호출 중 오류:', error);
    throw error;
  }
}

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
      
      logger.debug('외부 API를 통한 이미지 분석 시작');
      
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
        formData.append('file', blob, 'image.jpg');
        
        // 외부 API URL 설정 (환경 변수에서 가져오거나 기본값 사용)
        const apiUrl = import.meta.env.VITE_EXTERNAL_API_URL || 'http://localhost:8000/analyze-image/';
        
        // API 요청 시작
        logger.info('외부 API 요청 시작', { url: apiUrl });
        
        // fetch API를 사용한 요청
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });
        
        // 응답 상태 확인
        if (!response.ok) {
          logger.error('API 응답 오류', { 
            status: response.status, 
            statusText: response.statusText 
          });
          throw new Error(`API 오류: ${response.status} ${response.statusText}`);
        }
        
        // JSON 응답 파싱
        const result = await response.json();
        logger.info('외부 API 응답 원본', result);
        const {season, probabilities, reason, description, feature, recommend, avoid} = result;
        logger.info('외부 API 요청 성공', { season, probabilities, reason, description, feature, recommend, avoid });
        
        // 결과 포맷팅 및 반환
        return {
          success: true,
          data: {
            // 외부 API 응답을 내부 형식에 맞게 변환
            colorType: season || 'unknown',
            confidence: probabilities[season?.charAt(0).toUpperCase() + season?.slice(1).toLowerCase()] || 0,
            imageUrl: imageData,
            description,
            feature,
            recommend,
            avoid,
            // 원본 응답 데이터도 포함
            apiResponse: {season, probabilities, reason, description, feature, recommend, avoid}
          }
        };
        
      } catch (apiError) {
        logger.error('외부 API 요청 실패', { error: apiError.message });
        
        // API 오류 시 대체 로직 (랜덤 결과 반환)
        logger.warn('API 오류로 인한 목업 데이터 사용');
        
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
        
        logger.info('API 오류 대체 결과 생성', { 
          colorType: resultType, 
          confidence,
          error: apiError.message
        });
        
        return {
          success: true,
          data: {
            colorType: resultType,
            confidence,
            imageUrl: imageData,
            // 오류 정보도 포함
            error: apiError.message,
            fallbackMode: true
          }
        };
      }
    } catch (error) {
      logger.error('이미지 분석 처리 중 오류:', error);
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
                '봄 웜톤': {
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
                '여름 쿨톤': {
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
                '가을 웜톤': {
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
                '겨울 쿨톤': {
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
   * OpenAI API를 직접 호출하여 이미지를 분석합니다.
   * @param {string|File} imageData - Base64 인코딩된 이미지 데이터 또는 File 객체
   * @param {Object} options - 옵션 객체
   * @param {number} options.maxRetries - 최대 재시도 횟수 (기본값: 2)
   * @returns {Promise<Object>} 분석 결과 객체
   */
  analyzeImageDirect: async (imageData, options = { maxRetries: 2 }) => {
    try {
      // 로딩 상태 설정
      colorAnalysisService.setLoading('analyzeImage', true);
      
      // 이미지 데이터 유효성 검사
      if (!imageData) {
        throw new Error('이미지 데이터가 없습니다.');
      }
      
      logger.debug('OpenAI 직접 호출을 통한 이미지 분석 시작');
      
      // File 객체인 경우 Base64로 변환
      let base64ImageData = imageData;
      if (imageData instanceof File) {
        base64ImageData = await fileToBase64(imageData);
        logger.debug('파일을 Base64로 변환 완료');
      }
      
      // Data URL 형식인지 확인하고 맞지 않으면 변환
      if (typeof base64ImageData === 'string' && !base64ImageData.startsWith('data:')) {
        base64ImageData = `data:image/jpeg;base64,${base64ImageData}`;
      }
      
      // OpenAI API 호출
      const apiResult = await analyzeImageWithOpenAI(base64ImageData);
      
      // 결과를 내부 형식으로 변환
      const {colorResult : {season, probabilities, reason}, styleResult : {style_keywords, recommend_items, }} = apiResult;
      
      // 계절을 영어로 매핑
      const seasonMapping = {
        '봄 웜톤': 'spring-warm',
        '여름 쿨톤': 'summer-cool',
        '가을 웜톤': 'autumn-warm',
        '겨울 쿨톤': 'winter-cool',
        'Spring Warm': 'spring-warm',
        'Summer Cool': 'summer-cool',
        'Autumn Warm': 'autumn-warm',
        'Winter Cool': 'winter-cool'
      };
      
      const colorType = seasonMapping[season] || season;
      
      // 신뢰도 계산 (해당 계절의 확률 추출)
      let confidence = 0;
      if (probabilities && season) {
        const seasonKey = Object.keys(probabilities).find(key => 
          key.toLowerCase().includes(season.toLowerCase().split(' ')[0]) ||
          season.toLowerCase().includes(key.toLowerCase().split(' ')[0])
        );
        if (seasonKey && probabilities[seasonKey]) {
          confidence = parseInt(probabilities[seasonKey].replace('%', ''));
        }
      }
      
      logger.info('OpenAI 직접 호출 분석 완료', { 
        originalSeason: season,
        mappedColorType: colorType,
        confidence 
      });
      
      return {
        success: true,
        data: {
          colorType,
          confidence,
          imageUrl: base64ImageData,
          description: reason,
          apiResponse: apiResult
        }
      };
      
    } catch (error) {
      logger.error('OpenAI 직접 호출 중 오류:', error);
      
      // 오류 메시지 개선
      let userMessage = '이미지 분석 중 오류가 발생했습니다.';
      if (error.message.includes('API 키')) {
        userMessage = 'OpenAI API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.';
      } else if (error.message.includes('401')) {
        userMessage = 'API 키가 유효하지 않습니다. 올바른 OpenAI API 키를 확인해주세요.';
      } else if (error.message.includes('429')) {
        userMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('413')) {
        userMessage = '이미지 크기가 너무 큽니다. 더 작은 이미지를 사용해주세요.';
      }
      
      return {
        success: false,
        error: error.message,
        message: userMessage
      };
    } finally {
      // 로딩 상태 해제
      colorAnalysisService.setLoading('analyzeImage', false);
    }
  },
  
  /**
   * OpenAI API 키 설정 상태를 확인합니다.
   * @returns {Object} API 키 설정 상태 정보
   */
  checkApiKeyStatus: () => {
    const hasApiKey = !!OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here';
    
    return {
      configured: hasApiKey,
      message: hasApiKey 
        ? 'OpenAI API 키가 설정되었습니다.' 
        : 'OpenAI API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 설정해주세요.',
      apiKey: hasApiKey ? `${OPENAI_API_KEY.slice(0, 7)}...` : null
    };
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