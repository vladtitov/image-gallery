/**
 * Created by Vlad on 5/9/2016.
 */
/**
 * Created by Vlad on 5/9/2016.
 */
///<reference path="../js/typings/node.d.ts"/>
///<reference path="../js/typings/fs-extra.d.ts"/>
///<reference path="../js/typings/underscore.d.ts"/>
"use strict";
var fs = require('fs-extra');
var _ = require('underscore');
var path = require('path');
var util = require('util');
var Jimp = require("jimp");
var logger = fs.createWriteStream(__dirname + '/logger.log', { flags: 'a' }), err_log = fs.createWriteStream(__dirname + '/error.log', { flags: 'a' });
/*
console.log  = function(d) {
    logger.write(util.format(d) + '\n');
};

console.error = function (d) {
    err_log.write(util.format(d) + '\n');

}*/
var FileCopyer = (function () {
    function FileCopyer(fs) {
        this.fs = fs;
        this.sizeOf = require('image-size');
    }
    FileCopyer.prototype.onDone = function () {
        console.log('ImageProcessor  done');
    };
    FileCopyer.prototype.onError = function (err) {
        console.error(err);
    };
    FileCopyer.prototype.copy = function (files) {
        this.files = files;
        this.errorFiles = [];
        this.successFiles = [];
        this.doNext();
    };
    FileCopyer.prototype.onFileCopied = function (file) {
        this.successFiles.push(file);
    };
    FileCopyer.prototype.doNext = function () {
        var _this = this;
        if (this.files.length) {
            var next = this.files.pop();
            var ext = path.extname(next).toLowerCase();
            if (ext === '.jpg' || ext === '.png') {
                //  console.log(this.srcDir + '/' + next);
                this.sizeOf(this.srcDir + '/' + next, function (err, dim) {
                    // console.log(err);
                    if ((dim.width + dim.height) < 8000) {
                        _this.copyFile(_this.srcDir, _this.destDir, next);
                    }
                    else {
                        _this.onErrorCopy(' too big size  ' + next + 'width+heihgt ' + (dim.width + dim.height) + ' where max 8000 ', next);
                        _this.doNext();
                    }
                    // this.copyFile(this.srcDir,this.destDir,next);
                });
            }
            else {
                this.onErrorCopy(' wrong file type ' + next, next);
                this.doNext();
            }
        }
        else
            this.onDone();
    };
    FileCopyer.prototype.onErrorCopy = function (err, file) {
        this.errorFiles.push(file);
        this.onError(err);
    };
    FileCopyer.prototype.copyFile = function (src, dest, file) {
        var _this = this;
        src = src + '/' + file;
        dest = dest + '/' + file;
        this.fs.copy(src, dest, function (err) {
            if (err)
                _this.onErrorCopy(err, file);
            else
                _this.onFileCopied(file);
            _this.doNext();
        });
    };
    return FileCopyer;
}());
var ImageProcessor = (function () {
    function ImageProcessor(jimp) {
        this.jimp = jimp;
        this.path = path;
    }
    ImageProcessor.prototype.onDone = function () {
        console.log('ImageProcessor  done');
    };
    ImageProcessor.prototype.onError = function (err) {
        console.error(err);
    };
    ImageProcessor.prototype.process = function (list) {
        this.files = list;
        this.successFiles = [];
        this.errorFiles = [];
        this.doNext();
    };
    ImageProcessor.prototype.onSuccessProcess = function (file) {
        this.successFiles.push(file);
    };
    ImageProcessor.prototype.doNext = function () {
        if (this.files.length) {
            var next = this.files.pop();
            console.log('processing: ' + next + ' left ' + this.files.length);
            this.processFile(this.srcDir, this.destDir, next);
        }
        else
            this.onDone();
    };
    ImageProcessor.prototype.onErrorProcess = function (err, file) {
        this.errorFiles.push(file);
        this.onError(err);
    };
    ImageProcessor.prototype.processFile = function (src, dest, file) {
        var _this = this;
        src = src + '/' + file;
        dest = dest + '/' + file;
        this.jimp.read(src).then(function (lenna) {
            lenna
                .resize(1920, 1280)
                .quality(80)
                .write(dest);
            _this.onSuccessProcess(file);
            setTimeout(function () { return _this.doNext(); }, 1200);
        }).catch(function (err) {
            _this.onError(err);
            _this.onErrorProcess(err, file);
        });
    };
    return ImageProcessor;
}());
var settinngs = JSON.parse(fs.readFileSync('settings.json').toString());
var copyer = new FileCopyer(fs);
copyer.destDir = settinngs.raw;
copyer.srcDir = settinngs.source;
//var mover:MoveFiles = new MoveFiles(settinngs);
var imageProcessor = new ImageProcessor(Jimp);
imageProcessor.srcDir = settinngs.raw;
imageProcessor.destDir = settinngs.dest;
imageProcessor.onDone = function () {
    console.log(' process  success: ' + imageProcessor.successFiles.length + ' errors: ' + imageProcessor.errorFiles.length);
    fs.readdir(settinngs.raw, function (err, list) {
        if (err)
            console.error(err);
        else
            removeFiles(settinngs.raw, list);
    });
    onProcessDone();
};
var onProcessDone = function () {
    console.log(new Date().toLocaleString() + ' done next in' + settinngs.delay);
    clearTimeout(mytimer);
    mytimer = setTimeout(function () { return startProcess(); }, settinngs.delay * 1000);
};
copyer.onDone = function () {
    var ar = copyer.successFiles;
    console.log(' copy  success: ' + copyer.successFiles.length + ' errors: ' + copyer.errorFiles.length);
    imageProcessor.process(ar);
};
var mytimer;
var removeFiles = function (dir, files) {
    files.forEach(function (file) {
        var _this = this;
        file = dir + '/' + file;
        //Log'removing '+file);
        fs.remove(file, function (err) {
            if (err)
                _this.onError(err);
        });
    });
};
var compareLists = function (listDest, listSource) {
    var extra_files = _.difference(listDest, listSource);
    var new_files = _.difference(listSource, listDest);
    if (extra_files.length) {
        console.log('removing extra ' + extra_files.toString());
        removeFiles(settinngs.dest, extra_files);
    }
    if (new_files.length) {
        console.log(' got new files ' + new_files.length);
        copyer.copy(new_files);
    }
    else
        onProcessDone();
};
var startProcess = function () {
    console.log(new Date().toDateString() + ' startProcess');
    fs.readdir(settinngs.dest, function (err, list1) {
        if (err)
            console.error(err);
        else {
            fs.readdir(settinngs.source, function (err, list2) {
                if (err)
                    console.error(err);
                else
                    compareLists(list1, list2);
            });
        }
    });
};
startProcess();
//# sourceMappingURL=delivery2.js.map