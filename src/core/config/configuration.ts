export default () => ({
    // JWT Configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'fallback-secret-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    
    // OAuth Configuration
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
    },
    
    // Security
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
      tokenLength: parseInt(process.env.TOKEN_LENGTH) || 32,
    },
    
    // Application
    app: {
      name: process.env.APP_NAME || 'Zylos AI',
      url: process.env.APP_URL || 'http://localhost:3000',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@zylos.ai',
    },
  });