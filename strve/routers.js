"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
var co = require('co');
const router = new Router();
const Util = require('util');
router.all('/:apiv/:msys/:apiobj/:apifun', co.wrap(function* (ctx, next) {
    const apiv = ctx.params.apiv;
    const msys = ctx.params.msys;
    const apiobj = ctx.params.apiobj;
    const apifun = ctx.params.apifun;
    var checkmes = "";
    if (apifun.indexOf('_') === 0) {
        checkmes = 'cannot read private fun';
    }
    if (msys.indexOf('dll') === 0) {
        checkmes = 'cannot read private msys';
    }
    if (checkmes !== "") {
        ctx.body = checkmes;
        return;
    }
    try {
        const Base78 = require('./' + apiv + '/' + msys + '/' + apiobj);
        var base78 = new Base78.default(ctx);
        ctx.body = yield base78.out(apifun);
    }
    catch (e) {
        //这里不可能出错 前面截取了 
        console.log("router cannot in this-" + Util.inspect(e));
        ctx.body =
            {
                res: -996,
                back: e,
                errmsg: "routes err",
                kind: "json"
            };
    }
}));
exports.default = router;
//# sourceMappingURL=routers.js.map