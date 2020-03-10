import { ServiceBroker, Errors } from 'moleculer';
import GreeterService from '../src/GreeterService';

describe("Test 'greeter' service", () => {
  const broker = new ServiceBroker({ logger: false });
  broker.createService(GreeterService);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  describe('Test `greeter.hello` action', () => {
    it("should return with 'Hello Moleculer'", () => {
      expect(broker.call('greeter.hello')).resolves.toBe('Hello Moleculer');
    });
  });

  describe('Test `greeter.welcome` action', () => {
    it("should return with 'Welcome'", () => {
      expect(broker.call('greeter.welcome', { name: 'Josh' })).resolves.toBe('Welcome, Josh');
    });

    it('should reject an ValidationError', () => {
      expect(broker.call('greeter.welcome')).rejects.toBeInstanceOf(Errors.ValidationError);
    });
  });
});
