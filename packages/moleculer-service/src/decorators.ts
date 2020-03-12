import 'reflect-metadata';
import * as moleculer from 'moleculer';
import { generateServiceName, generateActions, generateEvents, generateHooks } from './util';
import { Moleculer } from './moleculer';

export const ActionMetadataPrefix: string = 'service:action';
export const EventMetadataPrefix: string = 'service:event';

type ServiceHooks = {
  before?: (this: InstanceType<typeof Moleculer>, ctx: moleculer.Context<any, any>) => Promise<void> | void;
  after?: (this: InstanceType<typeof Moleculer>, ctx: moleculer.Context<any, any>, res: any) => Promise<any> | any;
  error?: (this: InstanceType<typeof Moleculer>, ctx: moleculer.Context<any, any>, err: Error) => Promise<void> | void;
};

type ActionOptions = {
  visibility?: moleculer.ActionVisibility;
  params?: moleculer.ActionParams;
  cache?: boolean | moleculer.ActionCacheOptions;
  tracing?: boolean | moleculer.TracingOptions;
  bulkhead?: moleculer.BulkheadOptions;
  circuitBreaker?: moleculer.BrokerCircuitBreakerOptions;
  retryPolicy?: moleculer.RetryPolicyOptions;
  fallback?: string | moleculer.FallbackHandler;
  hooks?: ServiceHooks;
  [k: string]: any;
};

export const action = (options: ActionOptions = {}) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(`${ActionMetadataPrefix}:${key}`, { name: key, options }, target);

    return descriptor;
  };
};

export const event = (options?: Omit<moleculer.EventSchema, 'handler'>) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(`${EventMetadataPrefix}:${key}`, { name: key, options }, target);

    return descriptor;
  };
};

type ServiceOptions = {
  name?: string;
  version?: string;
  settings?: moleculer.ServiceSettingSchema;
  dependencies?: string | moleculer.ServiceDependency | Array<string | moleculer.ServiceDependency>;
  metadata?: Record<string, any>;
  mixins?: moleculer.ServiceSchema[];
  hooks?: ServiceHooks;
};

type Constructor<T = {}> = new (...args: any[]) => T;

export const service = (options: ServiceOptions = {}) => {
  return <S extends Constructor<Moleculer>>(Service: S) =>
    class extends Service {
      public constructor(...args: any[]) {
        super(...args);

        this.parseServiceSchema({
          name: options.name || this.name || generateServiceName(Service.name),
          version: options.version || this.version,
          settings: options.settings || this.settings,
          dependencies: options.dependencies || this.dependencies,
          metadata: options.metadata || this.metadata,
          mixins: options.mixins || this.mixins,
          hooks: generateHooks(options.hooks) as moleculer.ServiceHooks,
          actions: generateActions(this),
          events: generateEvents(this),
          created: this.created as any,
          started: this.started as any,
          stopped: this.stopped as any,
        });
      }
    } as any;
};
