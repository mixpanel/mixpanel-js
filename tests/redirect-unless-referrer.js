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
        redirect (window.location + "?ref");
    }
}());
