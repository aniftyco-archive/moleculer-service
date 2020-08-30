import { Service as MoleculerService } from 'moleculer';

export class Service extends MoleculerService {
  public created?(): void;
  public started?(): Promise<void>;
  public stopped?(): Promise<void>;
}
