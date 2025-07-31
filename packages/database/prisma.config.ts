import type { PrismaConfig } from '@prisma/config';
import { loadEnv } from './config/env';

// Database config'indeki env'yi yükle (fallback dahil)
loadEnv();

export default {
  earlyAccess: true,
  schema: './schema.prisma',
} satisfies PrismaConfig;
