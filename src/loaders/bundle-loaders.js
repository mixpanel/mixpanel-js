export function loadAsync (src, onload) {
    var scriptEl = document.createElement('script');
    scriptEl.type = 'text/javascript';
    scriptEl.async = true;
    scriptEl.onload = onload;
    scriptEl.src = src;
    document.head.appendChild(scriptEl);
}

export function loadNoop (_src, onload) {
    onload();
}
