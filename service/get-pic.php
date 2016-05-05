<?php
define('PREF','../');
define('DATA','data');
define('NEW_PICS',DATA.'/new_pics');
define('RANDOM',DATA.'/random_pics');
define('MAX',36);
$out = new stdClass();
$new_pic = getListing(NEW_PICS);
usort($new_pic, 'custom_sort');
//$out->orig =  getListing(NEW_PICS);
$out->pics=array_reverse($new_pic);

if(count($new_pic)<MAX){
    $rand = getListing(RANDOM);
    $out->pics = array_merge($out->pics,$rand ) ;
}

header('Content-type: application/json');
echo json_encode($out);

function getListing($folder){
    $listing = scandir(PREF.$folder);
    $listing =array_diff($listing, array('.', '..'));
    $ar =array();
    foreach ($listing as $item){
        $ar[]= getImagPearams(PREF,$folder.'/'.$item);
    }
    return $ar;
}

function getImagPearams($pref,$filename){
    $out = new stdClass();
    $out ->filename=$filename;
    $out->filemtime = filemtime($pref.$filename);
  //  $out->filectime = filectime($pref.$filename);
    $out->filemtimeD = date ("F d Y H:i:s.",$out->filemtime);
   // $out->filectimeD = date ("F d Y H:i:s.",$out->filectime);
    if(@is_array(getimagesize($pref.$filename))) $out -> info = getimagesize($pref.$filename);
    return $out;
}

function custom_sort($a,$b) {
    return $a->filemtime > $b->filemtime;
}
?>