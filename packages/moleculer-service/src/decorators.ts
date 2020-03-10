import 'reflect-metadata';
import { ActionSchema, EventSchema, ServiceBroker } from 'moleculer';
import { generateServiceName, generateActions, generateEvents } from './util';

export const ActionMetadataPrefix: string = 'service:action';
export const EventMetadataPrefix: string = 'service:event';

export const action = (options: Partial<Omit<ActionSchema, 'handler'>> = {}) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(`${ActionMetadataPrefix}:${key}`, { name: key, options }, target);

    return descriptor;
  };
};

export const event = (options?: Partial<Omit<EventSchema, 'handler'>>) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(`${EventMetadataPrefix}:${key}`, { name: key, options }, target);

    return descriptor;
  };
};

type ServiceOptions = {
  name?: string;
};

export const service = (options: ServiceOptions = {}) => {
  return (Service: any) =>
    class extends Service {
      public constructor(broker: ServiceBroker) {
        super(broker);

        this.parseServiceSchema({
          name: options.name || this.name || generateServiceName(Service),
          version: this.version,
          settings: this.settings,
          dependencies: this.dependencies,
          metadata: this.metadata,
          mixins: this.mixins,
          hooks: {},
          actions: generateActions(this),
          events: generateEvents(this),
          created: this.created as any,
          started: this.started as any,
          stopped: this.stopped as any,
        });
      }
    } as any;
};
