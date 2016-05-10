/**
 * Created by Vlad on 5/9/2016.
 */
/**
 * Created by Vlad on 5/9/2016.
 */
///<reference path="../js/typings/node.d.ts"/>
var fs = require('fs-extra');
var util = require('util');
var settinngs = JSON.parse(fs.readFileSync('settings.json'));
var logger = fs.createWriteStream(__dirname + '/logger.log', { flags: 'a' }), err_log = fs.createWriteStream(__dirname + '/error.log', { flags: 'a' });
console.log = function (d) {
    logger.write(util.format(d) + '\n');
};
console.error = function (d) {
    err_log.write(util.format(d) + '\n');
};
var MoveFiles = (function () {
    function MoveFiles(options) {
        this.fs = fs;
        this.copiyed = [];
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
        console.log('files in source ' + ar.length);
        this.count = ar.length;
        ar.forEach(function (file) {
            if (_this.copiyed.indexOf(file) === -1)
                _this.copy(file);
            // console.log(this.copiyed.indexOf(file));
        });
    };
    MoveFiles.prototype.read = function () {
        var _this = this;
        this.onStart();
        var src = this.source;
        this.fs.readdir(src, function (err, list) {
            _this.listing = list;
            if (list.length)
                _this.onFiles();
            else
                console.log('no  files in directory ' + src);
        });
    };
    MoveFiles.prototype.onStart = function () {
        console.log(new Date().toLocaleString());
    };
    MoveFiles.prototype.onDone = function () {
        console.log('Done ' + new Date().toLocaleString());
    };
    MoveFiles.prototype.onMoved = function (err, dest) {
        this.count--;
        if (this.count == 0)
            this.onDone();
        if (err)
            console.error(err);
        else
            console.log('moved ' + dest);
    };
    MoveFiles.prototype.move = function (filename) {
        var _this = this;
        var dest = this.dest + '/' + filename;
        var src = this.source;
        var fs = this.fs;
        fs.exists(dest, function (exists) {
            if (exists) {
                fs.remove(dest, function (err) {
                    if (err) {
                        _this.count--;
                        console.error(' error remove file ' + dest);
                    }
                    else {
                        console.log('removed file ' + dest);
                        _this.move(filename);
                    }
                });
            }
            else
                _this.fs.move(src + '/' + filename, dest, function (err) { return _this.onMoved(err, dest); });
        });
    };
    MoveFiles.prototype.onCopy = function (err, filename) {
        if (err)
            console.error(err);
        else {
            console.log('copy done ' + filename);
            this.copiyed.push(filename);
        }
    };
    MoveFiles.prototype.copy = function (filename) {
        var _this = this;
        var dest = this.dest + '/' + filename;
        var src = this.source;
        var fs = this.fs;
        fs.exists(dest, function (exists) {
            if (exists)
                _this.copiyed.push(filename);
            else
                _this.fs.copy(src + '/' + filename, dest, function (err) { return _this.onCopy(err, filename); });
        });
    };
    return MoveFiles;
}());
var mover = new MoveFiles(settinngs);
mover.read();
mover.start();
//# sourceMappingURL=delivery.js.map