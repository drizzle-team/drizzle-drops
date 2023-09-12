import { IQueryExecutor } from '../../interfaces';
import { D1Database } from '@cloudflare/workers-types';

export default class D1QueryExecutor implements IQueryExecutor {
	private sqlite: D1Database;

	constructor(db: D1Database) {
		this.sqlite = db;
	}

	async migration({ queries }: { queries: string[] }) {
		// await this.sqlite.exec('BEGIN');
		try {
			for (const query of queries) {
				await this.sqlite.exec(
					query
						.split(/\s/)
						.filter((elem) => elem)
						.join(' ')
				);
			}

			// await this.sqlite.exec('COMMIT');
		} catch (e: any) {
			console.error(e);
			// await this.sqlite.exec('ROLLBACK');
		}
	}
	async query({
		sql,
		reqParams,
		method,
	}: {
		sql: string;
		reqParams: string[];
		method: string;
	}) {
		const params = reqParams.map((param) =>
			typeof param === 'object' ? new Uint8Array(param).buffer : param
		);

		if (method === 'run') {
			try {
				const result = params.length
					? await this.sqlite
							.prepare(sql)
							.bind(...params)
							.run()
					: await this.sqlite.prepare(sql).run();
				return;
			} catch (e: any) {
				console.error(e);
				return { error: e.message };
			}
		} else if (method === 'all' || method === 'values') {
			try {
				const { results } = params.length
					? await this.sqlite
							.prepare(sql)
							.bind(...params)
							.all()
					: await this.sqlite.prepare(sql).all();

				return results.map((item) =>
					Object.values(item).map((val) =>
						Array.isArray(val) ? new Uint8Array(val).buffer : val
					)
				);
			} catch (e: any) {
				console.error(e);
				return { error: e.message };
			}
		} else if (method === 'get') {
			try {
				const row = params.length
					? await this.sqlite
							.prepare(sql)
							.bind(...params)
							.first()
					: await this.sqlite.prepare(sql).first();

				return row
					? Object.values(row).map((val) =>
							Array.isArray(val)
								? new Uint8Array(val).buffer
								: val
					  )
					: [];
			} catch (e: any) {
				console.error(e);
				return { error: e.message };
			}
		} else {
			return { error: 'Unkown method value' };
		}
	}
}
