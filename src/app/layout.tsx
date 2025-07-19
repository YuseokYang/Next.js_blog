import "./globals.css";
import Providers from "@/components/Providers"; // ✅ 올바른 경로로 수정

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
