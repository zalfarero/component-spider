/*
 * casperjs-spider v 0.6.1
 * https://github.com/seethroughtrees/casperjs-spider
 *
 * Copyright (c) 2014 @seethroughtrees
 * Licensed under the MIT license.
 *
 * script inspired and borrowed from: PlanZero, Yaffle, CasperJS, MDN
 * http://planzero.org/blog/2013/03/07/spidering_the_web_with_casperjs
 */


(function (window, document, undefined) {
        'use strict';

        var utils = require('utils'),
            helpers = require('./helpers'),
            fs = require('fs'),
            config = require('./config'),
            data = require('./data.json'),
            views = data.view;



        // ##################  WORKING CODE  #################

        // Create Casper
        var casper = require('casper').create({
            verbose: config.verbose,
            logLevel: config.logLevel,
            viewportSize: {
                width: 1024
            },
            pageSettings: {
                loadImages: config.loadImages,
                loadPlugins: config.loadPlugins
            }
        });

        // Echo options hash to screen
        if (config.logLevel != 'error') {
            utils.dump(casper.cli.options);
        }

        // ##################  Initializing Vars  #################

        // URL arrays
        var visitedUrls = [],
            pendingUrls = [],
            skippedUrls = [];
        var times = [];
        var visitedResourceUrls = [];

        // required and skipped values
        var requiredValues = casper.cli.get('required-values') || config.requiredValues,
            skippedValues = casper.cli.get('skipped-values') || config.skippedValues,
            linkLimit = casper.cli.get('limit') || config.limit;


        // setting hard value for linkLimit so it doesn't go on forever
        if (linkLimit === 0) {
            linkLimit = 10000;
        }


        // look for a command line cookie and then for a cookie in the config
        var cookie = false;

        if (typeof casper.cli.get('cookie') === 'string') {
            try {
                cookie = JSON.parse(cookie);
            } catch (e) {
                casper.die('User defined cookie is not valid JSON.');
            }
        } else if (casper.cli.get('cookie') === true) {
            cookie = config.cookie_data;
        }

        // Initializing Data Object
        var dataObj = {
            start: casper.cli.get('start-url') || config.startUrl,
            date: new Date(),
            dateFileName: casper.cli.get('date-file-name') || config.dateFileName,
            requiredValues: helpers.prepareArr(requiredValues),
            skippedValues: helpers.prepareArr(skippedValues),
            cookie: cookie,
            links: [],
            errors: [],
            times: [],
            messages: [],
            skippedLinksCount: 0,
            logFile: '',
            linkCount: 1,
            userAgent: casper.cli.get('user-agent') || config.userAgent
        };


        // ##################  Spider Function  #################

        var spider = function (url) {

            // Add the URL to visited stack
            visitedUrls.push(url);

            // Add cookie
            if (dataObj.cookie) {
                casper.page.addCookie(dataObj.cookie);
            }

            // add userAgent if supplied
            if (typeof dataObj.userAgent !== 'undefined') {
                casper.userAgent(dataObj.userAgent);
            }

            // Open the URL and modify
            casper.open(url).then(function () {

                // ##################  Setup Link Data  #################

                // Get current response status of URL
                var status = this.status().currentHTTPStatus;


                function strEndsWith(str, suffix) {
                    return str.match(suffix + "$") == suffix;
                }
                // Log url
                //        
                //      if(status >= 400) {
                //          this.echo("* " + this.colorizer.format(status, helpers.statusColor(status)) + ' ' + url);
                //      } else {
                //          this.echo("  " + this.colorizer.format(status, helpers.statusColor(status)) + ' ' + url);
                //      }


                var itemUrl = url;
                var componentSelectors = ['#ttt-items', 'iframe', '.blog-post', '#fishingSearch', '.video-content', '.video-gallery'];
                //            var componentSelectors = ['#ttt-items'];
                if (strEndsWith(itemUrl, '.html')) {
                    var n = itemUrl.split("/");
                    var siteName = n[2];
                    var folderName = n[n.length - 1].split(".")[0];
                    var filename;
                    casper.each(componentSelectors, function (casper, item) {
                        if (casper.exists(item)) {
                            casper.viewport(1080, 1000);
                            //                this.echo(this.getHTML('#ttt-items',true));
                            this.echo('found ' + item + ' in ' + itemUrl);
                            filename = './' + siteName + '/' + folderName + '/' + item + '.txt';
                            fs.write(filename, this.getHTML(item, true), 'w');

                            casper.each(views, function (casper, viewport) {
                                this.then(function () {
                                    this.viewport(viewport.size, 1000);
                                });
                                this.thenOpen(itemUrl, function () {
                                    this.wait(2000);
                                });
                                this.then(function () {
                                    this.echo('Screenshot for ' + item + ' ' + itemUrl + ' ' + viewport.name + ' (' + viewport.size + ')', 'info');
                                    this.capture('./' + siteName + '/' + folderName + '/' + item + '-' + viewport.name + '-' + viewport.size + '.png');
                                    this.page.close();
                                });
                            });

                        }
                    });

                    // Instantiate link object for log
                    var link = {
                        url: url,
                        status: status,
                    };


                    // Push links to dataObj
                    dataObj.links.push(link);

                }
                // ##################  Process Links on Page  #################

                var baseUrl = this.getGlobal('location').origin;

                // Find links on the current page
                var localLinks = this.evaluate(function () {
                    var links = [];

                    __utils__.findAll('a[href]').forEach(function (e) {
                        function strEndsWith(str, suffix) {
                    return str.match(suffix + "$") == suffix;
                }
                        var test = e.getAttribute('href');
                        if (strEndsWith(test, '.html')) {
                            links.push(test);
                        }
                        //                    this.log(test);
                        //                    test.each(function (item) {
                        //                        this.log(item);
                        //                        if (strEndsWith(item, '.html'))
                        //                            links.push(item);
                        //
                        //                        //                    links.push(e.getAttribute('href'));

//                    });
                    //                    links.push(e.getAttribute('href'));

                });
                return links;
            });

            // iterate through each localLink
            this.each(localLinks, function (self, link) {

                // if url contains text
                var containsText = function (element, index, array) {
                    return (newUrl.indexOf(array[index]) >= 0);
                };



                // Get new url
                var newUrl = helpers.absoluteUri(baseUrl, link);

                // If url is not visited, pending or skipped:
                if (pendingUrls.indexOf(newUrl) === -1 &&
                    visitedUrls.indexOf(newUrl) === -1 &&
                    skippedUrls.indexOf(newUrl) === -1) {



                    // if newUrl is not does not contain skipped, and does have required
                    if (!dataObj.skippedValues.some(containsText) &&
                        dataObj.requiredValues.every(containsText) && strEndsWith(newUrl, '.html')) {

                        pendingUrls.push(newUrl);

                    } else {

                        // add it to skipped array
                        skippedUrls.push(newUrl);

                        casper.log('Skipping ' + newUrl, 'debug');

                        // add to counted skipped links
                        dataObj.skippedLinksCount++;

                        return;
                    }
                } // eof visited, pending, skipped
            }); // eof each links

            // If there are any more URLs, run again.
            if (pendingUrls.length > 0 && dataObj.linkCount < linkLimit) {
                var nextUrl = pendingUrls.shift();
                dataObj.linkCount++;
                spider(nextUrl);
            } else {
                casper.log('There are no more URLs to be processed!', 'Warning');
            }
        }); // eof page function
}; // eof spider function


// Start Spidering!
casper.start(dataObj.start, function () {
    this.log('Starting to spider ' + dataObj.start, 'info');
    spider(dataObj.start);
});

casper.run(function () {

});

// if console error exists
casper.on('page.error', function (msg, trace) {
            var error = {
                msg: msg,
                file: trace[0].file,
                line: trace[0].line,
                func: trace[0]['function']
            };
//          Commenting out error logs
    //
        this.echo('* ERROR: ' + error.msg, 'error');
        this.echo('    file: ' + error.file, 'warning');
        this.echo('    line: ' + error.line, 'warning');
        this.echo('    function: ' + error.func, 'warning');

    //    dataObj.errors.push(error);
});

// if console message exists
casper.on('remote.message', function (msg) {
    this.log('MESSAGE: ' + msg, 'WARNING');
    var message = {
        url: casper.getGlobal('location').href,
        msg: msg
    };
    dataObj.messages.push(message);
});

// stop crawl if there's an internal error
casper.on('error', function (msg, backtrace) {
    this.log('INTERNAL ERROR: ' + msg, 'ERROR');
    this.log('BACKTRACE:' + backtrace, 'WARNING');
    this.die('Crawl stopped because of errors.');
});

// Find the longuest request
casper.on('resource.requested', function (resource) {
    //        times[resource.id] = {
    //            start: new Date().getTime(),
    //            url: resource.url
    //        };
});
casper.on('resource.received', function (resource) {
    if (resource.stage == 'end') {
        times[resource.id].time = new Date().getTime() - times[resource.id].start;
        times[resource.id].status = resource.status;
        dataObj.times.push(times[resource.id]);
        if (visitedUrls.indexOf(resource.url) == -1 && visitedResourceUrls.indexOf(resource.url) == -1) {
            visitedResourceUrls.push(resource.url);

            //                            commenting out visitedResourceUrls
            if (resource.status >= 400) {
                casper.echo("* " + this.colorizer.format(resource.status, helpers.statusColor(resource.status)) + ' ' + resource.url);
            } else {
                casper.echo("  " + this.colorizer.format(resource.status, helpers.statusColor(resource.status)) + ' ' + resource.url);
            }
        }
    }
});

// after crawl is complete, write json file with results
casper.on('run.complete', function () {
var fileLocation = casper.cli.get('file-location') || config.fileLocation;
var filename;

// set filename for logging
if (dataObj.dateFileName) {
    filename = helpers.getFilename(fileLocation) + '-data.json';
} else {
    filename = fileLocation + 'data.json';
}

dataObj.logFile = filename;

var data = JSON.stringify(dataObj, undefined, 2);

// write json file
fs.write(filename, data, 'w');

if (typeof config.cb === 'function') {
    config.cb(data);
}

// Find the longest request.
var longest = times.sort(function (reqa, reqb) {
    return reqb.time - reqa.time;
})[0];
this.echo('', 'INFO');
this.echo(utils.format('Longest request: %s (%s) with %dms', longest.url, longest.status, longest.time), 'INFO');
this.echo('', 'INFO');

this.echo('Crawl has completed!', 'INFO');
this.echo('Data file can be found at ' + filename + '.', 'INFO');
});

})(this, this.document);
