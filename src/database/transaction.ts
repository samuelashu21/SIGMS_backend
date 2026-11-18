
import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from './prisma.js';

export const executeTransaction = async <T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> => {
  return prisma.$transaction(callback, {
    maxWait: 5000,
    timeout: 10000
  });
};
