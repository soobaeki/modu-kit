import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "❌ 에러: .env.local 파일에 GEMINI_API_KEY가 설정되어 있지 않습니다!",
  );
  process.exit(1);
}

const ai = new GoogleGenAI();

async function main() {
  const args = process.argv.slice(2);
  const prompt = args.join(" ");

  if (!prompt) {
    console.log('❌ 질문을 입력해주세요! 예: npm run ask "이 코드 설명해줘"');
    return;
  }

  const modelId = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  try {
    process.stdout.write("🤖 답변 생성 중...\r");

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    console.log(`\n\n[사용된 모델: ${modelId}]`);
    console.log((response.text ?? "답변이 없습니다.") + "\n");
  } catch (error) {
    console.error("❌ 에러 발생:", error.message || error);
  }
}

main();
