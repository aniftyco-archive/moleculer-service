import { createServer } from 'http';
import WebGateway = require('moleculer-web');
import { ApolloService } from 'moleculer-apollo-server';
import express from 'express';
import { Moleculer, service, event } from 'moleculer-service';

@service({ name: 'web' })
class WebService extends Moleculer {
  private app: any = null;
  private server: any = null;
  public mixins = [
    WebGateway,
    ApolloService({
      routeOptions: {
        path: '/graphql',
        cors: true,
        mappingPolicy: 'restrict',
      },
    }),
  ];
  public settings = {
    port: process.env.PORT,
    ip: '0.0.0.0',
    server: false,
  };

  public created() {
    this.app = express();
    this.server = createServer(this.app);

    this.app.get('/', (_: any, res: any) => {
      res.send('hello');
    });
  }

  public async started() {
    this.app.use(this.express());
    this.server.listen(Number(this.settings.port), (err: any) => {
      if (err) {
        return this.broker.fatal(err);
      }

      this.logger.info(`Server started on port ${this.settings.port}`);
    });
  }

  public async stopped() {
    this.server.close((err: any) => {
      if (err) {
        return this.logger.error('Web service close err!', err);
      }

      this.logger.info('Web service stopped!');
    });
  }

  @event({ name: 'graphql.schema.updated' })
  public async graphqlSchemaUpdated(payload: Record<string, any>) {
    this.logger.info('Generated GraphQL schema:\n\n' + payload.schema);
  }
}

export = WebService;
