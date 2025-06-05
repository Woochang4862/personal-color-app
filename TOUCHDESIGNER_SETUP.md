# TouchDesigner 연동 설정 가이드

퍼스널 컬러 앱과 TouchDesigner를 HTTP/REST API로 연동하는 방법을 설명합니다.

## 1. TouchDesigner 설정

### 1.1 Web Server DAT 추가
1. TouchDesigner에서 새 프로젝트를 생성합니다
2. `Web Server DAT`를 추가합니다
3. 다음과 같이 설정합니다:
   ```
   Port: 8888
   HTTP Methods: POST, GET, OPTIONS
   Allow CORS: On
   CORS Origins: *
   Threaded: On
   ```

### 1.2 Python Script 설정
Web Server DAT의 `Callbacks` 탭에서 다음 스크립트를 추가합니다:

```python
def onHTTPRequest(webServerDAT, request, response):
    """퍼스널 컬러 데이터를 받아서 TouchDesigner 파라미터로 설정"""
    
    if request['method'] == 'GET' and request['uri'] == '/ping':
        # 연결 상태 확인용 엔드포인트
        response['statusCode'] = 200
        response['statusReason'] = 'OK'
        response['data'] = 'TouchDesigner Connected'
        return
    
    if request['method'] == 'POST' and request['uri'] == '/personal-color':
        import json
        try:
            # JSON 데이터 파싱
            data = json.loads(request['data'])
            print(f"받은 퍼스널 컬러 데이터: {data}")
            
            # 기본 정보 설정 (원하는 오퍼레이터에 맞게 수정)
            if op('personalColor'):
                op('personalColor').par.colortype = data.get('colorType', '')
                op('personalColor').par.confidence = data.get('confidence', 0)
            
            # 추천 색상 파레트 설정 (Constant CHOP 또는 Palette TOP 사용)
            colors = data.get('recommendedColors', [])
            if op('colorPalette'):
                for i, color in enumerate(colors[:6]):  # 최대 6개 색상
                    if isinstance(color, dict) and 'rgb' in color:
                        # RGB 문자열에서 색상 값 추출 (예: "rgb(255,100,50)")
                        rgb_str = color['rgb']
                        if rgb_str.startswith('rgb('):
                            rgb_values = rgb_str[4:-1].split(',')
                            r = int(rgb_values[0]) / 255.0
                            g = int(rgb_values[1]) / 255.0  
                            b = int(rgb_values[2]) / 255.0
                        else:
                            # HEX 색상 처리 (예: "#FF6432")
                            hex_color = rgb_str.replace('#', '')
                            r = int(hex_color[0:2], 16) / 255.0
                            g = int(hex_color[2:4], 16) / 255.0
                            b = int(hex_color[4:6], 16) / 255.0
                        
                        # 파라미터 설정 (Constant CHOP의 경우)
                        op('colorPalette').par[f'value{i}x'] = r
                        op('colorPalette').par[f'value{i}y'] = g
                        op('colorPalette').par[f'value{i}z'] = b
            
            # 분석 정보 설정
            analysis = data.get('analysis', {})
            if op('analysisInfo'):
                op('analysisInfo').par.skinTone = analysis.get('skinTone', '')
                op('analysisInfo').par.season = analysis.get('season', '')
                op('analysisInfo').par.warmCool = analysis.get('warmCool', '')
            
            response['statusCode'] = 200
            response['statusReason'] = 'OK'
            response['data'] = 'Personal color data received successfully'
            
        except Exception as e:
            print(f"데이터 처리 중 오류: {e}")
            response['statusCode'] = 500
            response['statusReason'] = 'Internal Server Error'
            response['data'] = f'Error: {str(e)}'
        return
    
    if request['method'] == 'POST' and request['uri'] == '/trigger':
        import json
        try:
            data = json.loads(request['data'])
            trigger_name = data.get('trigger', '')
            print(f"받은 트리거: {trigger_name}")
            
            # 트리거에 따른 동작 실행
            if trigger_name == 'result_received':
                # 결과 받음 트리거 - 애니메이션 시작 등
                if op('resultAnimation'):
                    op('resultAnimation').par.play = 1
                    
            response['statusCode'] = 200
            response['data'] = f'Trigger {trigger_name} executed'
            
        except Exception as e:
            response['statusCode'] = 500
            response['data'] = f'Error: {str(e)}'
        return
    
    # 실시간 컬러 업데이트 (선택사항)
    if request['method'] == 'POST' and request['uri'] == '/color-update':
        import json
        try:
            data = json.loads(request['data'])
            colors = data.get('colors', [])
            
            # 실시간으로 색상 업데이트
            if op('liveColors'):
                for i, color in enumerate(colors[:3]):
                    op('liveColors').par[f'color{i}r'] = color[0]
                    op('liveColors').par[f'color{i}g'] = color[1] 
                    op('liveColors').par[f'color{i}b'] = color[2]
            
            response['statusCode'] = 200
            response['data'] = 'Colors updated'
            
        except Exception as e:
            response['statusCode'] = 500
            response['data'] = f'Error: {str(e)}'
        return
    
    # 기본 응답
    response['statusCode'] = 404
    response['statusReason'] = 'Not Found'
    response['data'] = 'Endpoint not found'
```

