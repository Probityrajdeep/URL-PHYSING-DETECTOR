const OAUTH_REDIRECT_URI = "http://localhost:5173/auth/callback";

const PROVIDER_CONFIG = {
  google: {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    params: {
      response_type: "code",
      scope: "openid profile email",
    },
  },
  github: {
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
    params: {
      scope: "user",
    },
  },
  microsoft: {
    authorizationEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    params: {
      response_type: "code",
      scope: "user.read",
    },
  },
};

/**
 * Builds an authorization URL for redirect-based OAuth in the frontend.
 */
export function getOAuthAuthorizationUrl(provider) {
  const normalizedProvider = String(provider || "").toLowerCase();
  const config = PROVIDER_CONFIG[normalizedProvider];

  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  if (!config.clientId) {
    throw new Error(`Missing ${`VITE_${normalizedProvider.toUpperCase()}_CLIENT_ID`} in your .env file.`);
  }

  const url = new URL(config.authorizationEndpoint);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", OAUTH_REDIRECT_URI);

  Object.entries(config.params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}
