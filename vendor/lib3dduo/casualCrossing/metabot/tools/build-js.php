<?php
define('NL', "\n");
define('TAB', "\t");

define('PROJECT_PATH', preg_replace('/\/[^\/]+$/', '', str_replace('\\', '/', __DIR__)));
define('JS_FILENAME', 'metabot.js');
define('JS_MIN_FILENAME', 'metabot-min.js');
define('JS_DIR', PROJECT_PATH.'/static/deploy/metabot/js/');
define('JS_SRC_DIR', PROJECT_PATH.'/static/src/js/');

function browseDir($dir, $output){
	echo '* Browsing directory '.$dir.'...'.NL;
	$fileList = array();
	$d = opendir($dir);
	while($f = readdir($d)){
		if($f != '.' && $f != '..'){
			$fileList[$f] = $dir.$f;
		}
	}
	closedir($d);
	ksort($fileList);
	foreach($fileList as $f){
		if(is_dir($f)){
			browseDir($f.'/', $output);
		}else{
			echo ' - Importing '.$f.'...';
			fwrite($output, NL.NL.'/**** '.$f.' ****/'.NL);
			fwrite($output, file_get_contents($f));
			echo ' [OK]'.NL;
		}
	}
}
echo 'Building js file...'.NL;
$f = fopen(JS_DIR.JS_FILENAME, 'w');
browseDir(JS_SRC_DIR, $f);
fclose($f);

echo 'Minimizing JS..'.NL;
exec('uglifyjs -o '.JS_DIR.JS_MIN_FILENAME.' '.JS_DIR.JS_FILENAME);
echo 'JS build done'.NL;

if(@$argv[1] == 'deploy'){
	passthru('php '.__DIR__.'/build-deploy.php js');
}
