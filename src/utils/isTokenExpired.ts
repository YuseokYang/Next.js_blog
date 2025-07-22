// utils/isTokenExpired.ts
import { jwtDecode } from "jwt-decode";

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)
    return decoded.exp < now;
  } catch {
    return true; // 디코딩 실패 = 만료된 것으로 간주
  }
}
