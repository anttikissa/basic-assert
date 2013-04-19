var assert = require('./index');

// To test combined JS + CoffeeScript stacktrace
function g(f) {
	for (var i = 0; i < 10; i++) {
		f();
	}
}

module.exports.g = g;

