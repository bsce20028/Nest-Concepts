export const CookieConfig = {
  REFRESH_TOKEN: {
    name: 'refresh_token',
    options: {
      httpOnly: true,
      secure: false,
      sameSite: 'strict' as const,
      maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY || '2592000000'),
      path: '/',
    },
  },
} as const;
