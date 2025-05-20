/**
 * 로깅 유틸리티 모듈
 * 애플리케이션에서 일관된 로깅을 제공합니다.
 */

// 로그 레벨 정의
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// 현재 환경에 따른 로그 레벨 설정
const ENV = import.meta.env.MODE || 'development';
const DEFAULT_LOG_LEVEL = ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

// 로깅 구성
const config = {
  level: DEFAULT_LOG_LEVEL,
  enableConsole: true,
  enableRemote: ENV === 'production', // 프로덕션 환경에서만 원격 로깅 활성화
  remoteLogEndpoint: import.meta.env.VITE_REMOTE_LOG_ENDPOINT || '/api/logs',
};

/**
 * 로그를 콘솔에 출력합니다.
 * @param {string} level - 로그 레벨 ('debug', 'info', 'warn', 'error')
 * @param {string} message - 로그 메시지
 * @param {Object} [data] - 추가 데이터
 */
const logToConsole = (level, message, data) => {
  if (!config.enableConsole) return;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]:`;
  
  switch (level) {
    case 'debug':
      console.debug(prefix, message, data || '');
      break;
    case 'info':
      console.info(prefix, message, data || '');
      break;
    case 'warn':
      console.warn(prefix, message, data || '');
      break;
    case 'error':
      console.error(prefix, message, data || '');
      break;
    default:
      console.log(prefix, message, data || '');
  }
};

/**
 * 원격 서버에 로그를 전송합니다. (프로덕션 환경)
 * @param {string} level - 로그 레벨
 * @param {string} message - 로그 메시지
 * @param {Object} [data] - 추가 데이터
 */
const logToRemote = async (level, message, data) => {
  if (!config.enableRemote) return;
  
  try {
    // 실제 구현에서는 fetch나 axios를 사용하여 로그 전송
    const logData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data: data || null,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // 비동기 로깅 - 앱 성능에 영향을 최소화
    setTimeout(() => {
      fetch(config.remoteLogEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
        // 로깅 실패가 앱에 영향을 주지 않도록 무시
        keepalive: true
      }).catch(() => {
        // 원격 로깅 실패는 무시
      });
    }, 0);
  } catch (e) {
    // 원격 로깅 도중 오류가 발생해도 앱 실행에 영향을 주지 않음
  }
};

/**
 * 로그 레벨 설정
 * @param {string} level - 로그 레벨 ('debug', 'info', 'warn', 'error', 'none')
 */
const setLogLevel = (level) => {
  const levelUpper = level.toUpperCase();
  if (LOG_LEVELS[levelUpper] !== undefined) {
    config.level = LOG_LEVELS[levelUpper];
  }
};

/**
 * 로그 출력 여부 확인
 * @param {string} level - 로그 레벨
 * @returns {boolean} 출력 여부
 */
const shouldLog = (level) => {
  const levelValue = LOG_LEVELS[level.toUpperCase()] || 0;
  return levelValue >= config.level;
};

/**
 * 로그 기록
 * @param {string} level - 로그 레벨 ('debug', 'info', 'warn', 'error')
 * @param {string} message - 로그 메시지
 * @param {Object} [data] - 추가 데이터
 */
const log = (level, message, data) => {
  if (!shouldLog(level)) return;
  
  logToConsole(level, message, data);
  
  // 경고 및 오류는 원격 로깅도 수행
  if (level === 'warn' || level === 'error') {
    logToRemote(level, message, data);
  }
};

// 로거 인터페이스
const logger = {
  debug: (message, data) => log('debug', message, data),
  info: (message, data) => log('info', message, data),
  warn: (message, data) => log('warn', message, data),
  error: (message, data) => log('error', message, data),
  setLevel: setLogLevel
};

export default logger; 