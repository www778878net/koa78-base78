//index.js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
//import Config78 from "./Config78";
const routers_1 = require("./routers");
const app = new Koa();

var iconv = require('iconv-lite');
var fs = require('fs');
console.log(process.argv)
var fspath = "";// = process.argv[3]
for (var i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == "config") {
        fspath = process.argv[i + 1]
        break;
    }
}
var Config78 = loadjson(fspath);
function loadjson(filepath) {
    var data;
    try {
        var jsondata = iconv.decode(fs.readFileSync(filepath), "utf8");
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
const { koaBody } = require('koa-body');

console.log("Config78.location");

// 使用 koa-body
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024
  },
  onError: (err, ctx) => {
    console.log('koa-body error:', err);
    ctx.throw(422, 'body parse error');
  }
}));

// 添加错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      message: err.message
    };
    ctx.app.emit('error', err, ctx);
  }
});

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