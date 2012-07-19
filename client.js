#!/usr/bin/env node

/* This file is part of gegl-server
 * License: MIT, http://www.opensource.org/licenses/mit-license.html
 * Copyright 2012, Jon Nordby <jononor@gmail.com (http://jonnor.com)
 */

// gegl-client executable

function geglClientProcess(host, port, graphData, outputFile, fn) {

    var http = require('http'),
        querystring = require('querystring')

    var options = {
        host: host,
        port: port,
        path: '/process',
        method: 'POST'
    };

    function handleResponse(res) {
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            returnData += (chunk)
        })

        res.on('end', function () {
            fn(undefined, returnData)
        })
    }

    var requestData = querystring.stringify({graphData: graphData, outputFile: outputFile})
    var returnData = ''
    var req = http.request(options, handleResponse);

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(requestData);
    req.end();

    return returnData
}


function main(arguments) {

    var fs = require('fs'),
        spawn = require('child_process').spawn

    var parser = require('optimist')
                .usage('Usage: $0 URL [-i file] [-o file] [-x <xml ...>]')
                .options('i', {alias: 'file', describe: 'Read XML from named file'})
                .options('n', {alias: 'name', describe: 'Output filename'})
                .options('x', {alias: 'xml', describe: 'Read XML from next argument'})
                .options('o', {alias: 'open', describe: 'Open the file directly'})

    var argv = parser.parse(arguments)

    if (argv._.length == 3) {
        url = argv._[2]
        host = url.split(':')[0]
        port = url.split(':')[1]
    } else {
        parser.showHelp()
        process.exit(1)
    }

    var inStream = undefined
    var outputFileName = ''

    if (argv.file) {
        inStream = fs.createReadStream(argv.file)
    }
    else {
        inStream = process.stdin
    }

    if (argv.name) {
        outputFileName = argv.name
    }

    function onCompleted(error, outputUrl) {
        if (error)
            throw error

        if (argv.open) {
            spawn('xdg-open', [outputUrl])
        } else {
            console.log(outputUrl)
        }
    }

    var graphData = ''
    inStream.on('data', function (data) { graphData += (data) })
    inStream.on('end', function () {
        geglClientProcess(host, port, graphData, outputFileName, onCompleted)
    })

}

main(process.argv)
