'use strict';
const UpInfo = require('@www778878net/koa78-upinfo').default;
const expect = require('chai').expect;
const test = require('../dist/index')
console.log(test)
describe("guid", () => {
    it('guid ', async () => {
   
        let up = new UpInfo(null);
       
        let newid = up.getNewid()   
        expect(newid.length).to.equal(36); 
    });  
});