import { parse, registerCustom, stringify } from 'superjson';
import { IDeserializer, ISerializer } from '../../interfaces';

export class NodeSerializer implements ISerializer, IDeserializer {
    constructor() {
        registerCustom<Buffer, number[]>(
            {
              isApplicable: (v): v is Buffer => v instanceof Buffer,
              serialize: v => [...v],
              deserialize: v => Buffer.from(v)
            },
            "buffer"
          );
    }
	serialize<T>(data: T) {
		return stringify(data);
	}

	deserialize<T>(data: string): T {
		return parse(data);
	}
}
