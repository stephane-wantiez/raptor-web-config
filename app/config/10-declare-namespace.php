<?php
include VENDOR_PATH.'Zend/Loader/StandardAutoloader.php';

$zendLoader = new \Zend\Loader\StandardAutoloader();
$zendLoader->register();

$zendLoader->registerNamespace('lib3dduo', VENDOR_PATH.'lib3dduo');