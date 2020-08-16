import { ServiceBroker } from 'moleculer';
import {
  action,
  event,
  EventMetadataPrefix,
  ActionMetadataPrefix,
} from '../src/decorators';
import { FooService } from './fixtures/FooService';

describe('moleculer-service', () => {
  describe('service', () => {
    const broker = new ServiceBroker({ logger: false });

    beforeAll(() => broker.start());
    afterAll(() => broker.stop());

    it.only('should not blowup', async () => {
      broker.createService(FooService);

      await broker.waitForServices('foo');

      const result = await broker.call('foo.bar');

      expect(result).toBe('bar');
    });
  });

  describe('action', () => {
    it('should set name on metadata if passed a string', () => {
      const target = {};
      const actionName = 'example';

      action('foo')(target, actionName, {});

      const result = Reflect.getMetadata(
        `${ActionMetadataPrefix}:${actionName}`,
        target
      );

      expect(result).toEqual({
        name: actionName,
        options: expect.objectContaining({ name: 'foo' }),
      });
    });

    it('should set name on metadata if passed an object', () => {
      const target = {};
      const actionName = 'example';

      action({ name: 'bar' })(target, actionName, {});

      const result = Reflect.getMetadata(
        `${ActionMetadataPrefix}:${actionName}`,
        target
      );

      expect(result).toEqual({
        name: actionName,
        options: expect.objectContaining({ name: 'bar' }),
      });
    });

    it('should set name on metadata of the method name if passed nothing', () => {
      const target = {};
      const actionName = 'baz';

      action()(target, actionName, {});

      const result = Reflect.getMetadata(
        `${ActionMetadataPrefix}:${actionName}`,
        target
      );

      expect(result).toEqual({
        name: actionName,
        options: expect.objectContaining({ name: 'baz' }),
      });
    });
  });

  describe('event', () => {
    it('should set name on metadata if passed a string', () => {
      const target = {};
      const actionName = 'example';
      const eventName = 'test.event.name';

      event(eventName)(target, actionName, {});

      const result = Reflect.getMetadata(
        `${EventMetadataPrefix}:${actionName}`,
        target
      );

      expect(result).toEqual({
        name: actionName,
        options: expect.objectContaining({ name: eventName }),
      });
    });

    it('should set name on metadata if passed an object', () => {
      const target = {};
      const actionName = 'example';
      const eventName = 'test.event.name';

      event({ name: eventName })(target, actionName, {});

      const result = Reflect.getMetadata(
        `${EventMetadataPrefix}:${actionName}`,
        target
      );

      expect(result).toEqual({
        name: actionName,
        options: expect.objectContaining({ name: eventName }),
      });
    });

    it('should throw an error if no name is passed', () => {
      try {
        event()({}, 'foo', {});
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.message).toBe('Event must have a name to listen for');
      }
    });
  });
});
