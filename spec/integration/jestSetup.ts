// Integration per-file setup (runs in the test worker):
// - wire the Node build of Parse in as the global `Parse` the library expects;
// - expose Node's WebCrypto + perf_hooks under `window` so SecureObject/CryptoUtils run;
// - point the Parse client at the server booted in globalSetup.
import Parse from 'parse/node';
import { performance } from 'perf_hooks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Parse = Parse;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).window = {
  crypto: globalThis.crypto,
  performance,
};

Parse.initialize(
  process.env.PARSE_TEST_APP_ID as string,
  undefined,
  process.env.PARSE_TEST_MASTER_KEY as string
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Parse as any).serverURL = process.env.PARSE_TEST_SERVER_URL;
