/*
 * Jest globalSetup: boot an in-memory MongoDB + a real Parse Server ONCE for the whole
 * integration run. This runs in Jest's main Node process (not the per-file VM sandbox),
 * so parse-server's dynamic import()s work here — starting it inside a test file's VM
 * fails with "dynamic import callback was invoked without --experimental-vm-modules".
 *
 * The server URL / credentials are handed to the test workers via env vars; the server
 * handles are stashed on globalThis for globalTeardown to stop.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ParseServer } from 'parse-server';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('http');

const APP_ID = 'goplan-utils-test';
const MASTER_KEY = 'test-master-key';

export default async function globalSetup(): Promise<void> {
  const mongod = await MongoMemoryServer.create();
  const databaseURI = mongod.getUri();

  const app = express();
  const httpServer = http.createServer(app);
  await new Promise<void>(resolve => httpServer.listen(0, resolve));
  const port = httpServer.address().port;
  const serverURL = `http://127.0.0.1:${port}/parse`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ParseServerCtor = ParseServer as any;
  const parseServer = new ParseServerCtor({
    databaseURI,
    appId: APP_ID,
    masterKey: MASTER_KEY,
    serverURL,
    allowClientClassCreation: true,
    silent: true,
  });
  await parseServer.start();
  app.use('/parse', parseServer.app);

  process.env.PARSE_TEST_SERVER_URL = serverURL;
  process.env.PARSE_TEST_APP_ID = APP_ID;
  process.env.PARSE_TEST_MASTER_KEY = MASTER_KEY;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__PARSE_TEST__ = { mongod, httpServer };
}
