<?php
define('NL', "\n");
define('TAB', "\t");

define('PROJECT_PATH', preg_replace('/\/[^\/]+$/', '', str_replace('\\', '/', __DIR__)));
define('CSS_SRC_PATH', PROJECT_PATH.'/static/src/css/');
define('CSS_MIN_PATH', PROJECT_PATH.'/static/deploy/metabot/css/');

echo 'Minimizing CSS...'.NL;
passthru('sass "'.realpath(CSS_SRC_PATH).'/metabot.scss":"'.realpath(CSS_MIN_PATH).'/metabot.css"');
echo 'CSS build done'.NL;

if(@$argv[1] == 'deploy'){
	passthru('php '.__DIR__.'/build-deploy.php css');
}
