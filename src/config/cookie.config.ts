export const CookieConfig = {
  REFRESH_TOKEN: {
    name: 'refresh_token',
    options: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY || '2592000000'),
      path: '/',
    },
  },
  ACCESS_TOKEN: {
    name: 'access_token',
    options: {
      httpOnly: true,
      secure: false,
      sameSite: 'strict' as const,
      maxAge: 15 * 60 * 1000,
      path: '/',
    },
  },
  SKIP_ROUTES: [
    '/auth/login',
    '/auth/register',
    '/auth/verify-otp',
    '/auth/forgot-password',
    '/auth/reset-password',
  ],
} as const;
