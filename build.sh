#!/bin/bash

if [ -z "$1" ]; then
    COMPILER=vendor/closure-compiler/compiler.jar
else
    COMPILER=$1
fi

java -jar $COMPILER --js mixpanel.js --js_output_file mixpanel.min.js --compilation_level ADVANCED_OPTIMIZATIONS --output_wrapper "(function() {
%output%
})();"

java -jar $COMPILER --js mixpanel-jslib-snippet.js --js_output_file mixpanel-jslib-snippet.min.js --compilation_level ADVANCED_OPTIMIZATIONS

java -jar $COMPILER --js mixpanel-jslib-snippet.js --js_output_file mixpanel-jslib-snippet.min.test.js --compilation_level ADVANCED_OPTIMIZATIONS --define='MIXPANEL_LIB_URL="../mixpanel.min.js"'
