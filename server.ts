import fastify from 'fastify';
import { httpDbFastify } from './fastifyPlugin';
import BunSqliteExecutor from './src/queryExecutors/bun:sqlite/BunSqliteExecutor';

const app = fastify({ logger: true });

const folder = `./storage`;
const file = `${folder}/bundb.sql`;

app.register(
	httpDbFastify(file, { queryExecutor: new BunSqliteExecutor(file) })
);

const port = 3000;

app.listen({ port, host: '0.0.0.0' });
