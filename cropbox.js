/**
 * Created by engine.
 */

"use strict";
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    var cropbox = function(options, el){
        var box = document.getElementById('imageBox');
        var hammerTime = new Hammer(box);
        hammerTime.get('pan').set({ direction: Hammer.DIRECTION_ALL,threshold: 0 });
        var pinch = new Hammer.Pinch({threshold: 0});
        hammerTime.add([pinch]);
        // IMPLEMENT ARRAY 0:TOUCH ZOOM,1: X AND,2: Y MEMORY 
        zoomMemory = [1,0,0];
        uploadRatio = 1;
        var el = el || $(options.imageBox),
            obj =
            {
                state : {},
                ratio : 1,
                options : options,
                imageBox : el,
                thumbBox : el.find(options.thumbBox),
                spinner : el.find(options.spinner),
                image : new Image(),
                zoomImage: function(e){
                    obj.ratio = uploadRatio * e;
                    setBackground();
                },
                initBackground: function(){
                    var maxWidth  = 200;
                    var maxHeight = 200;
                    var ratio = 0; 
                    // ENGINE ENFORCE ASPECT RATIO AND MIN IMAGE SIZE FOR OVER AND UNDERSIZED IMAGES
                    if (obj.image.width > obj.image.height){
                        if (parseInt(obj.image.width) > maxWidth || parseInt(obj.image.width) < maxWidth){
                            ratio = maxWidth / parseInt(obj.image.width);
                        	uploadRatio = ratio;
                        	zoomMemory[0] = ratio;
                            w = maxWidth;
                            h = parseInt(obj.image.height) * ratio;
                        }else{
                            w = parseInt(obj.image.width);
                            h = parseInt(obj.image.height);
                        }
                        if (parseInt(obj.image.height) > maxHeight || parseInt(obj.image.height) < maxHeight){
                            ratio = maxHeight / parseInt(obj.image.height);
                        	uploadRatio = ratio;
                        	zoomMemory[0] = ratio;
                            h = maxHeight;
                            w = parseInt(obj.image.width) * ratio;
                        }else{
                            w = parseInt(obj.image.width);
                            h = parseInt(obj.image.height);
                        }
                    }else{
                        if (parseInt(obj.image.height) > maxHeight || parseInt(obj.image.height) < maxHeight){
                            ratio = maxHeight / parseInt(obj.image.height);
                        	uploadRatio = ratio;
                        	zoomMemory[0] = ratio;
                            h = maxHeight;
                            w = parseInt(obj.image.width) * ratio;
                        }else{
                            w = parseInt(obj.image.width);
                            h = parseInt(obj.image.height);
                        }
                        if (parseInt(obj.image.width)*obj.ratio > maxWidth || parseInt(obj.image.width) < maxWidth){
                            ratio = maxWidth / parseInt(obj.image.width);
                        	uploadRatio = ratio;
                        	zoomMemory[0] = ratio;
                            w = maxWidth;
                            h = parseInt(obj.image.height) * ratio;
                        }else{
                            w = parseInt(obj.image.width);
                            h = parseInt(obj.image.height);
                        }
                    }

                    if (ratio > 1.4){
                        // $("#feedback").html("&nbsp;The image you have chosen is quite small and may distort.");
                        $("#feedback").html("");
                    }else if (ratio < .9  && ratio != 0){
                        $("#feedback").html("");
                    }else{
                        $("#feedback").html("Allowed file types: PNG/JPG.");

                    }
                    var pw = (el.width() - w) / 2;
                    var ph = (el.height() - h) / 2;

                    this.spinner.hide();

                    el.css({
                        'background-image': 'url(' + obj.image.src + ')',
                        'background-size': w +'px ' + h + 'px',
                        'background-position': pw + 'px ' + ph + 'px',
                        'background-repeat': 'no-repeat'});

                },
                getDataURL: function (){
                    var width = this.thumbBox.width(),
                        height = this.thumbBox.height(),
                        canvas = document.createElement("canvas"),
                        dim = el.css('background-position').split(' '),
                        size = el.css('background-size').split(' '),
                        dx = parseInt(dim[0]) - el.width()/2 + width/2,
                        dy = parseInt(dim[1]) - el.height()/2 + height/2,
                        dw = parseInt(size[0]),
                        dh = parseInt(size[1]),
                        sh = parseInt(this.image.height),
                        sw = parseInt(this.image.width);

                    canvas.width = width;
                    canvas.height = height;
                    var context = canvas.getContext("2d");
                    context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
                    var imageData = canvas.toDataURL('image/png');
                    return imageData;
                },
                getBlob: function(){
                    var imageData = this.getDataURL();
                    var b64 = imageData.replace('data:image/png;base64,','');
                    var binary = atob(b64);
                    var array = [];
                    for (var i = 0; i < binary.length; i++) {
                        array.push(binary.charCodeAt(i));
                    }
                    return  new Blob([new Uint8Array(array)], {type: 'image/png'});
                },
                zoomIn: function (){
                    this.ratio*=1.1;
                    setBackground();
                },
                zoomOut: function (){
                    this.ratio*=0.9;
                    setBackground();
                }
            },
            // WILL CENTER THE IMAGE
            setBackground = function(){
                var w =  parseInt(obj.image.width)*obj.ratio;
                var h =  parseInt(obj.image.height)*obj.ratio;

                var pw = (el.width() - w) / 2;
                var ph = (el.height() - h) / 2;

                el.css({
                    'background-image': 'url(' + obj.image.src + ')',
                    'background-size': w +'px ' + h + 'px',
                    'background-position': pw + 'px ' + ph + 'px',
                    'background-repeat': 'no-repeat'});
            },
            imgMouseDown = function(e){
                e.stopImmediatePropagation();
                obj.state.dragable = true;
                obj.state.mouseX = e.clientX;
                obj.state.mouseY = e.clientY;
            },
            imgMouseMove = function(e){
                e.stopImmediatePropagation();

                if (obj.state.dragable){
                    var   x = e.clientX - obj.state.mouseX;
                    var   y = e.clientY - obj.state.mouseY;
                    var bgp = el.css('background-position').split(' ');
                    var bgs = el.css('background-size').split(' ');
                    var bgX = x + parseInt(bgp[0]);
                    var bgY = y + parseInt(bgp[1]);
                    // ENGINE ENFORCE BOX BORDERS
                    if (bgX > 100){
                        bgX = 100;
                    }
                    if (bgY > 100){
                        bgY = 100;
                    }
                    if (bgX < 299 - parseInt(bgs[0])){
                        bgX = 299 - parseInt(bgs[0]);
                    }
                    if (bgY < 299 - parseInt(bgs[1])){
                        bgY = 299 - parseInt(bgs[1]);
                    }
                    el.css('background-position', bgX +'px ' + bgY + 'px');

                    obj.state.mouseX = e.clientX;
                    obj.state.mouseY = e.clientY;
                }
            },
            imgTouchMove = function(e){
                var   x = e.deltaX - obj.state.mouseX;
                var   y = e.deltaY - obj.state.mouseY;
                var bgp = el.css('background-position').split(' ');
                var bgs = el.css('background-size').split(' ');
                var bgX = x + parseInt(bgp[0]);
                var bgY = y + parseInt(bgp[1]);
                // ENGINE ENFORCE BOX BORDERS
                if (bgX > 100){
                    bgX = 100;
                }
                if (bgY > 100){
                    bgY = 100;
                }
                if (bgX < 299 - parseInt(bgs[0])){
                    bgX = 299 - parseInt(bgs[0]);
                }
                if (bgY < 299 - parseInt(bgs[1])){
                    bgY = 299 - parseInt(bgs[1]);
                }
                el.css('background-position', bgX +'px ' + bgY + 'px');

                obj.state.mouseX = e.deltaX;
                obj.state.mouseY = e.deltaY;
            },
            imgMouseUp = function(e){
                e.stopImmediatePropagation();
                obj.state.dragable = false;
            },
            zoomImage = function(e){
                e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 ? obj.ratio*=1.1 : obj.ratio*=0.9;
                setBackground();
            },
            // IGNORE GHOST CLICKS
            last = 0;
            touchZoomImage = function(e){
            	if (e.scale != last){
                    obj.ratio = Math.max(e.scale * zoomMemory[0], uploadRatio);
                    last = e.scale;
                    setBackground();
                }
            }
        obj.spinner.show();
        obj.image.onload = function() {
            obj.initBackground();
            el.bind('mousedown', imgMouseDown);
            el.bind('mousemove', imgMouseMove);
            $(window).bind('mouseup', imgMouseUp);
            // MOUSEWHEEL ZOOM
            // el.bind('mousewheel DOMMouseScroll', zoomImage);
            hammerTime.on("pinch", function(ev) {
                touchZoomImage(ev);
            });
            hammerTime.on("pinchend", function(ev) {
                zoomMemory[0]  = obj.ratio;
            });
            hammerTime.on("panmove", function(ev){
                imgTouchMove(ev);
            });
            hammerTime.on("panend", function(ev){
                obj.state.mouseX = 1;
                obj.state.mouseY = 1;
            });
        };
        obj.image.src = options.imgSrc;
        el.on('remove', function(){$(window).unbind('mouseup', imgMouseUp)});
        return obj;
    };
    jQuery.fn.cropbox = function(options){
        return new cropbox(options, this);
    };
}));

