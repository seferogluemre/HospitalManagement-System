import { PrismaClient } from './client/client';

const enableQueryLog = false;
const prisma = new PrismaClient(
  enableQueryLog
    ? {
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'stdout',
            level: 'error',
          },
          {
            emit: 'stdout',
            level: 'info',
          },
          {
            emit: 'stdout',
            level: 'warn',
          },
        ],
      }
    : undefined,
);

export default prisma;
