/**
 * Created by Vlad on 5/9/2016.
 */
/**
 * Created by Vlad on 5/9/2016.
 */
///<reference path="../js/typings/node.d.ts"/>
///<reference path="../js/typings/fs-extra.d.ts"/>
"use strict";
var fs = require('fs-extra');
var util = require('util');
var Jimp = require("jimp");
var settinngs = JSON.parse(fs.readFileSync('settings.json').toString());
var logger = fs.createWriteStream(__dirname + '/logger.log', { flags: 'a' }), err_log = fs.createWriteStream(__dirname + '/error.log', { flags: 'a' });
/*console.log = function(d) { //
    logger.write(util.format(d) + '\n');
};
console.error = function(d) { //
    err_log.write(util.format(d) + '\n');
};*/
var MoveFiles = (function () {
    function MoveFiles(options) {
        this.fs = fs;
        this.jimp = Jimp;
        this.copiyed = [];
        for (var str in options)
            this[str] = options[str];
    }
    MoveFiles.prototype.start = function () {
        // this.mytimer = setInterval(()=>this.read(), this.delay*1000);
    };
    MoveFiles.prototype.storp = function () {
        clearInterval(this.mytimer);
    };
    MoveFiles.prototype.copySource = function () {
        var _this = this;
        var src = this.source;
        var ar = this.sourceList;
        console.log('files in source ' + ar.length);
        this.count = ar.length;
        ar.forEach(function (file) {
            if (_this.copiyed.indexOf(file) === -1)
                _this.copy(file);
            // console.log(this.copiyed.indexOf(file));
        });
    };
    MoveFiles.prototype.readListings = function (onDone, onErr) {
        var _this = this;
        var folder = this.dest;
        this.fs.readdir(folder, function (err, list1) {
            if (err)
                onErr(err);
            else {
                folder = _this.source;
                _this.fs.readdir(folder, function (err, list2) {
                    if (err)
                        onErr(err);
                    else
                        onDone(list1, list2);
                });
            }
        });
    };
    MoveFiles.prototype.removeOldFiles = function () {
    };
    /* read():void {
         this.onStart();
         var src:string = this.source;
         this.fs.readdir(src,(err,list)=>{
             this.listing = list;
             if(list.length) this.onFiles();
             else console.log('no  files in directory '+src);
         })
 
     }
 */
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
//mover.read();
mover.start();
//# sourceMappingURL=delivery2.js.map