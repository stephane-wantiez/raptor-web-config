<?php
define('NL', "\n");
define('TAB', "\t");

define('METABOT_PATH', preg_replace('/\/[^\/]+$/', '', str_replace('\\', '/', __DIR__)));
define('PROJECT_PATH', preg_replace('/\/vendor\/.+$/', '', METABOT_PATH));
define('STATIC_VENDOR_PATH', PROJECT_PATH.'/web-static/vendor');


function copyr($source, $dest){
	// Simple copy for a file
	if (is_file($source)) {
		echo 'Writing '.$dest.'...';
		$result = copy($source, $dest);
		if($result){
			echo ' [OK]'.NL;
		}else{
			echo ' [FAILED]'.NL;
		}
		return $result;
	}

	// Make destination directory
	if (!is_dir($dest)) {
		echo 'Creating dir '.$dest.'...';
		if(mkdir($dest)){
			echo ' [OK]'.NL;
		}else{
			echo ' [FAILED]'.NL;
		}
	}

	// Loop through the folder
	$dir = opendir($source);
	while ($entry = readdir($dir)) {
		// Skip pointers
		if ($entry == '.' || $entry == '..') {
			continue;
		}

		// Deep copy directories
		if ($dest !== $source.'/'.$entry) {
			copyr($source.'/'.$entry, $dest.'/'.$entry);
		}
	}
	closedir($dir);
	return true;
}
if(!is_dir(STATIC_VENDOR_PATH)){
	mkdir(STATIC_VENDOR_PATH);
}
if(@$argv[1] == 'js'){
	copyr(METABOT_PATH.'/static/deploy/metabot/js', STATIC_VENDOR_PATH.'/metabot/js');
}else if(@$argv[1] == 'css'){
	copyr(METABOT_PATH.'/static/deploy/metabot/css', STATIC_VENDOR_PATH.'/metabot/css');
}else{
	copyr(METABOT_PATH.'/static/deploy', STATIC_VENDOR_PATH);
}

echo 'Metabot deployment done'.NL;
