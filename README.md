# Angular image cropper

## Live example

To see a live example, go to the [demo's page](http://bcabanes.github.io/angular-image-cropper/).


## Description

Angular image cropper is inspired of the popular Guillotine jQuery plugin
that allows to **drag**, **zoom** or **rotate** an image to select a cropping area.
Like selecting the display area of a profile picture or avatar.

* **Responsive:** The window (or selection area) is fully responsive (fluid).
* **Touch support:** Dragging the image also works on touch devices.

## Installation

#### Using [Bower](http://bower.io/)

```bash
bower install ng-image-cropper
```

## Usage

### Load the required files

```html
<!-- CSS -->
<link rel="stylesheet" type="text/css" href="/path/to/angular-image-cropper.min.css">

<!-- JS -->
<script src="/path/to/jquery.js"></script>
<script src="/path/to/angular.js"></script>
<script src="/path/to/angular-image-cropper.min.js"></script>
```



### Import the module into your app

Simply add the module as dependency to your main application module like this:

```javascript
angular.module('myapp', ['imageCropper']);
```

### The directive

```html
<image-cropper image="vm.imageUrl"
    dest-width="640"
    dest-height="480"
    show-controls="vm.showControls"
    cropped-image="vm.imageResult"
    auto-crop="true"
    auto-crop-delay="200"
    on-load="vm.onLoad"
></image-cropper>
```

## Options

Angular image cropper comes with some options to simplify your development:

* `image` _string_ Source image that will be cropped, can be an URL or base64
* `dest-width` _string_ width of the cropped image
* `dest-height` _string_ height of the cropped image
* `show-controls` _boolean_ Display or not the control buttons (`true` by default)
* `cropped-image` _boolean_ Your angular model that will receive the cropped image
* `auto-crop` _boolean_ Whether auto cropping is enabled or not. If not you have to manually call `api.crop` to initiate cropping (`true` by default)
* `auto-crop-delay` _int_ Number of ms to delay/debounce image cropping, improves performance on mobiles (`0` by default)
* `on-load` _function_ Invoked when image loads. Public api is passed to it to make it possible to develop custom controls

## Api

Object passed to on-load has these methods:

* zoomIn - Zooms in by provided zoomStep
* zoomOut -  Zooms out by provided zoomStep
* fit - fits and center the image
* center - centers the image 
* rotateLeft - shorthand to rotate(-90)
* rotateRight - shorthand to rotate(90)
* rotate - rotates image by specified number of degrees (must be deg%90===0)
* crop - crops image in current position and returns promise when its done

## License

The MIT License (MIT)

Copyright (c) 2015 Benjamin Cabanes

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
