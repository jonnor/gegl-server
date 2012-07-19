var vows = require('vows'),
    APIeasy = require('api-easy'),
    assert = require('assert'),
    http = require('http'),
    spawn = require('child_process').spawn

var gegl_server = require('../../gegl-server')

var hostName = 'localhost'
var port = 8876
var exampleGraph = require("fs").readFileSync('tests/data/example.xml', 'utf8')

// Instantiate server
gegl_server.createServer(port)

// Create a Test Suite
var suite = APIeasy.describe('HTTP Server Processing')

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

suite.discuss('When using the processing API')
    .use(hostName, port)
    .setHeader('Content-Type', 'application/json')
    .discuss('and not passing any arguments')
    .post('/process', {})
        .expect(400)

    .undiscuss()
    .discuss('and passing invalid graph data')
    .post('/process', {graphData: 'invalid graph'})
        .expect(400)

    .undiscuss()
    .discuss('and not specifying output filename')
    .post('/process', {graphData: exampleGraph})
        .expect(200)
        .expect('the URL is automatically generated, defaulting to PNG', function (err, res, body) {
            endsWith(body, '.png')
        })
        // TODO: verify file type and content

    .undiscuss()
    .discuss('and specifying output filename')
    .post('/process', {graphData: exampleGraph, outputFilename: 'myfilesupercool.png'})
        .expect(200)
        .expect('the URL ends with specified filename', function (err, res, body) {
            endsWith(body, 'myfilesupercool.png')
        })
        // TODO: verify file type and content

    .undiscuss()
    .discuss('and specifying a JPG file')
    .post('/process', {graphData: exampleGraph, outputFilename: 'another.jpg'})
        .expect(200)
        .expect('the URL ends with specified filename', function (err, res, body) {
            endsWith(body, 'another.jpg')
        })
        // TODO: verify file type and content

.export(module)
