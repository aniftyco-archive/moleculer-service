import {
  GenericObject,
  ServiceDependency,
  Service as MoleculerService,
  ServiceSchema,
  ServiceSettingSchema,
} from 'moleculer';

export class Moleculer extends MoleculerService {
  public settings: ServiceSettingSchema = {};
  public dependencies: string | ServiceDependency | Array<string | ServiceDependency> = [];
  public metadata: GenericObject = {};
  public mixins: ServiceSchema[] = [];

  public created?(): void;
  public started?(): Promise<void>;
  public stopped?(): Promise<void>;
}
