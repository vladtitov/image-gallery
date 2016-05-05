/**
 * Created by Vlad on 5/5/2016.
 */
///<reference path="typings/jquery.d.ts"/>

module simple{
    interface ImageInfo{
            0: number;
            1:number;
            2: number;
            3:string;
            bits: number;
            channels:number;
            mime: string;
    }
    interface ImageData{
        filename: string;
        filemtime: number;
        filemtimeD: string;
        info:ImageInfo;
        
    }
    interface Result{
        pics:ImageData[]
    }
    export class Gallery{
        images:ImageData[];

        $view:JQuery
        loadData():JQueryPromise<any>{
            return $.get('service/get-pic.php').done((res:Result)=>{
                this.images = res.pics;
            })
        }
        nextdelay:number;
        showtime:number = 10;
        showTimer:number;
        serverdelay:number = 60;
        serverTimer:number;
        constructor(options){
            for(var str in options) this[str] = options[str];
            this.$view = $('#MyWindow');
            this.loadData().then(()=>{
                this.start();
            });
            this.createDivs();
            this.serverTimer = setInterval(()=>this.loadData(),this.serverdelay*1000);
        }

        imagesDelay:number=1.5;
        isRunning:boolean;
        isInit:boolean;
        start(){
            if(this.isRunning) return;
            this.isRunning = true;
            this.showNextSet(150);
            this.showTimer = setInterval(()=>this.showNextSet(this.imagesDelay*1000),this.showtime*1000);
        }

        createDivs(){
            this.screenImages=[];
            for(var i=0;i<4;i++){
                var div = $('<div>');
                this.screenImages.push(div)
                this.$view.append(div)
            }
        }

        private current:number=-1;
        private getNext():ImageData{
            this.current++;
            if(this.current>=this.images.length)this.current=0;
            return this.images[this.current]
        }
        private inset:number=-1;
        showNextSet(delay:number):void{
            console.log('show next set');
            this.inset = -1;
            this.switchNextImage(delay);
        }
        screenImages:JQuery[];

        switchNextImage(delay:number):void{
            this.inset++;
            if(this.inset>=this.screenImages.length) return;
            var next:ImageData = this.getNext();
            var newImage:JQuery = $('<img>').attr('src',next.filename);
          //  console.log(this.inset);
            var div = this.screenImages[this.inset];
            var oldImage = div.children();
            oldImage.addClass('out');
            setTimeout(function(){oldImage.remove()},1000);
            newImage.addClass('inn');
            setTimeout(function(){newImage.removeClass('inn')},20);
            div.append(newImage);         
           setTimeout(()=>this.switchNextImage(delay),delay);
        }
    }
}
$(document).ready(function(){
    var options ={
        serverdelay:40, //how often query server in seconds
        showtime:10,// how long image displayed on screen
        imagesDelay:1.5 //delay between images swap
    }
    var gal = new simple.Gallery(options);
})