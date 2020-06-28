const mongooose = require('mongoose');
const chai = require('chai')
const chaiHttp= require('chai-http');
const server = require('../index');
const valid=require('../validation');
let expect= chai.expect;



describe('Function test- Validation',()=>{
    it('Input Test1', function () {
        expect(valid.validate(1,5)).to.equal(true)
     })
    it('Input Test2', function () {
        expect(valid.validate(15,57)).to.equal(true)
     })
    it('Wrong input test1', function () {
        expect(valid.validate(100,91)).to.equal(false)
     })
    it('Wrong input test2', function () {
        expect(valid.validate('a','e')).to.equal(false)
     })

});
chai.use(chaiHttp);
describe('/Post Correct input values status-200',()=>{
    it('test1', function () {
        chai.request(server)
            .post('/')
            .type('form')
            .send({
                'start': '4',
                'end': '5'
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
             });
     });

     it('test2', function () {
        chai.request(server)
            .post('/')
            .type('form')
            .send({
                'start': '41',
                'end': '1055'
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
             });
     });

     it('test3', function () {
        chai.request(server)
            .post('/')
            .type('form')
            .send({
                'start': '4',
                'end': '5'
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
             });
     });
});

describe('/Post wrong input values status-400',()=>{
    it('test4', function () {
        chai.request(server)
            .post('/')
            .type('form')
            .send({
                'start': '14',
                'end': '5'
            })
            .end(function (err, res) {
                expect(res).to.have.status(400);
             });
     });

     it('test5', function () {
        chai.request(server)
            .post('/')
            .type('form')
            .send({
                'start': '1b',
                'end': '15'
            })
            .end(function (err, res) {
                expect(res).to.have.status(400);
             });
     });

     it('test6', function () {
        chai.request(server)
            .post('/')
            .type('form')
            .send({
                'start': '14',
                'end': '5'
            })
            .end(function (err, res) {
                expect(res).to.have.status(400);
             });
     });
});

