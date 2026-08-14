import type { Server } from 'http';
import type { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalTeardown(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handles = (globalThis as any).__PARSE_TEST__ as
    | { mongod: MongoMemoryServer; httpServer: Server }
    | undefined;

  if (!handles) {
    return;
  }

  await new Promise<void>(resolve => handles.httpServer.close(() => resolve()));
  await handles.mongod.stop();
}
