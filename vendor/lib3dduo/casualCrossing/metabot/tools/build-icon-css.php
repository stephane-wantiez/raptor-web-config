<pre>
<?php
define('NL', "\n");
define('PROJECT_PATH', preg_replace('/\/[^\/]+$/', '', str_replace('\\', '/', __DIR__)));

$d = opendir(PROJECT_PATH.'/static/deploy/metabot/img/icons');
$f = fopen(PROJECT_PATH.'/static/src/css/icons.scss', 'w');
while($nom = readdir($d)){
	$ext = substr($nom, -3);
	$basename = substr($nom, 0, -4);
	if($ext == 'png'){
		fputs($f, '.silk-icon-'.$basename.' .first-child, .silk-icon-'.$basename.' a, td.silk-icon-'.$basename.'{ background: url(../img/icons/'.$nom.') no-repeat 4px center;} .silk-icon-'.$basename.' button, .silk-icon-'.$basename.' a{ text-indent: 10px;} td.silk-icon-'.$basename.'{ background-position: 4px center; padding-left: 22px;}'.NL);
		echo $nom.' [OK]'.NL;
	}
}
fclose($f);
?>
</pre>
