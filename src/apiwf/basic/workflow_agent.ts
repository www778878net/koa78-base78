import { CidBase78 } from '../../controllers/Base78';
import { ApiMethod } from '../../interfaces/decorators';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { TableSchemas } from '../../config/tableConfig';
import Elasticsearch78 from '../../services/elasticsearch78';
import dayjs from 'dayjs';

export default class workflow_agent extends CidBase78<TableSchemas['workflow_agent']> {

}