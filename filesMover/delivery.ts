/**
 * Created by Vlad on 5/9/2016.
 */
/**
 * Created by Vlad on 5/9/2016.
 */
///<reference path="../js/typings/node.d.ts"/>

var fs= require('fs-extra');
var util = require('util');
var settinngs = JSON.parse(fs.readFileSync('settings.json'));

var logger = fs.createWriteStream(__dirname  + '/logger.log', { flags: 'a' })
    , err_log = fs.createWriteStream(__dirname  + '/error.log', { flags: 'a' });

console.log = function(d) { //
    logger.write(util.format(d) + '\n');
};
console.error = function(d) { //
    err_log.write(util.format(d) + '\n');
};

class MoveFiles{
    source:string;
    dest:string;
    delay:number;
    fs:any = fs;
    listing:string[];
    mytimer:any;
    copiyed:string[]=[];
    constructor(options){
        for(var str in options) this[str] = options[str];

    }

    start():void{
        this.mytimer = setInterval(()=>this.read(), this.delay*1000);
    }
    storp():void{
        clearInterval(this.mytimer);
    }
    onFiles():void{
        var src:string = this.source;
        var ar = this.listing;
        console.log('files in source ' + ar.length);
        this.count = ar.length;
        ar.forEach((file)=>{
            if(this.copiyed.indexOf(file) === -1) this.copy(file);
            // console.log(this.copiyed.indexOf(file));
        });
    }

    read():void {
        this.onStart();
        var src:string = this.source;
        this.fs.readdir(src,(err,list)=>{
            this.listing = list;
            if(list.length) this.onFiles();
            else console.log('no  files in directory '+src);
        })

    }

    onStart():void{
        console.log(new Date().toLocaleString())
    }
    onDone():void{
        console.log('Done '+new Date().toLocaleString());
    }

    private count:number;

    onMoved(err:any,dest:string):void{
        this.count--;
        if(this.count==0)this.onDone();
        if(err) console.error(err);
        else  console.log('moved '+dest);
    }

    private move(filename:string):void{
        var dest:string = this.dest+'/'+filename;
        var src:string = this.source;
        var fs = this.fs;
        fs.exists(dest,(exists)=>{
            if(exists){
                fs.remove(dest,(err)=>{
                    if(err){
                        this.count--;
                        console.error(' error remove file '+dest);
                    }else {
                        console.log('removed file '+dest);
                        this.move(filename);
                    }
                })
            }else this.fs.move(src+'/'+filename,dest,(err)=>this.onMoved(err,dest));
        })

    }
    private onCopy(err,filename):void{
        if(err)console.error(err);
        else {
            console.log('copy done '+filename);
            this.copiyed.push(filename);
        }
    }
    private copy(filename:string):void{
        var dest:string = this.dest+'/'+filename;
        var src:string = this.source;
        var fs = this.fs;
        fs.exists(dest,(exists)=>{
            if(exists) this.copiyed.push(filename);
            else this.fs.copy(src+'/'+filename,dest,(err)=>this.onCopy(err,filename));
        })

    }


}


var mover:MoveFiles = new MoveFiles(settinngs);
mover.read();
mover.start();