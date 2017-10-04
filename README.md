# Spider for CasperJS

This script uses [casperJS](http://casperjs.org/) to crawl your site and log all urls, response codes, errors and warnings to a json file for parsing.

--------

### What casperjs-spider does

- Spiders whatever site you want it to
- Returns list of:
  - all links with response codes
  - all javascript errors from console
  - all ssl insecure warnings
  - all warning messages
- Does not repeat URLs
- Allows you to skip specified terms
- Allows you to require specified terms
- Exports a data.json file with your results

### Getting Started

Make sure you have [casperJS](http://casperjs.org/) and [phantomJS](http://phantomjs.org/) installed.


Configure the script by setting your config options in config.js or passing arguments in the command line.

In your terminal, navigate to the folder containing the spider.js file.

- Using config.js settings:

``` casperjs spider.js ```

- Configuring with arguments:

``` casperjs --start-url=http://example.com --required-values=example.com spider.js ```

*Casper arguments go in the middle, and they will override config options in the script.*

### Config Options

There are several configuration options in casperjs-spider.  You can set them individually in the command line, or by editing the config portion of [spider.js](https://github.com/pensive612/casperjs-spider/blob/master/spider.js).

*It might help to refer to the default config options in [config.js](https://github.com/pensive612/casperjs-spider/blob/master/config.js) for examples*

**start-url** *\*required*

- Also defined as config.startUrl in config.js.  This is the starting URL for your spider to crawl.
- ```--start-url=http://example.com```
- ```config.startUrl = 'http://example.com';```

**required-values** *\*required*

- Also defined as config.requiredValues in config.js.  This is a comma-separated list of all required strings.
- ```--required-values=example.com```
- ```config.requiredValues = 'example.com';```
- *Make sure you put your top-level domain in here to keep from spidering the internet!*
- Leave off the protocol so it will allow for subdomains if you have them.

**skipped-values**

- Also defined as config.skippedValues in config.js.  This is a comma-separated list of all skipped strings.
- *It might be helpful to skip URLs like mailto, install, forums, blogs etc...*
- ```--skipped-values=mailto,install,\#,blog/,comment```
- ```config.skippedValues = 'mailto,install,#,blog/,comment';```

**limit**

- Also defined as config.limit in config.js.  This is a numeric limit to the links logged.
- Enter 0, or omit for no limit.
- ```--limit=25```
- ```config.limit = 25```

**user-agent**

- Also defined as config.userAgent in config.js.  You can supply a custom userAgent string.
- Omit for default PhantomJS
- ```--user-agent="Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25"```
- ```config.userAgent = 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25'```

**file-location** *default=./logs/*

- Also defined as config.fileLocation in config.js.  This is a path to where you want the data.json file to be saved.
- ```--file-location=./logs/```
- ```config.fileLocation = './logs/';```

**date-file-name** *default=false*

- Also defined as config.dateFileName in config.js.  This is a boolean to replace the filename data.json with the current date.  ie.  2013-12-22.json.  In case you want to keep versions.
- ```--date-file-name=false```
- ```config.dateFileName = false;```

**verbose** *default=false*

- Also defined as config.verbose in config.js.  This is a boolean to put casper into verbose mode.
- ```--verbose=false```
- ```config.verbose = false;```

**log-level** *default=error*

- Also defined as config.logLevel in config.js.  SpiderJS allows you to set a logging level. can be [error, warning, info, debug]
- ```--log-level=error```
- ```config.logLevel = 'error';```

**load-images** *default=false*

- Also defined as config.loadImages in config.js.  SpiderJS allows you to disable images from loading in the crawler.  This speeds up the crawl, and is generally not necessary for output.
- ```--load-images=false```
- ```config.loadImages = 'false';```

**load-plugins** *default=false*

- Also defined as config.loadPlugins in config.js.  SpiderJS allows you to disable plugins from loading in the crawler.  This speeds up the crawl, and is generally not necessary for output.
- ```--load-plugins=false```
- ```config.loadPlugins = 'false';```

**cb** *default=null*

- You can add your own callback if you're using the config file.  Just uncomment the config.cb function in the config.js file.  Or add your own after.
- ```config.cb = function(data) {return data};```

### Contributing

Feel free to edit for yourself, or send a pull-request with any improvements.

**Any pull-requests should be pulled from master and sent to separate branch prefixed with incoming-.**

This script wouldn't be possible without [PlanZero](http://planzero.org/blog/2013/03/07/spidering_the_web_with_casperjs) whose script I started with in the very beginning.  I highly recommend still checking it out for a bare-bones version.
