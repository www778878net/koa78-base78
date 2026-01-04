export declare const tableConfigs: {
    readonly sys_ip: {
        readonly colsImp: readonly ["ip"];
        readonly uidcid: "uid";
        readonly apiver: "apitest";
        readonly apisys: "testmenu";
    };
    readonly sqlitetest: {
        readonly colsImp: readonly ["field1", "field2"];
        readonly uidcid: "cid";
        readonly apiver: "apitest";
        readonly apisys: "testmenu";
    };
    readonly Test78: {
        readonly colsImp: readonly ["field1", "field2"];
        readonly uidcid: "cid";
        readonly apiver: "apitest";
        readonly apisys: "testmenu";
    };
    readonly testtb: {
        readonly colsImp: readonly ["kind", "item", "data"];
        readonly uidcid: "cid";
        readonly apiver: "apitest";
        readonly apisys: "testmenu";
    };
    readonly workflow_definition: {
        readonly colsImp: readonly ["apiv", "apisys", "apiobj", "wfname", "description", "version", "state", "starttask", "flowschema", "lastoktime", "lasterrinfo", "lastokinfo", "errsec", "totalcost", "totalrevenue", "totalprofit", "roi", "runcount", "successcount", "errorcount", "successrate", "executiontime"];
        readonly uidcid: "cid";
        readonly apiver: "apiwf";
        readonly apisys: "basic";
    };
    readonly workflow_instance: {
        readonly colsImp: readonly ["apiv", "apisys", "apiobj", "idworkflow", "state", "priority", "flowschema", "starttime", "endtime", "lastruntime", "lasterrortime", "lastoktime", "inputdata", "outputdata", "currenttask", "currenttaskindex", "runningstatus", "maxcopy", "currentcopy", "lasterrinfo", "lastokinfo", "errsec", "successcount", "runcount", "successrate", "errorcount", "actualcost", "actualrevenue", "actualprofit", "executiontime"];
        readonly uidcid: "cid";
        readonly apiver: "apiwf";
        readonly apisys: "basic";
    };
    readonly workflow_agent: {
        readonly colsImp: readonly ["apiv", "apisys", "apiobj", "agentname", "description", "maxcopy", "pricebase", "price", "costunit", "profittarget", "profittotal", "costtotal", "revenuetotal", "roi", "successcount", "runcount", "successrate", "errorcount", "state", "version", "errsec", "starttime", "endtime", "costdescription", "pricedescription"];
        readonly uidcid: "cid";
        readonly apiver: "apiwf";
        readonly apisys: "basic";
    };
    readonly workflow_task: {
        readonly colsImp: readonly ["apiv", "apisys", "apiobj", "idworkflowinstance", "idworkflowdefinition", "idtaskdefinition", "taskname", "handler", "idagent", "state", "priority", "inputdata", "outputdata", "runningstatus", "maxcopy", "currentcopy", "progress", "retrytimes", "retrylimit", "retryinterval", "maxruntime", "timeout", "dependencies", "prevtask", "nexttask", "resourcereq", "lasterrinfo", "lastokinfo", "errsec", "actualcost", "actualrevenue", "actualprofit", "executiontime", "starttime", "endtime", "lastruntime", "lasterrortime", "lastoktime", "successcount", "errorcount", "runcount"];
        readonly uidcid: "cid";
        readonly apiver: "apiwf";
        readonly apisys: "basic";
    };
    readonly workflow_handler: {
        readonly colsImp: readonly ["idagent", "capability", "apiv", "apisys", "apiobj", "idworkflow", "handler", "description", "state", "pricebase", "price", "costunit", "profittarget", "profittotal", "costtotal", "revenuetotal", "roi", "successcount", "runcount", "successrate", "costdescription", "pricedescription"];
        readonly uidcid: "cid";
        readonly apiver: "apiwf";
        readonly apisys: "basic";
    };
    readonly workflow_definition_task: {
        readonly colsImp: readonly ["apiv", "apisys", "apiobj", "idworkflowdefinition", "taskname", "handler", "description", "state", "tasktype", "priority", "maxcopy", "timeout", "retrylimit", "retryinterval", "errsec", "dependencies", "config", "lastoktime", "lasterrinfo", "lastokinfo", "totalcost", "totalrevenue", "totalprofit", "roi", "runcount", "successcount", "errorcount", "successrate", "executiontime"];
        readonly uidcid: "cid";
        readonly apiver: "apiwf";
        readonly apisys: "basic";
    };
};
