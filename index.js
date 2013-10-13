var path = require('path');

// Format values so that the type is evident
function fmt(value) {
	if (typeof value == 'string') {
		return "'" + value + "'";
	}

	return value;
}

function assert(value) {
	if (!value) {
		error('Got ' + fmt(value) + ',\nExpected:  a truthy value');
	}
}

assert.not = function(value) {
	if (value) {
		error('Got ' + fmt(value) + ',\nExpected:  a falsy value');
	}
};

assert.is = function(lhs, rhs) {
	if (lhs !== rhs) {
		error('Got ' + fmt(lhs) + ',\nExpected:  ' + fmt(rhs));
	}
};

assert.isnt = function(lhs, rhs) {
	if (lhs === rhs) {
		error('Got ' + fmt(lhs) + ',\nbut shouldn\'t have!');
	}
};

assert.eq = function(lhs, rhs) {
	var lhsS = JSON.stringify(lhs);
	var rhsS = JSON.stringify(rhs);
	if (lhsS !== rhsS) {
		error('Got ' + lhsS + ',\nExpected:  ' + rhsS);
	}
};

assert.neq = function(lhs, rhs) {
	var lhsS = JSON.stringify(lhs);
	var rhsS = JSON.stringify(rhs);
	if (lhsS === rhsS) {
		error('Got ' + lhsS + ',\nbut shouldn\'t have!');
	}
};

assert.type = function(lhs, expectedType) {
	var actualType = typeof lhs;
	if (actualType !== expectedType) {
		error('Type of ' + fmt(lhs) + ' was ' + actualType + ',\n' +
			'Expected type: ' + expectedType + '');
	}
};

assert.fatal = true;

function error(msg) {
	console.log("\nError: " + msg);

	var oldPrepareStackTrace = Error.prepareStackTrace;

	Error.prepareStackTrace = function(e, stackTrace) {
		return stackTrace;
	};
	var err = new Error();
	var callSite = err.stack[2];
	Error.prepareStackTrace = oldPrepareStackTrace;

	var filename = callSite.getFileName();
	var line = callSite.getLineNumber();
	var column = callSite.getColumnNumber();

	var lookupInSourceMap = function(filename, line, column) {
		mainModule = require.main;
		if (mainModule._sourceMaps && mainModule._sourceMaps[filename]) {
			var map = mainModule._sourceMaps[filename];
			var realPos = map.getSourcePosition([line - 1, column - 1]);
			if (!realPos)
				return [line, column];
			return [realPos[0] + 1, realPos[1] + 1];
		} else {
			return [line, column];
		}
	};

	var realPos = lookupInSourceMap(filename, line, column);
	line = realPos[0];
	column = realPos[1];

	var file = require('fs').readFileSync(filename, 'utf8');
	var relative = path.relative(process.cwd(), filename);

	console.log("\nFile: " + relative);
	console.log("Line: " + line);
	console.log("\n" + file.split('\n')[line-1].replace(/\t/g, ' '));
	console.log(Array(column).join(' ') + "^");
	err.stack.splice(0, 2);
	var mapped = err.stack.map(function(frame) {
		var fun = frame.getFunctionName() || '<anonymous>';
		var isConstructor = frame.isConstructor();
		var isMethodCall = !(frame.isToplevel() || isConstructor);
		if (isMethodCall) {
			// TODO steal from coffee-script.coffee in more detail
			/*
			var object = frame.getTypeName();
			if (object) {
				fun = object + "." + fun;
			} */
		}
		if (isConstructor) {
			fun = "new " + fun;
		}
		var filename = frame.getScriptNameOrSourceURL();
		var pos = lookupInSourceMap(
			filename, frame.getLineNumber(), frame.getColumnNumber());

		if (filename) {
			if (filename.match(/^\/usr/)) {
				// These are too long otherwise.
				filename = filename.replace('/usr/local/lib/node_modules/coffee-script/lib/coffee-script/',
						'[coffeescript internal] ');
			}
			else {
				filename = path.relative(process.cwd(), filename);
			}
		}
		return fun + " (" + filename + ":" + pos[0] + ":" + pos[1] + ")";
//		return frame.toString();
	});
	console.log("\n" + mapped.join('\n'));
	if (assert.fatal) {
		process.exit(1);
	}
}

module.exports = assert;

assert('string');
assert.is(1 + 2, 3);

