<?php
include 'header.tpl';
?>
	<script type="text/javascript">
	<?php
	if($this->getUserManager() && $this->getUserManager()->getUserAccessManager()){
		echo 'var userAccessData='.json_encode($this->getUserManager()->getUserAccessManager()->getData()).';';
	}
	?>
	</script>

    <!-- Config link :
	//developer.yahoo.com/yui/articles/hosting/?autocomplete&base&button&calendar&colorpicker&connection&connectioncore&container&containercore&cookie&datasource&datatable&dom&dragdrop&event&fonts&grids&json&layout&paginator&reset&resize&tabview&treeview&yahoo&MIN&nocombine&basepath&//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/&google
	-->
		
	<!-- Individual YUI JS files --> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/yahoo-dom-event/yahoo-dom-event.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/connection/connection-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/datasource/datasource-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/autocomplete/autocomplete-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/element/element-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/button/button-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/calendar/calendar-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/dragdrop/dragdrop-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/slider/slider-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/colorpicker/colorpicker-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/container/container-min.js"></script>  
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/cookie/cookie-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/paginator/paginator-min.js"></script>  
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/datatable/datatable-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/layout/layout-min.js"></script>  
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/tabview/tabview-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/treeview/treeview-min.js"></script>
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/resize/resize-min.js"></script> 
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/yui/2.9.0/build/json/json-min.js"></script>
	
	<script src="<?php echo WEB_STATIC_URI;?>vendor/metabot/js/metabot<?php if(!isset($_REQUEST['dbg']))echo '-min';?>.js"></script>
	<?php
	foreach($this->scriptList as $s){
		echo '<script src="'.$s.'"></script>';
	}
	?>
	<script src="<?php echo WEB_STATIC_URI;?>js/script<?php echo JS_VERSION;?>.js"></script>
</head>
<body class="yui-skin-sam">
	<div id="wrap">
		<div class="navbar navbar-inverse navbar-fixed-top">
			<div class="navbar-inner">
				<div class="container-fluid">
					<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
						<span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span>
					</button>
					<?php
					$projectQuery = '';
					$projectManager = $this->getProjectManager(); 
					if($projectManager && $projectManager->hasProject()){
						$projectQuery = $projectManager->getProjectFieldName().'='.$projectManager->getProjectId();
					}
					
					if(self::$ICON_URL){
						echo '<img class="brand-image" src="'.self::$ICON_URL.'"/> ';
					}
					?>
					<a class="brand" href="?<?php echo $projectQuery;?>"><?php
						echo self::$TITLE;
						if($projectManager && $projectManager->hasProject()){
							echo ' : '.$projectManager->getProjectName();
						}
					?></a>
					<div class="nav-collapse collapse">
						<?php
						if($this->getUserManager()){
							?>
							<p class="navbar-text pull-right">
								<?php echo str_replace('%1', '<a href="#" class="navbar-link"><strong>'.$this->getUserManager()->getUsername().'</strong></a>', _2('connected as %1'));?>
								<a href="?logout" class="btn btn-mini btn-danger"><i title="<?php echo _2('disconnect');?>" class="icon-off icon-white"></i></a>
							</p>
							<?php
						}
						if(@count($GLOBALS['LOCALE_LIST']) > 1){
							?>
							<p class="navbar-text pull-right locale-list">
								<?php
								foreach($GLOBALS['LOCALE_LIST'] as $loc => $locName){
									list($lang, $country) = explode('_', $loc);
									$country = strtolower($country);
									echo '<a href="?lc='.$loc.'" title="'.$locName.'"><img valign="top" src="'.WEB_STATIC_URI.'vendor/metabot/img/flags/'.$country.'.png" alt="'.$locName.'"/></a> ';
								}
								?>
							</p>
							<?php
						}
						echo '<ul class="nav">';
						if($projectManager){
							echo '<li '.($this->specialPage?'':'class="active"').'><a href="'.$_SERVER['PHP_SELF'].'">Gestion projets</a></li>';
						}
						$pageList = $this->getSpecialPageList();
						foreach($pageList as $page){
							if(!$projectManager || $projectManager->hasProject()){
								echo '<li '.($this->specialPage && $this->specialPage->getId()==$page->getId()?'class="active"':'').'><a ';
								if($page->getLink()){
									echo 'href="'.$page->getLink().'" target="_blank"';
								}else{
									echo 'href="'.$_SERVER['PHP_SELF'].'?'.($projectQuery?$projectQuery.'&':'').'sp='.$page->getId().'"';
								}
								echo '>'.$page->getLabel().'</a></li>';
							}
						}
						echo '</ul>';
						?>
					</div>
					<!--/.nav-collapse -->
				</div>
			</div>
		</div>
		
		<?php
		if($this->specialPage){
			echo '<div class="container-fluid" id="main-container"><div class="row-fluid" id="main-row">';
			$this->specialPage->display();
			echo '</div></div>';
		}else{
			?>
			<div style="position: fixed" id="menu-left" class="span3 sidebar-nav">
				
			</div>
			<div class="container-fluid" id="main-container">
				<div class="row-fluid" id="main-row">
					<div class="offset3 span9" id="data"></div>
				</div>
			</div>
			<?php
		}
		?>
	</div>
	<footer>
		<hr>
		<p>&copy; 3DDUO 2013 <?php
		if(@JS_VERSION){
			echo ' | js'.JS_VERSION;
		}
		if(@CSS_VERSION){
			echo ' | css'.CSS_VERSION;
		}
		?></p>
	</footer>
	<div id="modal" class="modal hide fade" tabindex="-1" role="dialog">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">×</button>
			<h3 id="modal-label">Title</h3>
		</div>
		<div class="modal-body" id="modal-body">
		</div>
		<div class="modal-footer" id="modal-footer">
			<button class="btn" id="modal-action" aria-hidden="true">Action</button>
			<button class="btn btn-primary" id="modal-close" data-dismiss="modal" aria-hidden="true">Fermer</button>
		</div>
	</div>
</body>
</html>
