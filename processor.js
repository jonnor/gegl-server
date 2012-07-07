
var spawn = require('child_process').spawn
var fs = require('fs')

function process_using_subprocess(xml_input, output_path, completion_callback) {

	// TODO: pass XML through stdin. Need to fix gegl, it currently fails option parsing when passing '-'
	// TODO: implement a --progress / -p option for gegl, and use this to report progress
	var gegl_process = spawn('gegl', ['--xml', xml_input, '-o', output_path])
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
exports.process = process_using_subprocess
