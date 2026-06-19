import { toast as sonnerToast } from "sonner";

export const toast = {
  success(message: string, description?: string) {
    sonnerToast.success(message, description ? { description } : undefined);
  },
  error(message: string, description?: string) {
    sonnerToast.error(message, description ? { description } : undefined);
  },
  info(message: string, description?: string) {
    sonnerToast.info(message, description ? { description } : undefined);
  },
  warning(message: string, description?: string) {
    sonnerToast.warning(message, description ? { description } : undefined);
  },
  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) {
    return sonnerToast.promise(promise, messages);
  },
};
