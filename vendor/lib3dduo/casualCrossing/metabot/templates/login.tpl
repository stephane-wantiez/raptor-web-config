<?php
include 'header.tpl';
?>
</head>
<body class="yui-skin-sam metabot-login">
	<div id="wrap">
		<div class="container">
			<form class="form-signin" method="POST" action="<?php echo $_SERVER['REQUEST_URI'];?>">
				<h2 class="form-signin-heading">Connexion</h2>
				<input type="text" name="email" class="input-block-level" placeholder="Email">
				<input type="password" name="password" class="input-block-level" placeholder="Mot de passe">
				<?php
				if(defined('LDAP_DIRECTORY_LIST')){
					$directoryList = explode(',', LDAP_DIRECTORY_LIST);
					if(count($directoryList) == 1){
						echo '<input type="hidden" name="ldapDirectory" value="'.$directoryList[0].'"/>';
					}else{
						echo '<label class="select">Domaine : ';
						echo '<select name="ldapDirectory">';
						foreach($directoryList as $d){
							echo '<option value="'.$d.'">'.$d.'</option>';
						}
						echo '</select></label>';
					}
				}
				?>
				<label class="checkbox">
					<input type="checkbox" name="remember" value="remember-me"> Se souvenir de moi
				</label>
				<input class="btn btn-large btn-block btn-primary" type="submit" value="Se connecter"/>
				<br/>
				<?php
				if(@$_SESSION['loginError']){
					echo '<div class="alert alert-error">'.$_SESSION['loginError'].'</div>';
				}
				?>
			</form>
		</div>
	</div>
	<footer>
		<hr>
		<p>&copy; 3DDUO 2013</p>
	</footer>
</body>
</html>
