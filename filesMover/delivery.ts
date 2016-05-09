/**
 * Created by Vlad on 5/9/2016.
 */
///<reference path="../js/typings/node.d.ts"/>

var fs= require('fs-extra');
var settinngs = JSON.parse(fs.readFileSync('settings.json'));

class MoveFiles{
    source:string;
    dest:string;
    delay:number;
    fs:any = fs;
    listing:string[];
    mytimer:any;
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
        console.log('before moving ' + ar.length);
        ar.forEach((file)=> this.move(file));
    }

    read():void {
        var src:string = this.source;

        this.fs.readdir(src,(err,list)=>{
            this.listing = list;
            if(list.length) this.onFiles();
            else console.log('no  files in directory '+src);


        })

    }



    onMoved(err:any,dest:string):void{
        console.log('moved '+dest);
        if(err) console.log(err);

    }
    
    private move(filename:string):void{
        var dest:string = this.dest;
        var src:string = this.source;
      fs.exists(dest+'/'+filename,(exists)=>{
          if(exists){
              fs.remove(dest+'/'+filename,(err)=>{
                  if(err) console.log(' error remove file '+dest+'/'+filename);
                  else {
                      console.log('removed file '+dest+'/'+filename);
                      this.move(filename);
                  }
              })
          }else this.fs.move(src+'/'+filename,dest+'/'+filename,(err)=>this.onMoved(err,dest+'/'+filename));
      })

        //else this.fs.move(src+'/'+filename,dest+'/'+filename,(err)=>this.onMoved(err,dest+'/'+filename));
    }


}


var mmover:MoveFiles = new MoveFiles(settinngs);
mmover.read();