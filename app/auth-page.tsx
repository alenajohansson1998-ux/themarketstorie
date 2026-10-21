"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm, { type AuthMode } from "@/components/AuthForm";

function getCallbackUrl(fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = new URLSearchParams(window.location.search).get("callbackUrl");
  // Only follow same-site paths.
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export default function AuthPage({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md rounded-media bg-canvas p-6 shadow-sm sm:p-8">
        <AuthForm
          headingLevel="h1"
          mode={mode}
          onModeChange={(next) => {
            setMode(next);
            window.history.replaceState(null, "", next === "login" ? "/login" : "/register");
          }}
          onSuccess={(completed) => {
            router.push(getCallbackUrl(completed === "login" ? "/dashboard" : "/"));
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
