import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './config/env';
validateEnv();

import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocket } from './utils/socketServer';

const httpServer = http.createServer(app);

// initSocket sets up all Socket.io handlers internally (personal rooms, join/leave, etc.)
initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`🔌 Socket.io listening on port ${env.PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});
