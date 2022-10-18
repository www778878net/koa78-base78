'use strict';
const UpInfo = require('@www778878net/koa78-upinfo').default;
const expect = require('chai').expect;

describe("guid", () => {
    it('guid ', async () => {
   
        let up = new UpInfo(null);
       
        let newid = up.getNewid()   
        expect(newid.length).to.equal(36); 
    });  
});