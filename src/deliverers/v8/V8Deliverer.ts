import { IDeliverer } from "../../interfaces";
import { WritableStream } from "@cloudflare/workers-types";

const encoder = new TextEncoder()
export class V8Deliverer implements IDeliverer<TransformStream['writable']> {
	pipe(data: string, destination: TransformStream['writable']) {

		let writer = destination.getWriter()
		
		writer.write(encoder.encode(data))
		
		writer.close()

	}	
}
