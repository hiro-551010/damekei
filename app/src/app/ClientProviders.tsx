"use client";

import { LanguageProvider } from "@/shared/contexts/LanguageContext";
import { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
