import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import { container } from 'tsyringe';
import { env } from '@config/env';
import type { ITokenService } from '@domain/user/services/ITokenService';
import { USER_TOKENS } from '@domain/user/tokens';
import { NOTIFICATION_TOKENS } from '@domain/notification/tokens';
import { NotificationSocketGateway } from './services/NotificationSocketGateway.js';

function cookieValue(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  return header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function configureNotificationSocket(server: HttpServer): Server {
  const io = new Server(server, {
    cors: { origin: env.FRONTEND_URL, credentials: true },
  });
  const tokenService = container.resolve<ITokenService>(USER_TOKENS.TokenService);

  io.use((socket, next) => {
    try {
      const token = cookieValue(socket.handshake.headers.cookie, 'accessToken');
      if (!token) throw new Error('Missing access token.');
      const payload = tokenService.verifyAccessToken(decodeURIComponent(token));
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Unauthorized.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = typeof socket.data.userId === 'string' ? socket.data.userId : '';
    if (userId) socket.join(`user:${userId}`);
  });

  container.resolve<NotificationSocketGateway>(NOTIFICATION_TOKENS.SocketGateway).attach(io);
  return io;
}
