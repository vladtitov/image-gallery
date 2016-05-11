/**
 * Created by Vlad on 5/5/2016.
 */
///<reference path="typings/jquery.d.ts"/>
var simple;
(function (simple) {
    var Gallery = (function () {
        function Gallery(options) {
            var _this = this;
            this.images = [];
            this.newImages = [];
            this.newImageCurrent = 0;
            this.stamp = 0;
            this.showtime = 10;
            this.serverdelay = 60;
            this.fullSceenCount = 1;
            this.imagesDelay = 1.5;
            this.current = -1;
            this.inset = -1;
            for (var str in options)
                this[str] = options[str];
            this.$view = $('#MyWindow');
            this.loadData().then(function () {
                _this.start();
                _this.showNextSet(150);
            });
            this.createDivs();
            this.serverTimer = setInterval(function () { return _this.loadNewImages(); }, this.serverdelay * 1000);
            this.$adds = $('<div>').addClass('fullscreen').html('<img src="data/EuroOptimum.jpg">');
            this.$overlay = $('#Overlay');
        }
        Gallery.prototype.loadData = function () {
            var _this = this;
            return $.get('service/get-pic.php').done(function (res) {
                _this.images = res.pics;
                console.log('old  images  ' + _this.images.length);
                if (_this.images.length) {
                    _this.stamp = Number(_this.images[0].filemtime);
                    console.log(_this.stamp);
                }
            }).fail(function (err) {
                setTimeout(function () { return _this.loadData(); }, 60000);
            });
        };
        Gallery.prototype.loadNewImages = function () {
            var _this = this;
            $.get('service/get-new-then.php', { stamp: this.stamp }).done(function (res) {
                var ar = res.pics;
                console.log(' new length ' + ar.length);
                if (ar.length) {
                    _this.stamp = ar[0].filemtime;
                    console.log(_this.stamp);
                    _this.newImages = _this.newImages.concat(ar);
                }
            }).fail(function (err) {
            });
        };
        Gallery.prototype.start = function () {
            if (this.isRunning)
                return;
            this.isRunning = true;
            // this.showTimer = setInterval(()=>this.showNextSet(this.imagesDelay*1000),this.showtime*1000);
        };
        Gallery.prototype.stop = function () {
            clearInterval(this.showTimer);
            this.isRunning = false;
        };
        Gallery.prototype.showFullScreen = function () {
            var _this = this;
            console.log('full screen');
            var next = this.getNext();
            var div = $('<div>').append($('<img>').attr('src', next.filename));
            var img = $('<div>').append(div).addClass('fullscreen in');
            img.appendTo(this.$overlay);
            setTimeout(function () {
                img.removeClass('in');
            }, 20);
            setTimeout(function () {
            }, 2000);
            setTimeout(function () {
                // img.fadeOut('fast',() =>{
                //  img.remove();
                //  this.start();
                // });
                _this.showAdda();
                setTimeout(function () {
                    img.remove();
                }, 2000);
            }, 8000);
        };
        Gallery.prototype.showAdda = function () {
            var _this = this;
            console.log('showing add');
            var adds = this.$adds.show().addClass('inr').appendTo(this.$overlay);
            setTimeout(function () {
                adds.removeClass('inr');
            }, 20);
            setTimeout(function () {
                adds.fadeOut('fast', function () {
                    adds.remove();
                    // this.start();
                    setTimeout(function () {
                        _this.showNextSet(700);
                    }, 500);
                });
            }, 10000);
        };
        Gallery.prototype.createDivs = function () {
            this.screenImages = [];
            for (var i = 0; i < 4; i++) {
                var div = $('<div>');
                this.screenImages.push(div);
                this.$view.append(div);
            }
        };
        Gallery.prototype.getNext = function () {
            var _this = this;
            if (this.newImages.length) {
                this.newImageCurrent++;
                if (this.newImageCurrent >= this.newImages.length) {
                    this.newImageCurrent = -1;
                    this.newImages = [];
                    console.log(' no more new iages ');
                }
                else {
                    console.log(' getting a new image ' + this.newImageCurrent);
                    return this.newImages[this.newImageCurrent];
                }
            }
            this.current++;
            if (this.current >= this.images.length) {
                this.current = 0;
                if (this.images.length > 20)
                    this.loadData();
                else
                    setTimeout(function () { return _this.loadData(); }, 20000);
            }
            return this.images[this.current];
        };
        Gallery.prototype.showNextSet = function (delay) {
            console.log('show next set ' + delay);
            this.inset = -1;
            // this.fullSceenCount --;
            // if(this.fullSceenCount<0){
            //  this.stop();
            // this.showFullScreen();
            // this.fullSceenCount = Math.floor(Math.random() * 7) + 3  ;
            //}
            // else
            this.switchNextImage(delay);
        };
        Gallery.prototype.onSetSown = function () {
            var _this = this;
            console.log('set sown');
            setTimeout(function () {
                _this.showFullScreen();
            }, 8000);
        };
        Gallery.prototype.switchNextImage = function (delay) {
            var _this = this;
            this.inset++;
            if (this.inset >= this.screenImages.length) {
                this.onSetSown();
                return;
            }
            var next = this.getNext();
            var newImage = $('<img>').attr('src', next.filename);
            //  console.log(this.inset);
            var div = this.screenImages[this.inset];
            var oldImage = div.children();
            oldImage.addClass('out');
            setTimeout(function () { oldImage.remove(); }, 1000);
            newImage.addClass('inn');
            setTimeout(function () { newImage.removeClass('inn'); }, 20);
            div.append(newImage);
            setTimeout(function () { return _this.switchNextImage(delay); }, delay);
        };
        return Gallery;
    }());
    simple.Gallery = Gallery;
})(simple || (simple = {}));
$(document).ready(function () {
    var options = {
        serverdelay: 40,
        showtime: 10,
        imagesDelay: 1.5 //delay between images swap
    };
    var gal = new simple.Gallery(options);
});
//# sourceMappingURL=ImageGalley.js.map