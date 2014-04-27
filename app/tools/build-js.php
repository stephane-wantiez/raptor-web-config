<?php
define('NL', "\n");
define('TAB', "\t");
header('Content-Type: text/plain');

define('PROJECT_PATH', __DIR__.'/../../');

function browseDir($path, &$fileList){
	$dir = opendir($path);
	$tmpFileList = array();
	while($file = readdir($dir)){
		if($file != '.' && $file != '..'){
			$tmpFileList[] = $path.$file;
		}
	}
	sort($tmpFileList);
	closedir($dir);

	foreach($tmpFileList as $file){
		if(!is_dir($file)){
			$content = file_get_contents($file);
			$fileList[$file] = $content;
		}else{
			browseDir($file.'/', $fileList);
		}
	}
}

$path = PROJECT_PATH.'web-static-src/js/';
$fileList = array();
browseDir($path, $fileList);

$output = fopen(PROJECT_PATH.'web-static/js/script.js', 'w');
foreach($fileList as $path => $content){
	fwrite($output, NL.'/******* '.$path.' *******/'.NL);
	fwrite($output, $content.NL);
	echo $path.' écrit'.NL;
}
fclose($output);
