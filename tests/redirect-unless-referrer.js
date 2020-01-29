(function() {
    var redirect = function(url) {
        if (/MSIE (\d+\.\d+);/.test (navigator.userAgent)) {
            var referLink = document.createElement ('a');
            referLink.href = url;
            document.body.appendChild (referLink);
            referLink.click ();
        } else {
            window.location = url;
        }
    };

    if (!document.referrer) {
        // force referrer for tests
        var qschar = window.location.href.indexOf('?') === -1 ? '?' : '&';
        redirect(window.location + qschar + "ref");
    }
}());
