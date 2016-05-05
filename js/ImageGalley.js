/**
 * Created by Vlad on 5/5/2016.
 */
///<reference path="typings/jquery.d.ts"/>
var simple;
(function (simple) {
    var Gallery = (function () {
        function Gallery(options) {
            this.showtime = 10;
            this.serverdelay = 10;
            this.imagesDelay = 1500;
            this.current = -1;
            this.inset = -1;
            this.$view = $('#MyWindow');
            this.loadData();
            this.createDivs();
        }
        Gallery.prototype.loadData = function () {
            var _this = this;
            $.get('service/get-pic.php').done(function (res) {
                var newImages = res.new_pic;
                var rand = res.random_pic;
                var all = res.new_pic.concat(rand);
                console.log(all);
                _this.images = all;
                _this.start();
            });
        };
        Gallery.prototype.start = function () {
            var _this = this;
            if (this.isRunning)
                return;
            this.isRunning = true;
            this.showNextSet(150);
            this.serverTimer = setInterval(function () { return _this.loadData(); }, this.serverdelay * 1000);
            this.serverTimer = setInterval(function () { return _this.showNextSet(_this.imagesDelay); }, this.showtime * 1000);
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
            this.current++;
            if (this.current >= this.images.length)
                this.current = 0;
            return this.images[this.current];
        };
        Gallery.prototype.showNextSet = function (delay) {
            console.log('show next set');
            this.inset = -1;
            // this.screenImages = this.$view.children();
            this.switchNextImage(delay);
        };
        Gallery.prototype.switchNextImage = function (delay) {
            var _this = this;
            this.inset++;
            if (this.inset >= this.screenImages.length)
                return;
            var next = this.getNext();
            var newImage = $('<img>').attr('src', next.filename);
            console.log(this.inset);
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
    var options = {};
    var gal = new simple.Gallery(options);
});
//# sourceMappingURL=ImageGalley.js.map