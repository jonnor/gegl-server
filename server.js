#!/usr/bin/env node

/* This file is part of gegl-server
 * License: MIT, http://www.opensource.org/licenses/mit-license.html
 * Copyright 2012, Jon Nordby <jononor@gmail.com (http://jonnor.com)
 */

// gegl-server executable

gegl_server = require('../gegl-server')

function main(arguments) {

    var fs = require('fs'),
        spawn = require('child_process').spawn

    var parser = require('optimist')
                .usage('Usage: $0 [--port port]')
                .options('p', {alias: 'port', default: 8000, describe: 'Port to start the server on'})

    var argv = parser.parse(arguments)

    if (argv._.length == 2) {

    } else {
        parser.showHelp()
        process.exit(1)
    }

    gegl_server.createServer(argv.port)
}

main(process.argv)
