import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function generateHash(password: string) {
  // 1. 유저 고유의 무작위 16바이트 Salt 생성
  const salt = randomBytes(16).toString("hex");

  // 2. scrypt로 비밀번호 + Salt를 해싱
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  // 3. DB에 저장될 최종 형태 "Salt:HexKey"
  const passwordHash = `${salt}:${derivedKey.toString("hex")}`;

  console.log("\n==========================================");
  console.log(`🔑 입력 비밀번호: ${password}`);
  console.log(`🎲 생성된 Salt : ${salt}`);
  console.log(`🔐 최종 passwordHash (DB 저장용):`);
  console.log(passwordHash);
  console.log("==========================================\n");
}

// 생성할 비밀번호 입력
generateHash("1234");
