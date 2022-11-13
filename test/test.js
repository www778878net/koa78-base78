'use strict';
const expect = require('chai').expect;
const UpInfo = require('@www778878net/koa78-upinfo').default;
const restler = require('restler');
const Promise78 = require('@www778878net/promise78').default;

describe("test temp", () => {
    it('test temp', async () => {
        function test() {
            return new Promise78((resolve, reject) => {
                restler.get("http://localhost:88/Api7822/TestMenu/Test78/testcidmy", { data: { pars: ["test"] } })
                    .on('complete', function (back) {
                        resolve(back)
                    });
            })
        }
        let [err, res] = await test();
        console.log(err)
        console.log(res)

        res = JSON.parse(res)
        console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"]).to.equal("d4856531-e9d3-20f3-4c22-fe3c65fb009c");
    }); 
});



describe("no power api test", () => {
    it('TestMenu/Test78/getConfig78', async () => {
        function test() {
            return new Promise78((resolve, reject) => {
                restler.get("http://localhost:88/Api7822/TestMenu/Test78/getConfig78", { data: { pars: ["test"] } })
                    .on('complete', function (back) {
                        resolve(back)
                    });
            })
        }
        let [err, res] = await test();
        console.log(err)
        console.log(res)

        res = JSON.parse(res)
        console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"]).to.equal("不能公开config测试的时候用用");
    });

    it('TestMenu/Test78/test ', async () => {
        function test() {
            return new Promise78((resolve, reject) => {
                restler.get("http://localhost:88/Api7822/TestMenu/Test78/test", { data: { pars: ["test"] } })
                    .on('complete', function (back) {
                        resolve(back)
                    });
            })
        }
        let [err, res] = await test();
        console.log(err)
        console.log(res)
        res = JSON.parse(res)

        console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"]).to.equal("看到我说明路由ok,中文ok,无权限调用OK");
    });

    it('TestMenu/Test78/testredis ', async () => {
        function test() {
            return new Promise78((resolve, reject) => {
                restler.get("http://localhost:88/Api7822/TestMenu/Test78/testredis", { data: { pars: ["test"] } })
                    .on('complete', function (back) {
                        resolve(back)
                    });
            })
        }
        let [err, res] = await test();
        console.log(err)
        console.log(res)
        res = JSON.parse(res)

        console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"]).to.equal("8");
    });
});

describe("sql api m", () => {
    it('Api7822/TestMenu/testtb/m', async () => {
        let up = new UpInfo(null);
        up = up.getGuest()
        let newdata = up.getNewid();
        up.mid = "9009408d-6430-f43b-2b56-c94a453b7f4d"
        function test() {



            let pars = [newdata]

            let data = {
                "sid": up.sid, "cid": up.cid, "uname": up.uname, "bcid": up.bcid
                , "mid": up.mid
                , "v": 17.2
                , "pars": new Buffer(JSON.stringify(pars)).toString("base64").replace('+', '*').replace('/', '-').replace('=', '.')
            };

            console.log(data)
            return new Promise78((resolve, reject) => {
                restler.post("http://localhost:88/Api7822/TestMenu/testtb/m", {
                    data: data
                })
                    .on('complete', function (back) {
                        resolve(back)
                    });
            })
        }
        let [err, res] = await test();
        console.log(err)
        console.log(res)

        res = JSON.parse(res)
        console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"]).to.equal(up.mid);
    });


});

describe("sql api get", () => {
    it('Api7822/TestMenu/testtb/get', async () => {
        function test() {
            let up = new UpInfo(null);
            up = up.getGuest()
            let data = {
                "sid": up.sid, "cid": up.cid, "uname": up.uname, "bcid": up.bcid
                , "mid": up.mid, "getstart": up.getstart, "getnumber": up.getnumber
                , "v": 17.2
                //, "pars": new Buffer(JSON.stringify(pars)).toString("base64").replace('+', '*').replace('/', '-').replace('=', '.')
            };
            return new Promise78((resolve, reject) => {
                restler.post("http://localhost:88/Api7822/TestMenu/testtb/get", { data: data })
                    .on('complete', function (back) {
                        resolve(back)
                    });
            })
        }
        let [err, res] = await test();
        console.log(err)
        console.log(res)

        res = JSON.parse(res)
        console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"][0]["idpk"]).to.equal(1);
    });


});

describe("test login", () => {
    it('test login', async () => {
        function test() {
            let up = new UpInfo(null);
            up = up.getGuest()
            let pars = ["admin","e10adc3949ba59abbe56e057f20f883e"]

            let data = {
                "sid": up.sid, "cid": up.cid, "uname": up.uname, "bcid": up.bcid
                , "mid": up.mid
                , "v": 17.2
                , "pars": new Buffer(JSON.stringify(pars)).toString("base64").replace('+', '*').replace('/', '-').replace('=', '.')
            };

            return new Promise78((resolve, reject) => {
                restler.post("http://localhost:88/Api7822/ucenter/lovers/login", {  data:data })
                    .on('complete', function (back) {
                        resolve(back)
                    });
            })
        }
        let [err, res] = await test();
        console.log(err)
        console.log(res)

        res = JSON.parse(res)
        console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"]["uname"]).to.equal("admin");
    });
});

describe("test apiqq", () => {
    it('test loginweixin', async () => {
        function test() {
            let up = new UpInfo(null);
            up = up.getGuest()
            let pars = ["051pSF0w3XyOzZ2Kj80w3v7zjS2pSF0C"]

            let data = {
                "sid": up.sid, "cid": up.cid, "uname": up.uname, "bcid": up.bcid
                , "mid": up.mid
                , "v": 17.2
                , "pars": new Buffer(JSON.stringify(pars)).toString("base64").replace('+', '*').replace('/', '-').replace('=', '.')
            };

            return new Promise78((resolve, reject) => {
                restler.post("http://localhost:88/Api7822/ucenter/lovers/loginWeixin", { data: data })
                    .on('complete', function (back) {
                        resolve(back)
                    });
            })
        }
        let [err, res] = await test();
        console.log(err)
        console.log(res)

        res = JSON.parse(res)
        console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"]).to.equal("admin");
    });

})