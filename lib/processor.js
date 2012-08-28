/* This file is part of gegl-server
 * License: MIT, http://www.opensource.org/licenses/mit-license.html
 * Copyright 2012, Jon Nordby <jononor@gmail.com (http://jonnor.com)
 */

var spawn = require('child_process').spawn
var exec = require('child_process').exec
var fs = require('fs')

var gegl_executable = 'gegl'

function process_using_subprocess(xml_input, output_path, completion_callback) {

	// TODO: pass XML through stdin. Need to fix gegl, it currently fails option parsing when passing '-'
	// TODO: implement a --progress / -p option for gegl, and use this to report progress
	var gegl_process = spawn(gegl_executable, ['--xml', xml_input, '-o', output_path])
	var stderr = ''

	gegl_process.stdout.on('data', function (data) {
		console.log('stdout: ' + data);
	});

	gegl_process.stderr.on('data', function (data) {
		stderr += data
	});

	gegl_process.on('exit', function (code) {
		var err
		var result = output_path
		if (code != 0) {
			err = Error('gegl process failed: ' + stderr)
		}

		// Sanity check
		if (!err && !fs.existsSync(output_path)) {
			err = Error('gegl did not write output file')
		}
		completion_callback(result, err)
	});

	gegl_process.stdin.write(xml_input)
}

function check_subprocess_prerequisites() {

	child = exec(gegl_executable + ' --help',
		function (error, stdout, stderr) {
			if (error !== null) {
				throw error
			}
		});
}


function process_using_gir(xml_input, output_path, completion_callback)
{
	var gir = require('gir')
	var Gegl = gir.load('Gegl', '0.2')
	Gegl.init(0, [])

	var graph = Gegl.Node.new_from_xml(xml_input, '/')
	if (!graph) {
		var err = Error('Unable to parse XML')
		return completion_callback(output_path, err)
	}

	var save_node = graph.create_child('gegl:save')
	save_node.set_property('path', output_path)
	graph.link(save_node)
	console.log('attempt process()')
	save_node.process()
	console.log('process() done')

	var progress = 0
	var bbox = save_node.get_bounding_box()
	console.log(bbox.x, bbox.y, bbox.width, bbox.height)
	var processor = save_node.new_processor(bbox)
	console.log('created processor')

	var timer_id = setInterval(function () {

		var completed = !processor.work()
		if (completed) {
			clearInterval(timer_id)
			completion_callback(output_path, err)
		}
	}, 100)
}

function test_process() {
	process(fs.readFileSync('tmp.xml'), 'output.png', function(output_path, err) {
		if (err) {
			throw err
		} else {
			console.log("File written to " + output_path)
		}	
	})
}

// TODO: add processing implementation using GEGL via node-gir
check_subprocess_prerequisites();
exports.process = process_using_subprocess

exports.process = process_using_gir
