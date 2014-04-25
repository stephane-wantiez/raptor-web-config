<?php
session_name('RAPTOR_WEB_CONFIG_SESSID');
if(isset($_REQUEST['SID'])){
	session_id($_REQUEST['SID']);
}
session_start();