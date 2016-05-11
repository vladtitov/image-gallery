/**
 * Created by Vlad on 5/9/2016.
 */
/**
 * Created by Vlad on 5/9/2016.
 */
///<reference path="../js/typings/node.d.ts"/>
///<reference path="../js/typings/fs-extra.d.ts"/>
///<reference path="../js/typings/underscore.d.ts"/>

import fs = require('fs-extra');
import _ = require('underscore');
import path = require('path');

var util = require('util');
var Jimp = require("jimp");


var logger = fs.createWriteStream(__dirname  + '/logger.log', { flags: 'a' })
    , err_log = fs.createWriteStream(__dirname  + '/error.log', { flags: 'a' });

var Log = function(d) {
    console.log(d);
    logger.write(util.format(d) + '\n');
};
var Err = function (d) {
    err_log.write(util.format(d) + '\n');
    console.log(d);
}





class FileCopyer{
    onDone(){
        Log('ImageProcessor  done');
    }
    onError(err){
        Err(err);
    }
    destDir:string;
    srcDir:string;
    private files:string[];
    errorFiles:string[];
    successFiles:string[];
    constructor(private fs:any){

    }
    copy(files:string[]){
        this.files = files;
        this.errorFiles =[];
        this.successFiles=[];
        this.doNext();
    }


    private onFileCopied(file:string){
        this.successFiles.push(file);
    }
    private doNext():void{
        if(this.files.length){
            var next = this.files.pop();
            this.copyFile(this.srcDir,this.destDir,next);
        }else this.onDone();
    }

    private onErrorCopy(err,file):void{
        this.errorFiles.push(file);
        this.onError(err);
    }
    private copyFile(src:string,dest:string,file:string){
        src=src+'/'+file;
        dest=dest+'/'+file;
        this.fs.copy(src,dest,(err)=>{
            if(err)this.onErrorCopy(err,file);
            else this.onFileCopied(file);
            this.doNext();
        })
    }
}


class ImageProcessor{
    onDone(){
        Log('ImageProcessor  done');
    }
    onError(err){
        Err(err);
    }
    destDir:string;
    srcDir:string;
    errorFiles:string[];
    successFiles:string[];
    private path = path;

    private files:string[];
     constructor(private jimp){

     }

    process(list:string[]):void{
        this.files = list;
        this.successFiles =[];
        this.errorFiles=[];
        this.doNext();
    }

    private onSuccessProcess(file:string){
        this.successFiles.push(file);
    }
    private doNext():void{
        Log('processing left '+this.files.length );
        if(this.files.length){
            var next:string = this.files.pop();
            var ext = path.extname(next);
            if(ext === '.jpg' || ext ==='.png' )this.processFile(this.srcDir,this.destDir,next);
            else this.onErrorProcess(' wrong file type ', next);
            Log('   next '+next);


        }else this.onDone();
    }

    private onErrorProcess(err,file):void{
        this.errorFiles.push(file);
        this.onError(err);
    }

    private processFile(src:string,dest:string,file:string){

        src=src+'/'+file;
        dest=dest+'/'+file;
        this.jimp.read(src).then((lenna)=> {
            lenna.resize(1920, 1080)
                .quality(80)
                .write(dest);
            this.onSuccessProcess(file);
            this.doNext();
        }).catch((err)=> {
            this.onError(err);
            this.onErrorProcess(err,file);
        });
    }


}


var settinngs = JSON.parse(fs.readFileSync('settings.json').toString());

var copyer = new FileCopyer(fs);
copyer.destDir = settinngs.raw;
copyer.srcDir = settinngs.source;

//var mover:MoveFiles = new MoveFiles(settinngs);

var imageProcessor = new ImageProcessor(Jimp);

imageProcessor.srcDir = settinngs.raw;
imageProcessor.destDir = settinngs.dest;


imageProcessor.onDone = ()=>{
    Log(' process  success: ' + imageProcessor.successFiles.length + ' errors: '+imageProcessor.errorFiles.length);
    fs.readdir(settinngs.raw,(err,list)=>{
        if(err)Err(err);
        else removeFiles(settinngs.raw,list);
    });
    onProcessDone();
}
var onProcessDone = function () {
   Log(new Date().toLocaleString()+' done');
    clearTimeout(mytimer);
    mytimer = setTimeout(()=>startProcess(),settinngs.delay *1000);
}


copyer.onDone = ()=>{
    var ar:string[] = copyer.successFiles;
    Log(' copy  success: ' + copyer.successFiles.length + ' errors: '+copyer.errorFiles.length);
    imageProcessor.process(ar);
}





var mytimer;



var removeFiles = function (dir:string,files:string[]){
    files.forEach(function (file){
        file = dir+'/'+file;
        //Log'removing '+file);
        fs.remove(file,(err)=>{
            if(err)this.onError(err);
        });
    });
}


var compareLists = function( listDest:string[],listSource:string[]){
    var extra_files:string[] = _.difference(listDest,listSource);
    var new_files:string[] =  _.difference(listSource,listDest);

    if(extra_files.length){
        Log('removing extra '+extra_files.toString());
        removeFiles(settinngs.dest,extra_files);
    }
    if(new_files.length){
       Log(' got new files '+ new_files.length);
        copyer.copy(new_files);
    }
    else onProcessDone();
}



var startProcess = function(){
    Log(new Date().toDateString()+' startProcess');
    fs.readdir(settinngs.dest,(err,list1)=>{
        if(err)Err(err);
        else{
            fs.readdir(settinngs.source,(err,list2)=>{
                if(err)Err(err);
                else compareLists(list1,list2);
            });
        }

    })

}


startProcess();
