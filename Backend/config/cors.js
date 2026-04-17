export function getCorsOptions() {
  const allowlist = new Set([
    "http://localhost:5173",
    "https://profile-management-aj6e.vercel.app"
  ]);

  return {
    origin: function (origin, callback) {
      // Allow requests without origin (Postman, curl, etc.)
      if (!origin) return callback(null, true);

      // Normalize origin (remove trailing slash)
      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowlist.has(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error("❌ CORS blocked:", origin);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],

    credentials: true,

    optionsSuccessStatus: 200, // safer than 204 for some browsers
  };
}