<?php
use lib3dduo\casualCrossing\metabot\MetaBot;
?><!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title><?php echo MetaBot::$TITLE;?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
	<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8;" />
    
    <!-- Individual YUI CSS files --> 
	<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/assets/skins/sam/skin.css">
	<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/assets/skins/sam/resize.css">
	<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/assets/skins/sam/layout.css">
	<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/tabview/assets/skins/sam/tabview.css">
	<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/menu/assets/skins/sam/menu.css">
	<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/treeview/assets/skins/sam/treeview.css">
	<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/datatable/assets/skins/sam/datatable.css">
	<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/container/assets/skins/sam/container.css">
	<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/autocomplete/assets/skins/sam/autocomplete.css">
	<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/paginator/assets/skins/sam/paginator.css">
	
	<link rel="stylesheet" type="text/css" href="<?php echo WEB_STATIC_URI;?>vendor/bootstrap/css/bootstrap.min.css"/>
	<link rel="stylesheet" type="text/css" href="<?php echo WEB_STATIC_URI;?>vendor/bootstrap/css/bootstrap-responsive.css"/>
	<link rel="stylesheet" type="text/css" href="<?php echo WEB_STATIC_URI;?>vendor/metabot/css/metabot.css"/>
	<link rel="stylesheet" type="text/css" href="<?php echo WEB_STATIC_URI;?>vendor/bootstrap-switch/css/bootstrapSwitch.css">
	<link rel="stylesheet" type="text/css" href="<?php echo WEB_STATIC_URI;?>css/style<?php echo CSS_VERSION;?>.css"/>
	
	<script type="text/javascript">
	var WEB_STATIC_URI = "<?php echo WEB_STATIC_URI;?>";
	(function(MetaBot){
		<?php
		if($this instanceof MetaBot && $this->getProjectManager()){
			echo 'MetaBot.PROJECT_FIELD_NAME = "'.$this->getProjectManager()->getProjectFieldName().'";'; 
			if($this->getProjectManager()->hasProject()){
				echo 'MetaBot.PROJECT_ID = '.$this->getProjectManager()->getProjectId().';';
			}
		}
		?>
	})(window.MetaBot = window.MetaBot || {});
	</script>
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.1/jquery-ui.min.js"></script>
	<script src="<?php echo WEB_STATIC_URI;?>vendor/jquery/jquery.ui.widget.js"></script>
	<script src="<?php echo WEB_STATIC_URI;?>vendor/jquery/jquery.iframe-transport.js"></script>
	<script src="<?php echo WEB_STATIC_URI;?>vendor/jquery/jquery.fileupload.js"></script>
	<script src="<?php echo WEB_STATIC_URI;?>vendor/bootstrap/js/bootstrap.min.js"></script>
	<script src="<?php echo WEB_STATIC_URI;?>vendor/highcharts/js/highcharts.js"></script>
	<script src="<?php echo WEB_STATIC_URI;?>vendor/highcharts/js/modules/exporting.js"></script>

	<script src="<?php echo WEB_STATIC_URI;?>vendor/bootstrap-switch/js/bootstrapSwitch.js"></script>
