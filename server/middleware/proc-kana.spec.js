'use strict';

const expect = require('chai').expect;
const procKana = require('./proc-kana');
const kana = require('../../kana');
const sinon = require('sinon');
const wagner = require('wagner-core');
const _ = require('lodash');

describe('middleware#proc-kana', function () {

    let procKana = null;
    let mocks = {};

    beforeEach(function () {
        wagner.clear();
        wagner.factory('kana', function () {
            return kana;
        });

        procKana = require('./proc-kana')(wagner);
    });

    beforeEach(function () {
        mocks.kana = kana.ichidan.ta.be.ru;

        mocks.req = {
            kana: mocks.kana.clone(),
            body: {
                grammar: null
            }
        };
    });

    it('should export function', function () {
        expect(typeof procKana).to.equal('function');
    });

    it('should pass result to req.result', function () {
        procKana(mocks.req, null, function (err) {
            expect(err).to.not.exist;
            expect(mocks.req.result).to.exist;
        });
    });

    it('should pass result as array', function () {
        procKana(mocks.req, null, function (err) {
            expect(err).to.not.exist;
            expect(mocks.req.result).to.exist;
            expect(Array.isArray(mocks.req.result)).to.be.true;
        });
    });

    it('should set set first item of req.result to original kana', function (done) {
        procKana(mocks.req, null, function (err) {
            expect(err).to.not.exist;
            expect(mocks.req.result.length).to.equal(1);

            let res = mocks.req.result[0];
            expect(_.isEqual(res.kana, mocks.kana.toArray()));
            expect(res.type).to.equal(mocks.kana.type);
            done();
        });
    });

    it('should conjugate kana for single grammar rule', function (done) {
        let test = mocks.kana.clone().applyRule('stem');
        mocks.req.body.grammar = 'stem';

        procKana(mocks.req, null, function (err) {
            expect(err).to.not.exist;

            let res = mocks.req.result;
            expect(res.length).to.equal(2);

            expect(_.isEqual(res[0].kana, mocks.kana.toArray())).to.be.true;
            expect(res[0].type).to.equal(mocks.kana.type);

            expect(_.isEqual(res[1].kana, test.toArray())).to.be.true;
            expect(res[1].type).to.equal(test.type);

            done();
        });
    });

    it('should conjugate kana for multiple grammar rules', function (done) {
        let test = mocks.kana.clone().applyRule('stem').applyRule('distal');
        mocks.req.body.grammar = ['stem', 'distal'];

        procKana(mocks.req, null, function (err) {
            expect(err).to.not.exist;
            expect(mocks.req.kana.equals(test)).to.be.true;
            done();
        });
    });

    it('should set error message for kana errors', function (done) {
        let msg = 'testerrormessage';
        let stub = sinon.stub().throws({message: msg});
        mocks.req.kana.applyRule = stub;
        mocks.req.body.grammar = 'stem';

        procKana(mocks.req, null, function (err) {
            expect(err).to.not.exist;

            let res = mocks.req.result;
            expect(res.length).to.equal(2);
            expect(stub.calledOnce).to.be.true;
            expect(res[1].error).to.exist;
            expect(res[1].error).to.equal(msg);
            done();
        });
    });

});