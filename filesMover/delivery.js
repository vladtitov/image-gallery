/**
 * Created by Vlad on 5/9/2016.
 */
///<reference path="../js/typings/node.d.ts"/>
var fs = require('fs-extra');
var settinngs = JSON.parse(fs.readFileSync('settings.json'));
console.log(settinngs);
var MoveFiles = (function () {
    function MoveFiles(options) {
        this.fs = fs;
        for (var str in options)
            this[str] = options[str];
    }
    MoveFiles.prototype.start = function () {
        var _this = this;
        this.mytimer = setInterval(function () { return _this.read(); }, this.delay * 1000);
    };
    MoveFiles.prototype.storp = function () {
        clearInterval(this.mytimer);
    };
    MoveFiles.prototype.onFiles = function () {
        var _this = this;
        var src = this.source;
        var ar = this.listing;
        console.log('before moving ' + ar.length);
        ar.forEach(function (file) { return _this.move(file); });
    };
    MoveFiles.prototype.read = function () {
        var _this = this;
        var src = this.source;
        this.fs.readdir(src, function (err, list) {
            _this.listing = list;
            if (list.length)
                _this.onFiles();
            else
                console.log('no  files in directory ' + src);
        });
    };
    MoveFiles.prototype.onMoved = function (err, dest) {
        console.log('moved ' + dest);
        if (err)
            console.log(err);
    };
    MoveFiles.prototype.move = function (filename) {
        var _this = this;
        var dest = this.dest;
        var src = this.source;
        this.fs.move(src + '/' + filename, dest + '/' + filename, function (err) { return _this.onMoved(err, dest + '/' + filename); });
    };
    return MoveFiles;
}());
var mmover = new MoveFiles(settinngs);
mmover.read();
//# sourceMappingURL=delivery.js.map