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
        new_pic:ImageData[]
        random_pic:ImageData[]
    }
    export class Gallery{
        images:ImageData[];

        $view:JQuery
        loadData():void{
            $.get('service/get-pic.php').done((res:Result)=>{
                var newImages= res.new_pic;
                var rand = res.random_pic;
                var all  = res.new_pic.concat(rand);
                console.log(all);
                this.images = all;
                this.start();
            })
        }
        nextdelay:number;
        showtime:number = 10;
        showTimer:number;
        serverdelay:number = 10;
        serverTimer:number;
        constructor(options){
            this.$view = $('#MyWindow');
            this.loadData();
            this.createDivs();
        }

        isRunning:boolean;
        start(){
            if(this.isRunning) return;
            this.isRunning = true;
            this.showNextSet();
            this.serverTimer = setInterval(()=>this.loadData(),this.serverdelay*1000);
            this.serverTimer = setInterval(()=>this.showNextSet(),this.showtime*1000);
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
        showNextSet():void{
            console.log('show next set');

            this.inset = -1;
           // this.screenImages = this.$view.children();
            this.switchNextImage();
        }
        screenImages:JQuery[];

        switchNextImage():void{
            this.inset++;
            var next:ImageData = this.getNext();
            var newImage:JQuery = $('<img>').attr('src',next.filename);
            console.log(this.inset);
            var div = this.screenImages[this.inset];
            div.empty();
            div.append(newImage);         
            if(this.inset<3) setTimeout(()=>this.switchNextImage(),1500);
        }
    }
}
$(document).ready(function(){
    var options ={

    }
    var gal = new simple.Gallery(options);
})