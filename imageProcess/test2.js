/**
 * Created by Vlad on 5/10/2016.
 */
require('lwip').open('image1.jpg', function(err, image){

    // check err...
    // define a batch of manipulations and save to disk as JPEG:
    image.batch()
        .resize(1920,1080)
    // scale to 75%
     //   .rotate(45, 'white')  // rotate 45degs clockwise (white fill)
       // .crop(200, 200)       // crop a 200X200 square from center
       // .blur(5)              // Gaussian blur with SD=5
        .writeFile('output2.jpg', function(err){
            // check err...
            // done.
        });

});