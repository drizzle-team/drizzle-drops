import { HttpDbHanlderCore } from './src/core/HttpDbHandlerCore';
import { V8Deliverer } from './src/deliverers/v8/V8Deliverer';
import D1QueryExecutor from './src/queryExecutors/d1/D1QueryExecutor';
import { V8Serializer } from './src/serializers/v8/V8Serializer';

const deliverer = new V8Deliverer();
const serializer = new V8Serializer();

export default {
	async fetch(request: Request, env: any) {
		const queryExecutor = new D1QueryExecutor(env.DB);
		const httpDbCore = new HttpDbHanlderCore(deliverer, serializer, queryExecutor);

		const url = new URL(request.url);

		switch (request.method) {
			case 'POST':
				{
					switch (url.pathname) {
						case '/migrate':
							{
								let { readable, writable } =
									new TransformStream();

								const bodyPayload = await request
									.clone()
									.text();

								await httpDbCore.migrate(bodyPayload, writable);

								return new Response(readable, {
		
								});
							}

							break;
						case '/query':
							{
								let { readable, writable } =
									new TransformStream();

								const bodyPayload = await request
									.clone()
									.text();

								httpDbCore.query(bodyPayload, writable);

								return new Response(readable, {
									headers: {
										'Content-Type': 'text/plain', // Set the appropriate content type
									},
								});
							}
							break;

						default:
							return new Response('Not Found', { status: 404 });
					}
				}
				break;

			default:
				return new Response('Not Found', { status: 404 });
		}
	},
};
