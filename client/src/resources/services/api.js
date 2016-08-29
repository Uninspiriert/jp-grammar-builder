import {noView, inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {ErrorService} from './error';

@noView
@inject(ErrorService)
export class ApiService {
    constructor(ErrorService) {
        this.http = new HttpClient();
        this.ErrorService = ErrorService;
    }


    /**
     * Query conjugations from backend
     *
     * @param {string[]} kana - array of chars
     * @param {string} type - grammatical type of kana
     * @param {string[]} grammar - array of consecutive rules to apply to kana
     * @returns {Object} promise that resolves to array of rule / result pairs
     */
    grammarQuery(kana, type, grammar) {
        let query = {
            kana: kana,
            type: type,
            grammar: grammar
        };

        this.ErrorService.clear();

        return this.http.post('/api/kana', query)
            .catch(error => {
                if (error.statusCode === 400) {
                    return new Promise(function (resolve, reject) {
                        resolve(error);
                    });
                } else {
                    this.ErrorService.message = error.response;
                    this.ErrorService.code = error.statusCode;
                    return new Promise(function (resolve, reject) {
                        reject(new Error(error.response));
                    });
                }
            })
            .then(data => {
                return new Promise(function (resolve, reject) {
                    resolve(JSON.parse(data.response));
                });
            });
    }
}

