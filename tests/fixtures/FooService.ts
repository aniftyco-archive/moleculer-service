import { Context } from 'moleculer';
import { action, service } from '../../src/decorators';
import { Service } from '../../src/service';

type BarParams = {
  foo: boolean;
};
@service()
export class FooService extends Service {
  @action<BarParams>({
    params: {
      foo: 'string',
    },
  })
  public async bar(ctx: Context<BarParams>) {
    return ctx.params.foo;
  }

  public async started() {
    this.logger.info('Started FOO');
  }
}
