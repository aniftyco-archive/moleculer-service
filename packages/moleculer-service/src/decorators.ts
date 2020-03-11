import 'reflect-metadata';
import { ActionSchema, EventSchema } from 'moleculer';
import { generateServiceName, generateActions, generateEvents } from './util';
import { Moleculer } from './moleculer';

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

type Constructor<T = {}> = new (...args: any[]) => T;

export const service = (options: ServiceOptions = {}) => {
  return <Service extends Constructor<Moleculer>>(Service: Service) =>
    class extends Service {
      public constructor(...args: any[]) {
        super(...args);

        this.parseServiceSchema({
          name: options.name || this.name || generateServiceName(Service.name),
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
