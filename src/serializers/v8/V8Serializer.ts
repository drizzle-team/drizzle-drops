import { parse, registerCustom, stringify } from 'superjson';
import { IDeserializer, ISerializer } from '../../interfaces';


export class V8Serializer implements ISerializer, IDeserializer {
    constructor() {
        registerCustom<ArrayBuffer, number[]>(
            {
              isApplicable: (v): v is ArrayBuffer => v instanceof ArrayBuffer,
              serialize: v => {
                // console.log([...new Uint8Array(v)])
                return [...new Uint8Array(v)]},
              deserialize: v => new Uint8Array([...v]).buffer as ArrayBuffer
            },
            "buffer"
          );
    }
	serialize<T>(data: T) {
    console.log(stringify(data))
		return stringify(data);
	}

	deserialize<T>(data: string): T {
		return parse(data);
	}
}
