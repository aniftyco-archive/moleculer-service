import { Service } from 'moleculer';

export class Moleculer extends Service {
  public created?(): void;
  public started?(): Promise<void>;
  public stopped?(): Promise<void>;
}
