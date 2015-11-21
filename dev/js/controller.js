(function(angular) {
    'use strict';

    angular
        .module('app')
        .controller('mainController', controller);

    controller.$inject = [
        '$scope'
    ];

    function controller($scope) {
        /* jshint validthis: true */
        var vm = this;

        vm.imageUrl = 'test.jpg';
        vm.imageResult = '';
        vm.showControls = true;
        vm.fit = false;
        vm.api = {};
        vm.onLoad = function(api){
          vm.api = api;
          console.info(api);
        }
    }

})(angular);
