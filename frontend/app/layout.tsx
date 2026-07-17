import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "StudyPlatform – Premium Learning for Class 1–12",
  description: "Notes, videos, MCQ tests and attendance tracking for Class 1 to 12.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#12143E",
                  color: "#f1f5f9",
                  border: "1px solid rgba(124,58,237,.25)",
                  borderRadius: "12px",
                  fontSize: "13px",
                  padding: "12px 16px",
                },
                success: { iconTheme: { primary: "#10b981", secondary: "#f1f5f9" } },
                error:   { iconTheme: { primary: "#f43f5e", secondary: "#f1f5f9" } },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
