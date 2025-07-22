// utils/fetchWithAuth.ts
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response | undefined> {
  const token = localStorage.getItem('access_token');

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 403 || res.status === 401) {
    // 🔒 인증 실패 → 토큰 삭제하고 로그인 페이지로 이동
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    return;
  }

  return res;
}
