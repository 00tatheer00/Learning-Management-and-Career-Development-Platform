"use client";

import NextTopLoader from "nextjs-toploader";

export function NavigationProgress() {
  return (
    <NextTopLoader
      color="#ea580c"
      initialPosition={0.1}
      crawlSpeed={200}
      height={2.5}
      showSpinner={false}
      speed={300}
      easing="ease"
      shadow="0 0 8px rgba(234,88,12,0.4)"
      zIndex={99999}
    />
  );
}
