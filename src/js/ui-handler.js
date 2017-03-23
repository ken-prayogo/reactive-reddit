(function () {
    document.body.addEventListener(function (e) {
        if (e.target.nodeName.toUpperCase() === 'A' && e.target.href) {
            e.target.target = '_blank';
        }
    }, true);
})();
