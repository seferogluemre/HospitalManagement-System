import { Prisma } from './client/client';
import prisma from './instance';

export const PrismaModelNameSnakeCase = Object.keys(prisma).filter(
  (key) => !key.startsWith('$'),
) as unknown as PrismaModelNameSnakeCase;
// eslint-disable-next-line
export type PrismaModelNameSnakeCase = Exclude<
  {
    [K in keyof typeof prisma]: K extends `$${string}` ? never : K;
  }[keyof typeof prisma],
  symbol
>;
export const PrismaModelNamePascalCase = Object.values(Prisma.ModelName);
// eslint-disable-next-line
export type PrismaModelNamePascalCase = (typeof PrismaModelNamePascalCase)[number];
