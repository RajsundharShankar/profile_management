export function getCorsOptions() {
  const allowlist = new Set(
    (process.env.CLIENT_URL
      ? [process.env.CLIENT_URL]
      : ['http://localhost:5173', 'https://profile-management-aj6e.vercel.app']
    )
      .map((u) => String(u).trim())
      .filter(Boolean)
  );

  return {
    origin(origin, callback) {
      // Allow non-browser requests (no Origin header), e.g. curl/postman/health checks
      if (!origin) return callback(null, true);
      if (allowlist.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    optionsSuccessStatus: 204,
  };
}

