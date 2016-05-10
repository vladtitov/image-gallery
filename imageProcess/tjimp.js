/**
 * Created by Vlad on 5/10/2016.
 */
var Jimp = require("jimp");
Jimp.read("image1.jpg").then(function (lenna) {
    lenna.resize(1920, 1080)            // resize
        .quality(80)                // set JPEG quality                   
        .write("image1920.jpg"); // save
}).catch(function (err) {
    console.error(err);
});