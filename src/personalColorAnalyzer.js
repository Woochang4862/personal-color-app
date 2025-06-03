import 'dotenv/config'; // Automatically loads .env - SHOULD BE FIRST!
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Reads API key from .env
});

// Define the prompt directly in the code
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