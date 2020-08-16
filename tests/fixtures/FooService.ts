import { action, service } from '../../src/decorators';
import { Service } from '../../src/service';

@service()
export class FooService extends Service {
  @action()
  public async bar() {
    return 'bar';
  }

  public async started() {
    this.logger.info('Started FOO');
  }
}
