<?php
define('NL', "\n");
define('TAB', "\t");
//header('Content-Type: text/plain');

if(!isset($argv[1])){
	die('Manque argument {1} (nom du dossier)');
}else{
	define('PROJECT_PATH', realpath(__DIR__.'/../..').'/');
	$path = PROJECT_PATH.'app/config/';
	$dir = opendir($path);

	$output = fopen(PROJECT_PATH.'app/config.php', 'w');
	fwrite($output, '<?php');

	$fileList = [];

	while($file = readdir($dir)){
		if($file != '.' && $file != '..'){
			if(!is_dir($path.$file)){
				$content = file_get_contents($path.$file);
				$content = str_replace('<?php', '', $content);
				$fileList[$path.$file] = $content;
			}else if($file == $argv[1]){
				$path2 = $path.$file.'/';
				$dir2 = opendir($path2);
				while($file2 = readdir($dir2)){
					if($file2 != '.' && $file2 != '..' && !is_dir($path2.$file2)){
						$content = file_get_contents($path2.$file2);
						$content = str_replace('<?php', '', $content);
						$fileList[$path2.$file2] = $content;
					}
				}
			}
		}
	}
	closedir($dir);
	ksort($fileList);
	foreach($fileList as $path => $content){
		fwrite($output, NL.'/******* '.$path.' *******/'.NL);
		fwrite($output, $content.NL);
		echo $path.' écrit'.NL;
	}
	fclose($output);
}
