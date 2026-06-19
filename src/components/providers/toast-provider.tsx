"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        duration: 4500,
        classNames: {
          toast: "font-sans",
        },
      }}
    />
  );
}
