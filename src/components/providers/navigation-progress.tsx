"use client";

import NextTopLoader from "nextjs-toploader";

export function NavigationProgress() {
  return (
    <NextTopLoader
      color="#ea580c"
      height={2}
      showSpinner={false}
      crawlSpeed={300}
      speed={400}
      easing="ease-out"
      showAtBottom={false}
      shadow={false}
    />
  );
}
