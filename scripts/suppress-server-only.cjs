try {
  const p = require.resolve("server-only");
  require.cache[p] = { id: p, filename: p, loaded: true, exports: {} };
} catch {}
