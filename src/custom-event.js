// since es6 imports are static and we run unit tests from the console, window won't be defined when importing this file
var ce;

function NewCustomEvent() {}

if (typeof(CustomEvent) === 'undefined') {
    console.log('whats here bro')
    ce = NewCustomEvent;
} else {
    ce = CustomEvent;
}

export { ce as CustomEvent };
