import BetterSqlite3 from 'better-sqlite3';
import { IQueryExecutor } from '../../interfaces';

export default class BetterSqlite3Executor implements IQueryExecutor {
	private sqlite: BetterSqlite3.Database;

	constructor(pathToDb: string) {
		this.sqlite = new BetterSqlite3(pathToDb);
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
	}) : Promise<any | any[] | {error?: string}> {
		const params = reqParams.map((param) =>
			typeof param === 'object' ? Buffer.from(param) : param
		);

		if (method === 'run') {
			try {
				const result = this.sqlite.prepare(sql).run(params);
				return;
			} catch (e: any) {
				console.error(e);
				return { error: e.message };
			}
		} else if (method === 'all' || method === 'values') {
			try {
				const rows = this.sqlite.prepare(sql).raw().all(params);
				return rows;
			} catch (e: any) {
				console.error(e);
				return { error: e.message };
			}
		} else if (method === 'get') {
			try {
				const row = this.sqlite.prepare(sql).raw().get(params);
				return row;
			} catch (e: any) {
				console.error(e);
				return { error: e.message };
			}
		} else {
			return { error: 'Unkown method value' };
		}
	}
}
