// tsyringe (the dependency-injection library used by the app's controllers
// and use cases) needs this polyfill loaded before anything else. Mocha
// loads this file first (see .mocharc.json).
import 'reflect-metadata';
