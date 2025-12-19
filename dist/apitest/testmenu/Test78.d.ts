import Base78 from '../../controllers/Base78';
import { BaseSchema } from '../../controllers/BaseSchema';
export default class Test78 extends Base78<BaseSchema> {
    get colsImp(): string[];
    get uidcid(): string;
    test2(): Promise<string>;
    test(): Promise<string>;
}
