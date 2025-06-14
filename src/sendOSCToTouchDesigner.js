// sendOSCToTouchDesigner.js
// 브라우저 환경에서 TouchDesigner로 OSC 메시지를 전송하는 함수

export function sendOSCToTouchDesigner(result, selectedColorIndex = null) {
  const seasonToNumber = {
    '봄': 1,
    '봄 웜톤': 1,
    '여름': 2,
    '여름 쿨톤': 2,
    '가을': 3,
    '가을 웜톤': 3,
    '겨울': 4,
    '겨울 쿨톤': 4
  };

  const season = result.season || result.apiResponse?.season || '봄';
  const feature = result.feature || result.apiResponse?.feature || [];
  const recommend = result.recommend || result.apiResponse?.recommend || [];

  const numericValue = seasonToNumber[season] || seasonToNumber[season.split(' ')[0]] || 1;

  console.log(`📡 Preparing OSC message for TouchDesigner`);
  console.log(`Season: ${season} → Numeric: ${numericValue}`);
  console.log(`Selected Color Index: ${selectedColorIndex}`);
  console.log(`Features:`, feature);
  console.log(`Recommended Colors:`, recommend);

  // TouchDesigner로 HTTP POST 요청을 통해 OSC 데이터 전송
  const oscData = {
    address: '/personalColor',
    season: numericValue,
    seasonName: season,
    selectedColorIndex: selectedColorIndex,
    features: feature,
    recommendedColors: recommend.map(color => ({
      name: color.name,
      rgb: color.rgb,
      hex: color.hex || color.rgb
    }))
  };

  return sendOSCViaHTTP(oscData);
}

// HTTP를 통해 TouchDesigner로 OSC 데이터 전송
async function sendOSCViaHTTP(oscData) {
  try {
    // TouchDesigner의 HTTP 서버 엔드포인트 (일반적으로 9980 포트 사용)
    const touchDesignerURL = 'http://localhost:9980/osc';

    console.log(oscData);
    console.log(JSON.stringify(oscData));
    const response = await fetch(touchDesignerURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(oscData)
    });

    if (response.ok) {
      console.log('✅ OSC data sent to TouchDesigner successfully');
      return { success: true, message: 'OSC 데이터가 TouchDesigner로 성공적으로 전송되었습니다.' };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Failed to send OSC data to TouchDesigner:', error);
    
    // 대안: WebSocket을 통한 전송 시도
    return sendOSCViaWebSocket(oscData);
  }
}

// WebSocket을 통해 TouchDesigner로 OSC 데이터 전송 (대안)
async function sendOSCViaWebSocket(oscData) {
  return new Promise((resolve) => {
    try {
      // TouchDesigner WebSocket 서버 (일반적으로 9001 포트 사용)
      const ws = new WebSocket('ws://localhost:9001');
      
      ws.onopen = () => {
        console.log('🔌 WebSocket connected to TouchDesigner');
        ws.send(JSON.stringify(oscData));
      };
      
      ws.onmessage = (event) => {
        console.log('📨 Response from TouchDesigner:', event.data);
        ws.close();
        resolve({ success: true, message: 'OSC 데이터가 TouchDesigner로 성공적으로 전송되었습니다.' });
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        ws.close();
        resolve({ success: false, error: 'TouchDesigner WebSocket 연결에 실패했습니다.' });
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket connection closed');
      };
      
      // 5초 후 타임아웃
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
          ws.close();
          resolve({ success: false, error: 'TouchDesigner 연결 시간이 초과되었습니다.' });
        }
      }, 5000);
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      resolve({ success: false, error: 'TouchDesigner 연결에 실패했습니다.' });
    }
  });
}

// 단순한 OSC 메시지 전송 (기존 방식과 호환)
export function sendSimpleOSC(season, selectedColorIndex) {
  const seasonToNumber = {
    '봄': 1,
    '봄 웜톤': 1,
    '여름': 2,
    '여름 쿨톤': 2,
    '가을': 3,
    '가을 웜톤': 3,
    '겨울': 4,
    '겨울 쿨톤': 4
  };

  const numericValue = seasonToNumber[season] || seasonToNumber[season.split(' ')[0]] || 1;
  
  const oscData = {
    address: '/personalColor',
    args: [numericValue, selectedColorIndex || 0]
  };

  return sendOSCViaHTTP(oscData);
}