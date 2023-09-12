import axios from 'axios';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { migrate } from 'drizzle-orm/sqlite-proxy/migrator';
import { testTable } from './schema/schema';
import { log } from 'console';
import { stringify, parse, registerCustom } from 'superjson';
import { eq } from 'drizzle-orm';

const serialize = (data: any) => {
	return stringify(data);
};

const deserialize = <T>(data: any) => {
	return parse<T>(data);
};

registerCustom<Buffer, number[]>(
	{
		isApplicable: (v): v is Buffer => v instanceof Buffer,
		serialize: (v) => [...v],
		deserialize: (v) => Buffer.from(v),
	},
	'buffer'
);

// registerCustom<ArrayBuffer, number[]>(
// 	{
// 	  isApplicable: (v): v is ArrayBuffer => v instanceof ArrayBuffer,
// 	  serialize: v => [...new Uint8Array(v)],
// 	  deserialize: v => new Uint8Array([...v]).buffer as ArrayBuffer
// 	},
// 	"buffer"
//   );

const db = drizzle(async (sql, params, method) => {
	try {
		const rows = await axios.post(
			'https://proxy-worker.b-tkachuk26.workers.dev/query',
			serialize({
				sql,
				params,
				method,
			}),
			{
				transformResponse: (data) => deserialize(data),
				headers: { 'Content-Type': 'text/plain' },
			}
		);
		log("rows data:");

		log(rows.data);
		return { rows: rows.data };
	} catch (e: any) {
		console.error('Error from sqlite proxy server (QUERY): ', e.response?.data);
		return { rows: [] };
	}
});

const func = () => {
	const buff = Buffer.from('hello world');

	const serialized = serialize([ buff ]);
	log(buff);
	log(serialized);

	const deserialized = deserialize<{ buff: Buffer }>(serialized);

	log(deserialized);
	log(deserialized.buff);
};

// func()

const main = async () => {
	await migrate(
		db,
		async (queries) => {
			try {
				const rows = await axios.post(
					'https://proxy-worker.b-tkachuk26.workers.dev/migrate',
					serialize({
						queries,
					}),
					{ headers: { 'Content-Type': 'text/plain' } }
				);
			} catch (e: any) {
				console.error(
					'Error from sqlite proxy server (MIGRATION): ',
					e.response?.data
				);
			}
		},
		{ migrationsFolder: './drizzle' }
	);

	// await db.insert(testTable).values({
	// 	json: {
	// 		num: 123232,
	// 		str: 'hello world',
	// 		arr: [1, 'string', { obj: true }],
	// 		obj: { test: 'hello_world' },
	// 	},
	// 	num: 3228,
	// 	str: 'world hello',
	// });

	console.log('inserted');

	const data = await db.select().from(testTable);

	console.log("DATA:");
	console.log(data);
};

main();
