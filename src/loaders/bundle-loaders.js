// For loading separate bundles asynchronously via script tag
// so that we don't load them until they are needed at runtime.
export function loadAsync (src, onload) {
    var scriptEl = document.createElement('script');
    scriptEl.type = 'text/javascript';
    scriptEl.async = true;
    scriptEl.onload = onload;
    scriptEl.src = src;
    document.head.appendChild(scriptEl);
}

// For builds that have everything in one bundle, no extra work.
export function loadNoop (_src, onload) {
    onload();
}

// For builds that do NOT want any extra bundles (e.g. session recorder)
// and just the main SDK, throw an error when trying to load a separate bundle.
// eslint-disable-next-line no-unused-vars
export function loadThrowError (src, _onload) {
    throw new Error('This build of Mixpanel only includes core SDK functionality, could not load ' + src);
}
