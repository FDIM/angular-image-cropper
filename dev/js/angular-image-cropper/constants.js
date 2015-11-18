(function(angular) {
    'use strict';

    angular
        .module('imageCropper')
        .constant('defaultConfig', {
            'width': 400,
            'height': 300,
            'zoomStep': 0.1,
            'onLoad': angular.noop,
            'showControls': true,
            'fitOnInit': false,
            'croppingDelay':0
    });

})(angular);
