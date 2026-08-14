// The library expects a global `Parse` provided by the consuming application
// (browser build) or a Parse server. For tests we wire the Node build in as the
// global so Parse-dependent modules can be imported and exercised.
import Parse from 'parse/node';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Parse = Parse;
