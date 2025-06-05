// TouchDesigner 연동을 위한 HTTP 통신 서비스

class TouchDesignerService {
  constructor() {
    // TouchDesigner Web Server 기본 설정
    this.baseUrl = 'http://localhost:8888';
    this.isConnected = false;
  }

  // TouchDesigner 연결 상태 확인
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
        timeout: 2000
      });
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      console.warn('TouchDesigner 연결 실패:', error);
      this.isConnected = false;
      return false;
    }
  }

  // 퍼스널 컬러 데이터를 TouchDesigner로 전송
  async sendPersonalColorData(resultData) {
    try {
      // 연결 상태 확인
      if (!await this.checkConnection()) {
        console.warn('TouchDesigner가 연결되지 않음');
        return { success: false, error: 'TouchDesigner 연결 실패' };
      }

      // 전송할 데이터 구성
      const payload = {
        colorType: resultData.colorType,
        confidence: resultData.confidence || 0,
        recommendedColors: resultData.recommendedColors || [],
        characteristics: resultData.characteristics || [],
        timestamp: new Date().toISOString(),
        // 추가 데이터
        analysis: {
          skinTone: resultData.skinTone,
          season: resultData.season,
          warmCool: resultData.warmCool
        }
      };

      console.log('TouchDesigner로 전송하는 데이터:', payload);

      const response = await fetch(`${this.baseUrl}/personal-color`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.text();
        console.log('TouchDesigner 응답:', result);
        return { success: true, data: result };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error('TouchDesigner 전송 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 실시간 컬러 업데이트 (프리뷰용)
  async sendColorUpdate(colors) {
    try {
      if (!this.isConnected) return;

      const payload = {
        type: 'color_update',
        colors: colors,
        timestamp: new Date().toISOString()
      };

      await fetch(`${this.baseUrl}/color-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

    } catch (error) {
      console.error('실시간 컬러 업데이트 오류:', error);
    }
  }

  // TouchDesigner 트리거 신호 전송
  async sendTrigger(triggerName) {
    try {
      if (!this.isConnected) return;

      const payload = {
        trigger: triggerName,
        timestamp: new Date().toISOString()
      };

      await fetch(`${this.baseUrl}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

    } catch (error) {
      console.error('트리거 전송 오류:', error);
    }
  }

  // TouchDesigner 설정 변경
  setBaseUrl(url) {
    this.baseUrl = url;
    this.isConnected = false;
  }
}

// 싱글톤 인스턴스 생성
const touchDesignerService = new TouchDesignerService();

export default touchDesignerService; 