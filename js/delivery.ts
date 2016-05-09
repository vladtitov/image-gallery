/**
 * Created by Vlad on 5/9/2016.
 */
///<reference path="typings/node.d.ts"/>
    
var fs= require('fs');
var onScan = function(){

}
var source = 'C://source';
var dest ="c://wamp/www/GitHub/image-gallery/data/new_pics/";
fs.readdir(source,function(err, list){
        list.forEach(function(file) {
        var path = source + '/' + file;
            fs.rename( path,dest+file,function(res){
                console.log(dest+file)
            })
           // var stat = fs.statSync(file);
       // console.log(stat);
    });

})
