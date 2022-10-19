"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
//import Config78 from "./Config78";
const routers_1 = require("./routers");
const app = new Koa();
var iconv = require('iconv-lite');
var fs = require('fs');
//console.log(process.argv)
var fspath = process.argv[3];
var Config78 = loadjson(fspath);
function loadjson(filepath) {
    var data;
    try {
        var jsondata = iconv.decode(fs.readFileSync(filepath, "binary"), "utf8");
        data = JSON.parse(jsondata);
    }
    catch (err) {
        console.log(err);
    }
    return data;
}
//console.log(Config78)
let port = 88;
const convert = require('koa-convert');
console.log("Config78.location");
switch (Config78.location) {
    case "qq":
        console.log("koa-bodyparser");
        //腾迅云用上面那个PYTHON就报错 BadRequestError: invalid urlencoded received
        const bodyParser = require("koa-bodyparser");
        app.use(bodyParser({ multipart: true }));
        break;
    default:
        console.log("use koa-better-body");
        //阿里云用这个OK
        const body = require('koa-better-body');
        app.use(convert(body()));
        break;
}
app.use(convert(routers_1.default.routes()));
app.on('error', function (err, ctx) {
    //这里增加错误日志
    console.log(ctx.request);
    console.log(err);
});
app.listen(port, () => {
    console.log('listen  OK' + port);
});
//# sourceMappingURL=index.js.map