import { log } from 'console';
import { IQueryExecutor } from '../../interfaces';
import { Database } from 'bun:sqlite';

export default class BunSqliteExecutor implements IQueryExecutor {
	private sqlite: Database;

	constructor(pathToDb: string) {
		this.sqlite = new Database(pathToDb);
	}

	async migration({ queries }: { queries: string[] }) {
		this.sqlite.exec('BEGIN');
		try {
			for (const query of queries) {
				this.sqlite.exec(query);
			}

			this.sqlite.exec('COMMIT');
		} catch (e: any) {
			console.error(e);
			this.sqlite.exec('ROLLBACK');
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
			typeof param === 'object' ? Buffer.from(param) : param
		);

		const paramsToPass: Record<string, any> = {};

		const sqlSplittedByParams = sql.split(/\?/g);

		const sqlWithNamedParams = params.length
			? sqlSplittedByParams.reduce((acum, sqlPart, index) => {
					if (index !== sqlSplittedByParams.length - 1) {
						paramsToPass[`?${index + 1}`] = params[index];
					}

					return sqlPart
						? `${acum} ${sqlPart} ${
								index !== sqlSplittedByParams.length - 1
									? `?${index + 1}`
									: ''
						  }`
						: acum;
			  }, '')
			: sql;

		if (method === 'run') {
			try {
				const result = this.sqlite
					.prepare(sqlWithNamedParams)
					.run(paramsToPass);
				return result;
			} catch (e: any) {
				console.error(e);
				return { error: e.message };
			}
		} else if (method === 'all' || method === 'values') {
			try {
				const rows = this.sqlite
					.prepare(sqlWithNamedParams)
					.all(paramsToPass)
					.map((item: any) =>
						Object.values(item).map((val) =>
							val instanceof Uint8Array ? Buffer.from(val) : val
						)
					);
				return rows;
			} catch (e: any) {
				console.error(e);
				return { error: e.message };
			}
		} else if (method === 'get') {
			try {
				const row: any = this.sqlite
					.prepare(sqlWithNamedParams)
					.get(paramsToPass);

				return Object.values(row).map((val) =>
					val instanceof Uint8Array ? Buffer.from(val) : val
				);
			} catch (e: any) {
				console.error(e);
				return { error: e.message };
			}
		} else {
			return { error: 'Unkown method value' };
		}
	}
}
