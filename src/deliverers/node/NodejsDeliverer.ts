import { Readable } from "stream";
import { IDeliverer } from "../../interfaces";

export class NodejsDeliverer implements IDeliverer<NodeJS.WritableStream> {
	pipe<T extends NodeJS.WritableStream>(data: string, destination: T) {
		const responseStream = new Readable();

		responseStream.push(data);
		responseStream.push(null);

		responseStream.pipe(destination);
	}
}