## 2. TouchDesigner 오퍼레이터 구성 예시

### 2.1 필요한 오퍼레이터들
다음 오퍼레이터들을 생성하여 퍼스널 컬러 데이터를 활용할 수 있습니다:

1. **personalColor (Text DAT)**
   - 퍼스널 컬러 타입과 신뢰도 저장
   - Parameters: `colortype`, `confidence`

2. **colorPalette (Constant CHOP)**
   - 추천 색상 팔레트 저장
   - Parameters: `value0x`, `value0y`, `value0z` (첫 번째 색상의 RGB)
   - Parameters: `value1x`, `value1y`, `value1z` (두 번째 색상의 RGB)
   - ... (총 6개 색상까지)

3. **analysisInfo (Text DAT)**
   - 분석 정보 저장
   - Parameters: `skinTone`, `season`, `warmCool`

4. **resultAnimation (Animation COMP)**
   - 결과 받았을 때 실행할 애니메이션

### 2.2 색상 데이터 활용 예시
```glsl
// Constant CHOP에서 색상 데이터를 Geometry에 적용
uniform float colorR;  // op('colorPalette')[0,0]
uniform float colorG;  // op('colorPalette')[0,1] 
uniform float colorB;  // op('colorPalette')[0,2]

// Fragment Shader에서 색상 적용
void main() {
    vec3 personalColor = vec3(colorR, colorG, colorB);
    fragColor = vec4(personalColor, 1.0);
}
```

## 3. React 앱에서 사용법

### 3.1 기본 사용법
퍼스널 컬러 결과 페이지에서:
- **T키**: TouchDesigner로 데이터 전송
- **스페이스바**: 홈으로 돌아가기

### 3.2 연결 상태 확인
- 결과 페이지에서 TouchDesigner 연결 상태를 실시간으로 확인할 수 있습니다
- 녹색 점: 연결됨
- 빨간색 점: 연결 안됨

### 3.3 전송되는 데이터 구조
```json
{
  "colorType": "spring-warm",
  "confidence": 85,
  "recommendedColors": [
    {"name": "코랄 핑크", "rgb": "rgb(255,127,80)"},
    {"name": "골든 옐로우", "rgb": "rgb(255,215,0)"}
  ],
  "characteristics": ["밝고 투명한 피부톤", "선명한 눈동자"],
  "timestamp": "2025-01-27T12:00:00.000Z",
  "analysis": {
    "skinTone": "warm",
    "season": "spring",
    "warmCool": "warm"
  }
}
```

## 4. 트러블슈팅

### 4.1 연결 안됨 문제
1. TouchDesigner Web Server DAT가 실행 중인지 확인
2. 포트 8888이 다른 프로그램에서 사용 중인지 확인
3. 방화벽 설정 확인

### 4.2 데이터가 안오는 문제
1. TouchDesigner의 Python 콘솔에서 오류 메시지 확인
2. 브라우저 개발자 도구의 Network 탭에서 HTTP 요청 상태 확인
3. CORS 설정이 올바른지 확인

### 4.3 색상 데이터 파싱 오류
1. 받은 JSON 데이터 구조 확인
2. 색상 형식이 예상과 다른지 확인 (RGB vs HEX)
3. 오퍼레이터 이름이 스크립트와 일치하는지 확인

## 5. 고급 활용

### 5.1 실시간 프리뷰
카메라로 얼굴을 분석하는 동안 실시간으로 색상을 TouchDesigner에 전송하여 라이브 프리뷰를 구현할 수 있습니다.

### 5.2 다중 엔드포인트
여러 TouchDesigner 인스턴스나 다른 포트로 동시에 데이터를 전송할 수 있도록 설정을 확장할 수 있습니다.

### 5.3 OSC 연동
HTTP 대신 OSC 프로토콜을 사용하여 더 실시간적인 통신도 가능합니다.

---

이 가이드를 따라 설정하면 퍼스널 컬러 분석 결과를 TouchDesigner에서 실시간으로 활용할 수 있습니다! 