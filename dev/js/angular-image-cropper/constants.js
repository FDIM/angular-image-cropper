(function(angular) {
    'use strict';

    angular
        .module('imageCropper')
        .constant('imageCropperDefaultConfig', {
            'width': 400,
            'height': 300,
            'zoomStep': 0.1,
            'onLoad': angular.noop,
            'showControls': true,
            'fitOnInit': false,
            'autoCrop':true,
            'autoCropDelay':0
    });

})(angular);
