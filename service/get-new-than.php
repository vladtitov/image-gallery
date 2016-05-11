<?php
define('PREF','../');
define('DATA','data');
define('NEW_PICS',DATA.'/new_pics');
define('RANDOM',DATA.'/random_pics');
define('MIN',36);
$stamp = 0;
$out = new stdClass();
if(isset($_GET['stamp']))$stamp = $_GET['stamp'];
define('STAMP',$stamp);
if($stamp){
    $new_pic = getListing(NEW_PICS);
    usort($new_pic, 'custom_sort');
    $out->pics=array_reverse($new_pic);
}


header('Content-type: application/json');
echo json_encode($out);

function getListing($folder){
    $listing = scandir(PREF.$folder);
    $listing =array_diff($listing, array('.', '..'));
    $ar =array();
    $large=array();

    foreach ($listing as $item){

        $img = getImagPearams(PREF,$folder.'/'.$item);
       if($img){
           $w = $img->info[0];
           $img->w = $w;
           $ar[] = $img;
       }
    }
    return $ar;
}

function getImagPearams($pref,$filename){
    $out = new stdClass();
    $out ->filename=$filename;
    $stamp =  filemtime($pref.$filename);
    if($stamp>STAMP){
        if(@is_array(getimagesize($pref.$filename))) $out -> info = getimagesize($pref.$filename);
        else return 0;
        $out->filemtime = $stamp;
        $out->filemtimeD = date ("F d Y H:i:s.",$out->filemtime);

        return $out;
    }
   return 0;
}

function custom_sort($a,$b) {
    return $a->filemtime > $b->filemtime;
}
?>