import { registerAs } from '@nestjs/config';

export default registerAs('refreshToken', () => ({
  expiresMs: parseInt(process.env.REFRESH_TOKEN_EXPIRES_MS || '2592000', 10),
}));
