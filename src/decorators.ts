import 'reflect-metadata';
import {
  Context,
  ActionVisibility,
  ActionParams,
  ActionCacheOptions,
  TracingOptions,
  BulkheadOptions,
  BrokerCircuitBreakerOptions,
  RetryPolicyOptions,
  FallbackHandler,
  EventSchema,
  ServiceSettingSchema,
  ServiceDependency,
  ServiceSchema,
  ServiceActionsSchema,
  ServiceEvents,
} from 'moleculer';
import { Service } from './service';
import {
  generateServiceName,
  generateActions,
  generateEvents,
  generateHooks,
  convertToOptions,
} from './util';

export const ActionMetadataPrefix = 'service:action';
export const EventMetadataPrefix = 'service:event';

type ServiceHooks = {
  before?: (
    this: InstanceType<typeof Service>,
    ctx: Context<any, any>
  ) => Promise<void> | void;
  after?: (
    this: InstanceType<typeof Service>,
    ctx: Context<any, any>,
    res: any
  ) => Promise<any> | any;
  error?: (
    this: InstanceType<typeof Service>,
    ctx: Context<any, any>,
    err: Error
  ) => Promise<void> | void;
};

type ActionOptions = {
  visibility?: ActionVisibility;
  params?: ActionParams;
  cache?: boolean | ActionCacheOptions;
  tracing?: boolean | TracingOptions;
  bulkhead?: BulkheadOptions;
  circuitBreaker?: BrokerCircuitBreakerOptions;
  retryPolicy?: RetryPolicyOptions;
  fallback?: string | FallbackHandler;
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

export const event = (options?: string | Omit<EventSchema, 'handler'>) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!options) {
      throw new TypeError('Event must have a name to listen for');
    }

    Reflect.defineMetadata(
      `${EventMetadataPrefix}:${key}`,
      { name: key, options: convertToOptions(options) },
      target
    );

    return descriptor;
  };
};

type ServiceOptions = {
  name?: string;
  version?: string;
  settings?: ServiceSettingSchema;
  dependencies?: string | ServiceDependency | Array<string | ServiceDependency>;
  metadata?: Record<string, any>;
  mixins?: ServiceSchema[];
  hooks?: ServiceHooks;
};

type ServiceConstructor<T = {}> = new (...args: any[]) => T;

export type ServiceDecorator = <T extends ServiceConstructor>(
  constructor: T
) => T;

export const service = (
  options: string | ServiceOptions = {}
): ServiceDecorator => {
  const opts: ServiceOptions = convertToOptions(options);

  return <T extends ServiceConstructor>(constructor: T) => {
    const schema = {
      ...opts,
      name: opts.name || generateServiceName(constructor.name),
      version: opts.version,
      settings: opts.settings,
      dependencies: opts.dependencies,
      metadata: opts.metadata,
      mixins: opts.mixins,
      hooks: generateHooks(opts.hooks) as ServiceHooks,
      actions: generateActions(constructor.prototype) as ServiceActionsSchema,
      events: generateEvents(constructor.prototype) as ServiceEvents,
    };

    const ServiceClass = class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        (this as any).parseServiceSchema({
          ...schema,
          created: (this as any).created,
          started: (this as any).started,
          stopped: (this as any).stopped,
        });
      }
    };

    Object.defineProperty(ServiceClass, 'name', {
      value: constructor.name,
    });

    Object.setPrototypeOf(ServiceClass, constructor);

    return ServiceClass;
  };
};
