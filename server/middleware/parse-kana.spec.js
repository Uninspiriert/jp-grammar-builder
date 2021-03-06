'use strict';

const expect = require('chai').expect;
const kana = require('../../kana');
const sinon = require('sinon');
const wagner = require('wagner-core');

describe('middleware#parse-kana', function () {

    let parseKana = null;
    let mocks = {};

    beforeEach(function () {
        wagner.clear();
        wagner.factory('kana', function () {
            return kana;
        });
        wagner.factory('logger', function () {
            return {
                debug: function () {}
            };
        });

        parseKana = require('./parse-kana')(wagner);
    });

    beforeEach(function () {
        mocks.req = {
            body: {
                kana: ['ta','be','ru'],
                type: 'ichidan'
            }
        };
    });

    it('should export function', function () {
        expect(typeof parseKana).to.equal('function');
    });

    it('should create req.kana from req.body', function (done) {
        let test = kana.create(mocks.req.body.kana, mocks.req.body.type);

        parseKana(mocks.req, null, function (err) {
            expect(err).to.not.exist;
            expect(mocks.req.kana).to.exist;
            expect(mocks.req.kana.equals(test)).to.be.true;
            done();
        });
    });

    it('should forward Kana errors', function (done) {
        let msg = 'randomerrormessage';
        let stub = sinon.stub().throws({
            msg: msg
        });

        wagner.clear();
        wagner.factory('kana', function () {
            return {
                create: stub
            };
        });
        wagner.factory('logger', function () {
            return {
                debug: function () {}
            };
        });
        parseKana = require('./parse-kana')(wagner);

        parseKana(mocks.req, null, function (err) {
            expect(err).to.exist;
            expect(err.msg).to.equal(msg);
            expect(stub.calledOnce).to.be.true;
            done();
        });
    });

});