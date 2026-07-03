"use client";

import { useEffect, useState } from "react";

export function getBrowserAppUrl() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
}

export function buildJoinUrl(sessionCode: string) {
  const appUrl = getBrowserAppUrl();
  return appUrl ? `${appUrl}/join/${sessionCode}` : `/join/${sessionCode}`;
}

export function useJoinUrl(sessionCode: string) {
  const [joinUrl, setJoinUrl] = useState(() => {
    if (!sessionCode) {
      return "";
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    return appUrl ? `${appUrl}/join/${sessionCode}` : `/join/${sessionCode}`;
  });

  useEffect(() => {
    setJoinUrl(sessionCode ? buildJoinUrl(sessionCode) : "");
  }, [sessionCode]);

  return joinUrl;
}
