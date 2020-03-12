import 'reflect-metadata';
import * as moleculer from 'moleculer';
import { Service } from './service';
import { generateServiceName, generateActions, generateEvents, generateHooks, convertToOptions } from './util';

export const ActionMetadataPrefix = 'service:action';
export const EventMetadataPrefix = 'service:event';

type ServiceHooks = {
  before?: (this: InstanceType<typeof Service>, ctx: moleculer.Context<any, any>) => Promise<void> | void;
  after?: (this: InstanceType<typeof Service>, ctx: moleculer.Context<any, any>, res: any) => Promise<any> | any;
  error?: (this: InstanceType<typeof Service>, ctx: moleculer.Context<any, any>, err: Error) => Promise<void> | void;
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

export const action = (options: string | ActionOptions = {}) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      `${ActionMetadataPrefix}:${key}`,
      { name: key, options: convertToOptions(options, { name: key }) },
      target
    );

    return descriptor;
  };
};

export const event = (options: string | Omit<moleculer.EventSchema, 'handler'>) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(`${EventMetadataPrefix}:${key}`, { name: key, options: convertToOptions(options) }, target);

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

export const service = (options: string | ServiceOptions = {}) => {
  const opts: ServiceOptions = convertToOptions(options);

  return <S extends Constructor<Service>>(Service: S) =>
    class extends Service {
      public constructor(...args: any[]) {
        super(...args);

        this.parseServiceSchema({
          name: opts.name || this.name || generateServiceName(Service.name),
          version: opts.version || this.version,
          settings: opts.settings || this.settings,
          dependencies: opts.dependencies || this.dependencies,
          metadata: opts.metadata || this.metadata,
          mixins: opts.mixins || this.mixins,
          hooks: generateHooks(opts.hooks) as moleculer.ServiceHooks,
          actions: generateActions(this) as moleculer.ServiceActionsSchema,
          events: generateEvents(this) as moleculer.ServiceEvents,
          created: this.created as () => void,
          started: this.started as () => Promise<void>,
          stopped: this.stopped as () => Promise<void>,
        });
      }
    } as any;
};
