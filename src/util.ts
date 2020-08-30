import 'reflect-metadata';
import { isString, camelCase } from 'lodash';
import { ActionMetadataPrefix, EventMetadataPrefix } from './decorators';

export const convertToOptions = (
  options: string | Record<string, any>,
  additional: Record<string, any> = {}
) => {
  if (isString(options)) {
    return { ...additional, name: options };
  }

  return { ...additional, ...options };
};

export const generateServiceName = (name: string) => {
  return camelCase(name.replace(/(.+)Service/, '$1'));
};

export const generateHooks = (
  hooks: Partial<Record<'before' | 'after' | 'error', Function>> = {}
) => {
  return Object.entries(hooks).reduce((hooks, [hook, callback]) => {
    hooks[hook] = {
      '*': callback,
    };

    return hooks;
  }, {});
};

export const generateActions = (target: any) => {
  return Reflect.getMetadataKeys(target)
    .filter((key: string) => key.startsWith(ActionMetadataPrefix))
    .map((key: string) => Reflect.getMetadata(key, target))
    .reduce((actions, { name, options }) => {
      actions[name] = {
        name: name,
        ...options,
        handler: target[name],
      };

      return actions;
    }, {});
};

export const generateEvents = (target: any) => {
  return Reflect.getMetadataKeys(target)
    .filter((key: string) => key.startsWith(EventMetadataPrefix))
    .map((key: string) => Reflect.getMetadata(key, target))
    .reduce((events, { name, options }) => {
      events[name] = {
        name,
        ...options,
        handler: target[name],
      };

      return events;
    }, {});
};
