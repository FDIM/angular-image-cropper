(function(angular) {
    'use strict';

    angular
        .module('imageCropper')
        .directive('imageCropper', directive);

    directive.$inject = [
        'imageCropper',
        'imageCropperDefaultConfig',
        'imageCropperHelper',
        '$timeout',
        '$q'
    ];

    function directive(Cropper, defaultConfig, Helper, $timeout, $q) {
        return {
            'restrict': 'E',
            'scope': {
                'image': '=',
                'destWidth': '@',
                'destHeight': '@',
                'zoomStep': '@',
                'onLoad': '=',
                'croppedImage': '=',
                'showControls': '=',
                'fitOnInit': '=',
                'autoCrop':'=',
                'autoCropDelay': '='
            },
            'template': ['<div class="frame">',
                '<div class="imgCropper-window">',
                '<div class="imgCropper-canvas">',
                '<img ng-src="{{image}}">',
                '</div></div></div>',
                '<div class="controls" ng-if="showControls">',
                '<button ng-click="rotateLeft()" class="rotate-left" type="button" title="Rotate left"> &lt; </button>',
                '<button ng-click="zoomOut()" class="zoom-out" type="button" title="Zoom out"> - </button>',
                '<button ng-click="fit()" class="fit" type="button" title="Fit image"> [ ] </button>',
                '<button ng-click="zoomIn()" class="zoom-in" type="button" title="Zoom in"> + </button>',
                '<button ng-click="rotateRight()" class="rotate-right" type="button" title="Rotate right"> &gt; </button>',
                '</div>'].join(''),
            'link': link
        };

        function link(scope, element, attributes) {
            var gEnabled = false;

            var body = angular.element('body');

            var gImage = element.find('img');
            var gCanvas = element.find('.imgCropper-canvas');
            var gWindow = element.find('.imgCropper-window');
            var timeout;
            
            /**
             * Merge default with attributes given
             */
            var options = {};
            options.width = Number(scope.destWidth) || defaultConfig.width;
            options.height = Number(scope.destHeight) || defaultConfig.height;
            options.zoomStep = Number(scope.zoomStep) || defaultConfig.zoomStep;
            options.onLoad = scope.onLoad || defaultConfig.onLoad;
            options.fitOnInit = scope.fitOnInit || defaultConfig.fitOnInit;
            options.autoCrop = scope.autoCrop ? true : false;
            options.autoCropDelay = Number(scope.autoCropDelay) || defaultConfig.autoCropDelay;
            var zoomInFactor = 1 + options.zoomStep;
            var zoomOutFactor = 1 / zoomInFactor;

            var imgCopperRatio = options.height / options.width;

            var gWidth, gHeight, gLeft, gTop, gAngle;
            gWidth = gHeight = gLeft = gTop = gAngle = 0;

            var gData = {
                'scale': 1,
                'angle': 0,
                'x': 0,
                'y': 0,
                'w': options.width,
                'h': options.height
            };

            var events = {
                'start': 'touchstart mousedown',
                'move': 'touchmove mousemove',
                'stop': 'touchend mouseup'
            };

            var pointerPosition;
          
            // buttons
            scope.rotateLeft = rotateLeft;
            scope.rotateRight = rotateRight;
            scope.center = center;
            scope.fit = fitIn;
            scope.zoomIn = zoomIn;
            scope.zoomOut = zoomOut;
            // exposed via on-load callback
            var publicApi = {
              zoomIn: zoomIn,
              zoomOut: zoomOut,
              fit: fitIn,
              center: scope.center,
              rotateLeft: rotateLeft,
              rotateRight: rotateRight,
              rotate: rotate,
              crop: cropImage
            };
            
            // calls
            gImage[0].onload = onImageLoad;
          
            /**
             * -------------------
             */

            function setWrapper() {
                gWidth = gImage[0].naturalWidth / options.width;
                gHeight = gImage[0].naturalHeight / options.height;

                gCanvas.css({
                    'width': gWidth * 100 + '%',
                    'height': gHeight * 100 + '%',
                    'top': 0,
                    'left': 0
                });

                gWindow.css({
                    'width': '100%',
                    'height': 'auto',
                    'padding-top': (options.height / options.width * 100) + '%'
                });

                // Ready to process
                gEnabled = true;
            }

            // events
            function start(e) {
                if(!(gEnabled && Helper.validEvent(e))) {
                    return;
                }
                e.preventDefault();
                e.stopImmediatePropagation();
                pointerPosition = Helper.getPointerPosition(e);
                return bind();
            }

            function bind() {
                element.parent().addClass('imgCropper-dragging');
                body.on(events.move, drag);
                body.on(events.stop, unbind);
                return gCanvas;
            }

            function unbind(e) {
                element.parent().removeClass('imgCropper-dragging');
                body.off(events.move, drag);
                body.off(events.stop, unbind);
                return gCanvas;
            }

            function offset(left, top) {
                if(left || left === 0) {
                    if(left < 0) {
                        left = 0;
                    }

                    if(left > gWidth - 1) {
                        left = gWidth - 1;
                    }

                    gCanvas[0].style.left = (-left * 100).toFixed(2) + '%';
                    gLeft = left;
                    gData.x = Math.round(left * options.width);
                }

                if(top || top === 0) {
                    if(top < 0) {
                        top = 0;
                    }

                    if(top > gHeight - 1) {
                        top = gHeight - 1;
                    }

                    gCanvas[0].style.top = (-top * 100).toFixed(2) + '%';
                    gTop = top;
                    gData.y = Math.round(top * options.height);
                }
              
                if(options.autoCrop){
                  getCroppedImage();
                }
            }

            // actions
            function drag(e) {
                var dx, dy, left, p, top;
                e.preventDefault();
                e.stopImmediatePropagation();
                p = Helper.getPointerPosition(e);
                dx = p.x - pointerPosition.x;
                dy = p.y - pointerPosition.y;
                pointerPosition = p;
                left = dx === 0 ? null : gLeft - dx / gWindow[0].clientWidth;
                top = dy === 0 ? null : gTop - dy / gWindow[0].clientHeight;
                return offset(left, top);
            }

            function zoom(factor) {
                var h, left, top, w;
                if(factor <= 0 || factor === 1) {
                    return;
                }

                w = gWidth;
                h = gHeight;

                if(w * factor > 1 && h * factor > 1) {
                    gWidth *= factor;
                    gHeight *= factor;
                    gCanvas[0].style.width = (gWidth * 100).toFixed(2) + '%';
                    gCanvas[0].style.height = (gHeight * 100).toFixed(2) + '%';
                    gData.scale *= factor;
                }else{
                    fit();
                    factor = gWidth / w;
                }

                left = (gLeft + 0.5) * factor - 0.5;
                top = (gTop + 0.5) * factor - 0.5;
                return offset(left, top);
            }

            function fit() {
                var prevWidth, relativeRatio;

                prevWidth = gWidth;
                relativeRatio = gHeight / gWidth;

                if(relativeRatio > 1) {
                    gWidth = 1;
                    gHeight = relativeRatio;
                }else{
                    gWidth = 1 / relativeRatio;
                    gHeight = 1;
                }

                gCanvas[0].style.width = (gWidth * 100).toFixed(2) + '%';
                gCanvas[0].style.height = (gHeight * 100).toFixed(2) + '%';

                gData.scale *= gWidth / prevWidth;
                
                if (options.autoCrop) {
                  getCroppedImage();
                }
            }

            function center() {
                return offset((gWidth - 1) / 2, (gHeight - 1) / 2);
            }

            function rotate(angle) {
                var canvasRatio, h, w, _ref, _ref1, _ref2;

                if(!Helper.canTransform()) {
                    return;
                }

                if(!(angle !== 0 && angle % 90 === 0)) {
                    return;
                }

                gAngle = (gAngle + angle) % 360;

                if(gAngle < 0) {
                    gAngle = 360 + gAngle;
                }

                if(angle % 180 !== 0) {
                    _ref = [gHeight * imgCopperRatio, gWidth / imgCopperRatio];
                    gWidth = _ref[0];
                    gHeight = _ref[1];

                    if(gWidth >= 1 && gHeight >= 1) {
                        gCanvas[0].style.width = gWidth * 100 + '%';
                        gCanvas[0].style.height = gHeight * 100 + '%';
                    } else {
                        fit();
                    }
                }

                _ref1 = [1, 1];
                w = _ref1[0];
                h = _ref1[1];

                if(gAngle % 180 !== 0) {
                    canvasRatio = gHeight / gWidth * imgCopperRatio;
                    _ref2 = [canvasRatio, 1 / canvasRatio];
                    w = _ref2[0];
                    h = _ref2[1];
                }

                gImage[0].style.width = w * 100 + '%';
                gImage[0].style.height = h * 100 + '%';
                gImage[0].style.left = (1 - w) / 2 * 100 + '%';
                gImage[0].style.top = (1 - h) / 2 * 100 + '%';
                gImage.css({
                    'transform': "rotate(" + gAngle + "deg)"
                });

                center();

                gData.angle = gAngle;

                if (options.autoCrop) { 
                  getCroppedImage();
                }
            }

            function rotateLeft() {
                rotate(-90);
            }
            function rotateRight() {
                rotate(90);
            }
            function fitIn() {
                fit();
                center();
            }
            
            function zoomIn(){
                zoom(zoomInFactor);
            }
          
            function zoomOut() {
                zoom(zoomOutFactor);
            }
          
            function cropImage(){
                return Cropper
                  .crop(gImage[0], gData, options.width, options.height)
                  .then(function(data) {
                      scope.croppedImage = data;
                      return data;
                  });
            }
          
            function getCroppedImage(noDelay) {
                return $q(function(resolve, reject){
                  if (options.autoCropDelay>0 && !noDelay) {
                    if (timeout) {
                      $timeout.cancel(timeout);
                    }
                    timeout = $timeout(cropImage, options.autoCropDelay);
                    resolve(timeout);
                    } else {
                      resolve(cropImage());
                    }
                });
                
            }
            function onImageLoad(){
                var thisImage = gImage[0];
                setWrapper();
                hardwareAccelerate(gImage);
                if (thisImage.naturalWidth < options.width || thisImage.naturalHeight < options.height || options.fitOnInit){
                    fit();
                }
                center();
                element.find('img').on(events.start, start);
              
                if (options.autoCrop) {
                  getCroppedImage(true);
                }
                options.onLoad(publicApi);
            }
          
            function hardwareAccelerate(el) {
                return angular.element(el).css({
                    '-webkit-perspective': 1000,
                    'perspective': 1000,
                    '-webkit-backface-visibility': 'hidden',
                    'backface-visibility': 'hidden'
                });
            }
          
        }
    }
})(angular);
