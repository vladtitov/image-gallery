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
var Log = function (d) {
    console.log(d);
    logger.write(util.format(d) + '\n');
};
var Err = function (d) {
    err_log.write(util.format(d) + '\n');
    console.log(d);
};
var FileCopyer = (function () {
    function FileCopyer(fs) {
        this.fs = fs;
    }
    FileCopyer.prototype.onDone = function () {
        Log('ImageProcessor  done');
    };
    FileCopyer.prototype.onError = function (err) {
        Err(err);
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
        if (this.files.length) {
            var next = this.files.pop();
            this.copyFile(this.srcDir, this.destDir, next);
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
        Log('ImageProcessor  done');
    };
    ImageProcessor.prototype.onError = function (err) {
        Err(err);
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
        Log('processing left ' + this.files.length);
        if (this.files.length) {
            var next = this.files.pop();
            var ext = path.extname(next);
            if (ext === '.jpg' || ext === '.png')
                this.processFile(this.srcDir, this.destDir, next);
            else {
                this.onErrorProcess(' wrong file type ' + next, next);
                this.doNext();
            }
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
            lenna.resize(1920, 1080)
                .quality(80)
                .write(dest);
            _this.onSuccessProcess(file);
            _this.doNext();
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
    Log(' process  success: ' + imageProcessor.successFiles.length + ' errors: ' + imageProcessor.errorFiles.length);
    fs.readdir(settinngs.raw, function (err, list) {
        if (err)
            Err(err);
        else
            removeFiles(settinngs.raw, list);
    });
    onProcessDone();
};
var onProcessDone = function () {
    Log(new Date().toLocaleString() + ' done');
    clearTimeout(mytimer);
    mytimer = setTimeout(function () { return startProcess(); }, settinngs.delay * 1000);
};
copyer.onDone = function () {
    var ar = copyer.successFiles;
    Log(' copy  success: ' + copyer.successFiles.length + ' errors: ' + copyer.errorFiles.length);
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
        Log('removing extra ' + extra_files.toString());
        removeFiles(settinngs.dest, extra_files);
    }
    if (new_files.length) {
        Log(' got new files ' + new_files.length);
        copyer.copy(new_files);
    }
    else
        onProcessDone();
};
var startProcess = function () {
    Log(new Date().toDateString() + ' startProcess');
    fs.readdir(settinngs.dest, function (err, list1) {
        if (err)
            Err(err);
        else {
            fs.readdir(settinngs.source, function (err, list2) {
                if (err)
                    Err(err);
                else
                    compareLists(list1, list2);
            });
        }
    });
};
startProcess();
//# sourceMappingURL=delivery2.js.map