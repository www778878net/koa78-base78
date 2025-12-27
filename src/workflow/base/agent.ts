import { AgentDB } from './agent_db';

export class Agent extends AgentDB {


    constructor(json_data?: Record<string, any>) {
        super(json_data);
    }

}