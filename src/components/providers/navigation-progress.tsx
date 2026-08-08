"use client";

import NextTopLoader from "nextjs-toploader";

export function NavigationProgress() {
  return (
    <NextTopLoader
      color="#f97316"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3.5}
      showSpinner={false}
      speed={350}
      easing="ease-out"
      showAtBottom={false}
      shadow="0 0 16px #f97316, 0 0 8px #ea580c"
      zIndex={99999}
    />
  );
}
