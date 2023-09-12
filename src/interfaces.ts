export interface IDeliverer<T> {
	pipe(data: string, destination: T): void;
}

export interface ISerializer {
	serialize<T>(data: T): string;
}

export interface IDeserializer {
	deserialize<T>(data: string): T;
}

export interface IQueryExecutor {
	migration(options: { queries: string[] }): Promise<void>;
	query(options: {
		sql: string;
		reqParams: string[];
		method: string;
	}): Promise<void | any[][] | any[] | { error: string }>;
}
