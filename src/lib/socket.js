import { io } from 'socket.io-client';
import { BACKEND_URL } from './api';

export function createSocket() {
  return io(BACKEND_URL, {
    transports: ['websocket']
  });
}
