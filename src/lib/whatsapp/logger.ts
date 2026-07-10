const PREFIX = "[whatsapp-crm]";

export const whatsappLogger = {
  info(message: string, meta?: Record<string, unknown>) {
    if (meta) {
      console.info(PREFIX, message, meta);
      return;
    }
    console.info(PREFIX, message);
  },
  warn(message: string, meta?: Record<string, unknown>) {
    if (meta) {
      console.warn(PREFIX, message, meta);
      return;
    }
    console.warn(PREFIX, message);
  },
  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    console.error(PREFIX, message, error, meta ?? "");
  },
};
