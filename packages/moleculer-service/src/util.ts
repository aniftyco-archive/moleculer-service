import 'reflect-metadata';
import { camelCase } from 'lodash';
import { ActionMetadataPrefix, EventMetadataPrefix } from './decorators';
import { Moleculer } from './moleculer';

export const generateServiceName = (name: string) => {
  return camelCase(name.replace(/(.+)Service/, '$1'));
};

export const generateActions = (target: Moleculer) =>
  Reflect.getMetadataKeys(target)
    .filter((key: string) => key.startsWith(ActionMetadataPrefix))
    .map((key: string) => Reflect.getMetadata(key, target))
    .reduce((actions, { name, options }) => {
      actions[name] = {
        name,
        ...options,
        handler: target[name],
      };

      return actions;
    }, {});

export const generateEvents = (target: Moleculer) =>
  Reflect.getMetadataKeys(target)
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
