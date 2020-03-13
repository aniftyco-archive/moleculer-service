# Moleculer Service

TypeScript decorators for [Moleculer](https://moleculer.services).

## Install

```shell
$ yarn add moleculer-service
```

## Example

```typescript
import { Context } from 'moleculer';
import { Service, service, action, event } from 'moleculer-service';

type WelcomeParams = {
  name: string;
};

@service('greeter')
class GreeterService extends Service {
  @action('hello')
  public async hello(ctx: Context) {
    return 'Hello, World!';
  }

  @action({
    name: 'welcome',
    params: {
      name: 'string',
    },
  })
  public async welcome(ctx: Context<WelcomeParams>) {
    return `Welcome, ${ctx.params.name}!`;
  }

  @event('some.event')
  public async onSomeEvent(payload: Record<string, any>, sender: string, eventName: string) {
    this.logger.info(`Event[${sender}][${eventName}]: ${JSON.stringify(payload)}`);
  }
}
```
