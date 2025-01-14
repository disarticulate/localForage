/* global before:true, beforeEach:true, describe:true, expect:true, it:true, Modernizr:true */
var DRIVERS = [
    localforage.INDEXEDDB,
    localforage.LOCALSTORAGE,
    localforage.WEBSQL
];

DRIVERS.forEach(function(driverName) {
    if (
        (!localforage.supports(localforage.INDEXEDDB) &&
            driverName === localforage.INDEXEDDB) ||
        (!localforage.supports(localforage.LOCALSTORAGE) &&
            driverName === localforage.LOCALSTORAGE) ||
        (!localforage.supports(localforage.WEBSQL) &&
            driverName === localforage.WEBSQL)
    ) {
        // Browser doesn't support this storage library, so we exit the API
        // tests.
        return;
    }

    describe('Web Worker support in ' + driverName, function() {
        'use strict';

        before(function(done) {
            localforage.setDriver(driverName).then(done);
        });

        beforeEach(function(done) {
            localforage.clear(done);
        });

        if (!Modernizr.webworkers) {
            it.skip("doesn't have web worker support");
            return;
        }

        if (
            driverName === localforage.LOCALSTORAGE ||
            driverName === localforage.WEBSQL
        ) {
            it.skip(driverName + ' is not supported in web workers');
            return;
        }

        it('saves data', function(done) {
            var webWorker = new Worker('/test/webworker-client.js');

            webWorker.addEventListener('message', function(e) {
                var body = e.data.body;

                window.console.log(body);
                expect(body).to.be('I have been set');
                done();
            });

            webWorker.addEventListener('error', function(e) {
                window.console.log(e);
            });

            webWorker.postMessage({
                driver: driverName,
                value: 'I have been set'
            });
        });
        it('saves multiple data concurrently in workers', function() {
            var webWorker1 = new Worker('/test/webworker-client.js');
            var webWorker2 = new Worker('/test/webworker-client.js');
            var webWorker3 = new Worker('/test/webworker-client.js');
            var workers = [webWorker1, webWorker2, webWorker3];
            return Promise.all(
                workers.map(function(webWorker, index) {
                    var message = 'I have been set: ' + index;
                    var promise = new Promise(function(resolve, reject) {
                        webWorker.addEventListener('message', function(e) {
                            var body = e.data.body;

                            window.console.log(body);
                            expect(body).to.be(message);
                            resolve();
                        });

                        webWorker.addEventListener('error', function(e) {
                            window.console.log(e);
                            reject();
                        });

                        webWorker.postMessage({
                            driver: driverName,
                            value: message
                        });
                    });
                    return promise;
                })
            );
        });
        it('saves multiple data & databases concurrently in workers', function() {
            var webWorker1 = new Worker('/test/webworker-client.js');
            var webWorker2 = new Worker('/test/webworker-client.js');
            var webWorker3 = new Worker('/test/webworker-client.js');
            var workers = [webWorker1, webWorker2, webWorker3];
            return Promise.all(
                workers.map(function(webWorker, index) {
                    var store = 'test-' + index;
                    var message = 'I have been set: ' + index;
                    var promise = new Promise(function(resolve, reject) {
                        webWorker.addEventListener('message', function(e) {
                            var body = e.data.body;

                            window.console.log(body);
                            expect(body).to.be(message);
                            resolve();
                        });

                        webWorker.addEventListener('error', function(e) {
                            window.console.log(e);
                            reject();
                        });

                        webWorker.postMessage({
                            store,
                            driver: driverName,
                            value: message
                        });
                    });
                    return promise;
                })
            );
        });

        it('saves multiple data, single database, multiple stores, concurrently in workers', function() {
            var webWorker1 = new Worker('/test/webworker-client.js');
            var webWorker2 = new Worker('/test/webworker-client.js');
            var webWorker3 = new Worker('/test/webworker-client.js');
            var workers = [webWorker1, webWorker2, webWorker3];
            return Promise.all(
                workers.map(function(webWorker, index) {
                    var storeName = 'test-' + index;
                    var message = 'I have been set: ' + index;
                    var promise = new Promise(function(resolve, reject) {
                        webWorker.addEventListener('message', function(e) {
                            var body = e.data.body;

                            window.console.log(body);
                            expect(body).to.be(message);
                            resolve();
                        });

                        webWorker.addEventListener('error', function(e) {
                            window.console.log(e);
                            reject();
                        });

                        webWorker.postMessage({
                            storeName: storeName,
                            driver: driverName,
                            value: message
                        });
                    });
                    return promise;
                })
            );
        });
    });
});
