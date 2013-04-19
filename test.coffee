#!/usr/bin/env coffee

js = require './test-js-from-coffee'

assert = require './index'

do ->
	line = 1
	for x in [1..100]
		line = x

thirdAt16 = (a, b) ->
	# Test that source maps work
	for x in [1..10]
		if true
			f.bar()

secondAt20 = ->
	x = 'blah'
	thirdAt16(1, 2)

firstAt24 = ->
	y = 'zot'
	secondAt20()

class Foo
	constructor: ->
		#		assert !"fail at ctor"

	bar: ->
		assert !"fail at a class"

f = new Foo()

x = ->
	js.g(firstAt24)

x()

