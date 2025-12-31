"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const agent_db_1 = require("./agent_db");
class Agent extends agent_db_1.AgentDB {
    constructor(json_data) {
        super(json_data);
    }
}
exports.Agent = Agent;
//# sourceMappingURL=agent.js.map