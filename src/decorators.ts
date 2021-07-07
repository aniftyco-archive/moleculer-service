import 'reflect-metadata';
import {
  Context,
  EventSchema,
  ServiceSettingSchema,
  ServiceDependency,
  ServiceSchema,
  ServiceActionsSchema,
  ServiceEvents,
  ActionParamTypes,
  ActionSchema,
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

type ExcludeObj<Base, Merged> = {
  [Property in Exclude<keyof Base, keyof Merged>]: Base[Property];
};
type Overwrite<Base, Merged> = ExcludeObj<Base, Merged> & Merged;

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

type SchemaStringTypes =
  | 'string'
  | {
      type: 'string' | 'email' | 'url';
      mode?: 'quick' | 'precise';
      empty?: boolean;
      min?: number;
      max?: number;
      length?: number;
      pattern?: RegExp | string;
      contains?: string;
      enum?: string[];
      alpha?: boolean;
      numeric?: boolean;
      alphanum?: boolean;
      alphadash?: boolean;
      optional?: boolean;
    };

type SchemaNumberTypes =
  | 'number'
  | {
      type: 'number';
      min?: number;
      max?: number;
      equal?: number;
      notEqual?: number;
      integer?: boolean;
      positive?: boolean;
      negative?: boolean;
      convert?: boolean;
      optional?: boolean;
    };

type SchemaBooleanTypes =
  | 'boolean'
  | {
      type: 'boolean';
      convert: boolean;
      optional?: boolean;
    };

type SchemaObjectTypes<T> = {
  type: 'object';
  props?: { [k in keyof T]: TypeName<T[k]> };
  optional?: boolean;
};

type SchemaArrayTypes<ArrayType> = ArrayType extends Array<infer ArrayItemType>
  ? {
      type: 'array';
      items: TypeName<ArrayItemType>;
      empty?: boolean;
      min?: number;
      max?: number;
      length?: number;
      contains?: ArrayItemType;
      enum?: ArrayItemType[];
      optional?: boolean;
    }
  : never;

// prettier-ignore
type TypeName<T> =
  T extends boolean ? SchemaBooleanTypes :
  T extends any[] ? SchemaArrayTypes<T> :
  T extends string ? SchemaStringTypes :
  T extends number ? SchemaNumberTypes :
  T extends Object ? SchemaObjectTypes<T> :
  T extends undefined ? 'undefined' :
  'any';

type ActionParams<ParamsType, BaseParamTypes> = keyof ParamsType extends never
  ? { [key: string]: never }
  : {
      [key in keyof ParamsType]: TypeName<
        ParamsType[key]
      > extends BaseParamTypes
        ? TypeName<ParamsType[key]>
        : BaseParamTypes;
    };

export const action = <Params = undefined>(
  options:
    | string
    | Partial<
        Params extends undefined
          ? ActionSchema
          : Overwrite<
              ActionSchema,
              { params: ActionParams<Params, ActionParamTypes> }
            >
      > = {}
) => {
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
