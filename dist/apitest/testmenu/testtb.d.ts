import { CidBase78 } from '../../controllers/Base78';
import { TableSchemas } from '../../config/tableConfig';
export default class testtb extends CidBase78<TableSchemas['testtb']> {
    health(): Promise<string>;
    test_nojson(): Promise<string>;
    customMethod(): Promise<string>;
    get(): Promise<any>;
    m(): Promise<string>;
    testProto(): Promise<Uint8Array | null>;
}
