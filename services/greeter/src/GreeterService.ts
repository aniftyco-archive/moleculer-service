import { Context } from 'moleculer';
import { Moleculer, service, action } from 'moleculer-service';

type WelcomeParams = {
  name: string;
};

@service({
  hooks: {
    before() {
      this.logger.info('GREETER:HOOK:BEFORE');
    },
    after(_: Context, res: any) {
      this.logger.info('GREETER:HOOK:AFTER');

      return res;
    },
  },
})
class GreeterService extends Moleculer {
  @action({
    name: 'hello',
    graphql: {
      query: `
		hello: String!
	  `,
    },
  })
  public async hello() {
    return 'Hello Moleculer';
  }

  @action({
    name: 'welcome',
    params: {
      name: 'string',
    },
    hooks: {
      before() {
        this.logger.info('GREETER:BEFORE:WELCOME');
      },

      after(_: Context, res: any) {
        this.logger.info('GREETER:AFTER:WELCOME');

        return res;
      },
    },
    graphql: {
      mutation: `
			welcome(name: String!): String!
		`,
    },
  })
  public async welcome(ctx: Context<WelcomeParams>) {
    this.logger.info('GREETER:ACTION:WELCOME');
    return `Welcome, ${ctx.params.name}`;
  }
}

export = GreeterService;
