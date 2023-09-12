import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const testTable = sqliteTable('test', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	json: blob('json', {mode: 'json'}).$type<{
		num: number;
		str: string;
		arr: any[];
		obj: object;
	}>().notNull(),
    str: text('str').notNull(),
    num: integer('num').notNull()
});
