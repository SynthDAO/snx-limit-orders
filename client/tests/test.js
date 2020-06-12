import Client from '../src/index';
import "regenerator-runtime/runtime.js";
import FakeProvider from 'web3-fake-provider';

test('Runs without crashing', () => {
  new Client(new FakeProvider());
});

