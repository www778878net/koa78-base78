'use strict';
//暂时不升ts5 太多JS文件了
//test.cjs
let debug=true;
const UpInfo = require('koa78-upinfo').default;
const restler = require('restler');
const Promise78 = require('promise78').default;
const { Buffer } = require('buffer');


if(debug)if(debug)console.log(Promise78); // 输出 Promise78 函数
if(debug)console.log(typeof Promise78); // 应该输出 function

const { expect } = require('chai');

describe("sql api get", () => {
  it('Api7822/TestMenu/testtb/get', async () => {
      function test() {
          let up = new UpInfo(null);
          up = UpInfo.getGuest()
          let data = {
              "sid": up.sid, "cid": up.cid, "uname": up.uname, "bcid": up.bcid
              , "mid": up.mid, "getstart": up.getstart, "getnumber": up.getnumber
              , "v":24
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
      if(debug)console.log(err)
     

      res = JSON.parse(res)
      if(debug)console.log( res)
      if(debug)console.log(res["back"])
      expect(err).to.be.null;
     
      expect(res["back"][0]["idpk"]).to.equal(1);
  });


});


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
        if(debug)console.log(err)
        if(debug)console.log(res)

        res = JSON.parse(res)
        if(debug)console.log(res["back"])
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
        if(debug)console.log(err)
        if(debug)console.log(res)

        res = JSON.parse(res)
        if(debug)console.log(res["back"])
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
        if(debug)console.log(err)
        if(debug)console.log(res)
        res = JSON.parse(res)

        if(debug)console.log(res["back"])
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
        if(debug)console.log(err)
        if(debug)console.log(res)
        res = JSON.parse(res)

        if(debug)console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"]).to.equal("8");
    });
});

describe("sql api m", () => {
    it('Api7822/TestMenu/testtb/m', async () => {
        let up = new UpInfo(null);
        up = UpInfo.getGuest()
        let newdata = UpInfo.getNewid();
        up.mid = "9009408d-6430-f43b-2b56-c94a453b7f4d"
        
        function test() {
            let pars = [newdata]

            let data = {
                "sid": up.sid, "cid": up.cid, "uname": up.uname, "bcid": up.bcid
                , "mid": up.mid
                ,"jsonbase64":true
                , "pars":  Buffer.from(JSON.stringify(pars)).toString("base64").replace('+', '*').replace('/', '-').replace('=', '.')
            };

            if(debug)console.log(data)
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
        if(debug)console.log(err)
        if(debug)console.log(res)

        res = JSON.parse(res)
        if(debug)console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"]).to.equal(up.mid);
    });


});



describe("test login", () => {
    it('test login', async () => {
        function test() {
            let up = new UpInfo(null);
            up = UpInfo.getGuest()
            let pars = ["guest3","084e0343a0486ff05530df6c705c8bb4"]

            let data = {
                "sid": up.sid, "cid": up.cid, "uname": up.uname, "bcid": up.bcid
                , "mid": up.mid
                , "v": 24
                , "pars": Buffer.from(JSON.stringify(pars))
            };

            return new Promise78((resolve, reject) => {
                restler.post("http://localhost:88/Api7822/ucenter/lovers/login", {  data:data })
                    .on('complete', function (back) {
                        resolve(back)
                    });
            })
        }
        let [err, res] = await test();
        if(debug)console.log(err)
        if(debug)console.log(res)

        res = JSON.parse(res)
        if(debug)console.log(res["back"])
        expect(err).to.be.null;

        expect(res["back"]["uname"]).to.equal("guest3");
    });
});

describe("test apiqq", () => {
    it('test loginweixin', async () => {
        function test() {
            let up = new UpInfo(null);
            up = UpInfo.getGuest()
            let pars = ["051pSF0w3XyOzZ2Kj80w3v7zjS2pSF0C"]

            let data = {
                "sid": up.sid, "cid": up.cid, "uname": up.uname, "bcid": up.bcid
                , "mid": up.mid
                
                , "pars": new Buffer(JSON.stringify(pars)) 
            };

            return new Promise78((resolve, reject) => {
                restler.post("http://localhost:88/Api7822/ucenter/lovers/loginWeixin", { data: data })
                    .on('complete', function (back) {
                        resolve(back)
                    });
            })
        }
        let [err, res] = await test();
        if(debug)console.log(err)
        if(debug)console.log(res)

        // res = JSON.parse(res)
        // if(debug)console.log(res["back"])
        expect(err).to.be.null;

        expect(res).to.equal("apifun not find:loginWeixin");
    });

})

describe("test upcheck", () => {
   it('test upcheck', async () => {
       function test() {
           let up = new UpInfo(null);
           up = UpInfo.getGuest();
           up.sid = "gagag";
           let pars = ["guest3", "084e0343a0486ff05530df6c705c8bb4"];

           let data = {
               "sid": up.sid, "cid": up.cid, "uname": up.uname, "bcid": up.bcid,
               "mid": up.mid,
               "v": 24,
               "pars": Buffer.from(JSON.stringify(pars))
           };

           return new Promise78((resolve, reject) => {
               restler.post("http://localhost:88/Api7822/TestMenu/Test78/testupcheck", { data: data })
                   .on('complete', function ( back) {
                       //if (debug) console.log(response);
                       if (debug) console.log(back);
                           resolve(back);
                      
                   })
                   .on('error', function (error) {
                       reject(error);
                   });
           })
       }

       try {
           let [err, res] = await test();
           if (debug) console.log(err);
           if (debug) console.log(res);

           let parsedRes;
           try {
               parsedRes = JSON.parse(res);
           } catch (parseError) {
               throw new Error(`Failed to parse response: ${parseError.message}`);
           }

           if (debug) console.log(parsedRes["back"]);
           expect(err).to.be.null;

           expect(parsedRes["errmsg"]).to.equal("guest sid err gagag");
       } catch (error) {
           console.error(error);
           throw error; // Rethrow the error for the test to fail
       }
   });
});