import 'dotenv/config'; // Automatically loads .env - SHOULD BE FIRST!
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Reads API key from .env
});

// Define the prompt directly in the code
const SEASON_GUIDE = `
너는 퍼스널컬러 분석에 특화된 전문가 수준의 시각적 진단 모델이야.
LLM이자 이미지 분석 시스템으로서, 얼굴 이미지를 기반으로 피부, 모발, 눈의 시각적 특성을 분석해 퍼스널컬러를 진단해줘.

🧠 진단 기준 (한국인, 웹캠 이미지 기준)
1. **피부 하위톤**:
   - 노란/황금 기: 웜톤
   - 핑크/올리브/푸른 기: 쿨톤
   - 붉은 기(홍조)는 일시적일 수 있으므로 반드시 피부 바탕색 위주로 판단

2. **피부 밝기 및 투명도**:
   - 밝고 투명한 피부: 봄/여름
   - 중간~어두운 피부: 가을/겨울

3. **모발 색상**:
   - 갈색/금갈색 계열: 웜톤
   - 흑색/잿빛/푸른 기: 쿨톤

4. **눈동자 색 및 선명도**:
   - 밝고 투명한 황갈색: 봄/가을
   - 짙고 선명한 흑갈색/회갈색: 겨울/여름

5. **명암 대비**:
   - 피부와 눈/모발의 대비가 뚜렷: 겨울/봄
   - 대비가 낮고 부드러움: 여름/가을

📌 진단 목표
- 다음 중 하나로 분류 (단일 선택): 
  Spring Warm, Summer Cool, Autumn Warm, Winter Cool
- 신뢰도는 확률 (%)로 제공
- 분석은 **시각적 특징만** 근거로 반드시 논리적으로 추론

⚠️ 주의사항
- 인물 신원 추측 금지
- "분석 불가" 표현 금지. 무조건 명확한 추정 제공
- 사람이 아니라면, 그 사물이 무엇인지만 말하고 퍼스널컬러 진단하지 마
- 결과는 반드시 아래 JSON 형식으로 출력

📤 출력 형식 (JSON, 한국어로 작성):
{
  "season": "계절 톤 (예: 여름 쿨톤)",
  "probabilities": {
    "Spring Warm": "xx%",
    "Summer Cool": "xx%",
    "Autumn Warm": "xx%",
    "Winter Cool": "xx%"
  },
  "reason": "피부는 밝고 노란 기가 도는 아이보리 계열이며, 모발은 따뜻한 갈색 빛을 띠고, 눈동자는 부드러운 갈색입니다. 명도 대비가 낮고 전체적으로 따뜻한 인상으로 봄 웜톤으로 분류했습니다."
}

🧠 Let's think step by step.  
먼저 피부 톤을 분석하고, 모발 색상, 눈동자 밝기, 그리고 얼굴 전체의 대비를 순차적으로 판단한 뒤, 가장 어울리는 톤을 선택해줘.
`;

async function classifyPersonalColor(imgPath) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in .env file or environment variables.");
    }
    const imageAsBase64 = await fs.readFile(imgPath, 'base64');
    const fileExtension = path.extname(imgPath).substring(1); // e.g., 'jpg', 'png'

    const response = await client.chat.completions.create({
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
                url: `data:image/${fileExtension};base64,${imageAsBase64}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" } // To ensure the output is JSON
    });

    if (response.choices && response.choices.length > 0 && response.choices[0].message && response.choices[0].message.content) {
      return JSON.parse(response.choices[0].message.content);
    } else {
      throw new Error("Invalid response structure from OpenAI API");
    }
  } catch (error) {
    console.error("Error in classifyPersonalColor:", error.message || error);
    throw error;
  }
}

async function main() {
  try {
    let imagePath;
    if (process.argv.length > 2) {
      imagePath = process.argv[2];
    } else {
      console.error("Usage: node personalColorAnalyzer.js <path_to_image_file>");
      console.error("Example: node personalColorAnalyzer.js test1.jpg");
      process.exit(1);
    }

    if (!await fs.access(imagePath).then(() => true).catch(() => false)) {
      console.error(`Error: Image file not found at ${imagePath}`);
      process.exit(1);
    }
    const result = await classifyPersonalColor(imagePath);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    // Error logging is already handled in classifyPersonalColor, 
    // but we catch here to prevent unhandled promise rejection for main itself.
    console.error("Failed to execute main function:", error.message || error);
    process.exit(1);
  }
}

if (process.argv[1] && (process.argv[1].endsWith('personalColorAnalyzer.js') || process.argv[1].endsWith('personalColorAnalyzer'))) {
    main();
}

export { classifyPersonalColor };