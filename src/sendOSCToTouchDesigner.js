// sendOSCToTouchDesigner.js
// 브라우저 환경에서 TouchDesigner로 OSC 메시지를 전송하는 함수

export function sendOSCToTouchDesigner(result, selectedColorIndex = null, selectedPaint = null) {
  const seasonToNumber = {
    '봄 웜톤': 1,
    '여름 쿨톤': 2,
    '가을 웜톤': 3,
    '겨울 쿨톤': 4
  };

  const season = result.apiResponse.colorResult.season || result.season || '봄';

  const numericValue = seasonToNumber[season] || seasonToNumber[season.split(' ')[0]] || 1;

  console.log(`📡 Preparing OSC message for TouchDesigner`);
  console.log(`Season: ${season} → Numeric: ${numericValue}`);
  console.log(`Selected Color Index: ${selectedColorIndex}`);
  console.log(`Selected Paint:`, selectedPaint);

  // TouchDesigner로 HTTP POST 요청을 통해 OSC 데이터 전송
  const oscData = {
      season: numericValue,
      seasonName: season,
      selectedColorIndex: selectedColorIndex,
      selectedPaint: selectedPaint,
  };

  return sendOSCViaHTTP(oscData);
}

// HTTP를 통해 TouchDesigner로 OSC 데이터 전송
async function sendOSCViaHTTP(oscData) {
  try {
    // TouchDesigner의 HTTP 서버 엔드포인트 (일반적으로 9980 포트 사용)
    const touchDesignerURL = 'http://localhost:9980/osc';

    const response = await fetch(touchDesignerURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify(oscData)
    });
    console.log(response);
    if (response.ok) {
      console.log('✅ OSC data sent to TouchDesigner successfully');
      return { success: true, message: 'OSC 데이터가 TouchDesigner로 성공적으로 전송되었습니다.' };
    } else {
      //throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    // console.error('❌ Failed to send OSC data to TouchDesigner:', error);
  }
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