import { Context } from 'moleculer';
import { Moleculer, service, action } from 'moleculer-service';

type WelcomeParams = {
  name: string;
};

@service()
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
    graphql: {
      mutation: `
			welcome(name: String!): String!
		`,
    },
  })
  public async welcome(ctx: Context<WelcomeParams>) {
    return `Welcome, ${ctx.params.name}`;
  }
}

export = GreeterService;
