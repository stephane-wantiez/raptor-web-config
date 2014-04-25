<?php
namespace lib3dduo\utils;

class Utils{

	const CSV_SEPARATOR = ';';

	/**
	 * Crée une arborescence de dossier
	 *  
	 * @param string $path
	 * @return int Nombre de dossiers créés
	 */
	public static function mkdirr($path){
		$dirList = explode('/', $path);
		$path = '';
		$dirCount = 0;
		foreach($dirList as $d){
			$path .= $d.'/';
			if(!is_dir($path)){
				if(mkdir($path)){
					$dirCount++;
				}else{
					return $dirCount;
				}
			}
		}
		return $dirCount;
	}

	/**
	 * Retourne une description compléte de la variable
	 *
	 * @param mixed $var variable é afficher
	 * @param string $var nom de la variable
	 * @param boolean $echo si vrai, affiche le message, si faux, le retourne
	 */
	public static function debug($var, $nom = '', $echo = true, $open = false){
		static $id = 0;
	
		$debug_id = date("His") . '_' . $id;
		ob_start();
		print_r($var);
		$cont = ob_get_contents();
		ob_end_clean();
		$tab_cont = explode("\n",$cont);
		$nb = sizeof($tab_cont);
		$block = 0;
		if($open){
			$display = 'block';
			$button = '-';
		}else{
			$display = 'none';
			$button = '+';
		}
		foreach($tab_cont as $i => $ligne){
			if($i < ($nb - 1) && trim($tab_cont[$i+1]) == '('){
				$tab_cont[$i] = preg_replace('/ *\[(.*?)\] => (.*)/',
						'<span style="color:blue">$1</span> <span style="color:green">=></span> <span style="color:red;font-style:italic">$2</span>',$tab_cont[$i]);
				$tab_cont[$i] .= ' <span id="var'.$debug_id.'_b'.$block.'"
						onclick="b=document.getElementById(\'var'.$debug_id.'_block'.$block.'\').style;b.display=(b.display==\'none\'?\'block\':\'none\');" style="padding:0px 5px 0px 5px; height:20px; border: 1px solid black;font-weight:bold;background-color:palegoldenrod"
								>'.$button.'</span>
										<div id="var'.$debug_id.'_block'.$block.'" style="text-align:left;display:'.$display.'">';
			}elseif(trim($tab_cont[$i]) == ')'){
				$tab_cont[$i] = '</div>)</div>';
			}elseif(trim($tab_cont[$i]) == '('){
				$tab_cont[$i] = '(<div style="padding-left:20px">';
			}else{
				$tab_cont[$i] = preg_replace('/ *\[(.*?)\] => (.*)/',
						'<span style="color:blue">$1</span> <span style="color:green">=></span> <span style="color:red;font-style:italic">$2</span>',$tab_cont[$i]);
				$tab_cont[$i] .= '<br />';
			}
			$block++;
		}
		ob_start();

		echo '<div class="debug" style="text-align:left;font-size:10pt">Variable '.$nom.' ('.gettype($var).')<br />Contenu : '.implode("\n",$tab_cont).'</div>';
		$result = ob_get_contents();
		ob_end_clean();

		$id++;
		if($echo){
			echo $result;
		}else{
			return $result;
		}
	}
	
	/**
	 * Retourne un texte compatible javascript
	 *
	 * Tous les saut de lignes sont remplacés par des \\n ce qui évite de générer des erreur javascript.
	 *
	 * @param string $str Texte é convertir
	 * @param boolean $quote Mettre é vrai pour échaper les simple quotes
	 * @return string texte converti
	 */
	public static function str2js($str, $quote = false){
		if($quote){
			return str_replace(array("\r\n","\n","\r"),'\n',addslashes(htmlspecialchars($str)));
		}else{
			return str_replace(array("\r\n","\n","\r"),'\n',str_replace(array('\\','"'),array('\\\\','\\"'),$str));
		}
	}

	/**
	 * Converti un string au format "constante" en camelCase
	 *  
	 * @param string $s Chaîne à formatter
	 * @return string
	 */
	public static function constant2CamelCase($s){
		$data = explode('_', $s);
		$s = '';
		foreach($data as $i => $d){
			if($i == 0){
				$s .= strtolower($d);
			}else{
				$s .= ucfirst(strtolower($d));
			}
		}
		return $s;
	}


	/**
	 * Effectue un jet de dé
	 *
	 * @param integer $de Nombre de dé
	 * @param integer $faces Nombre de faces par dé
	 * @param integer $bonus Bonus ajouté
	 * @return integer Résultat du jet
	 */
	public static function roll($dices = 1, $faces = 100, $bonus = 0){
		$res = 0;
		for($i = 0; $i < $dices; $i++){
			$res += mt_rand(1, $faces);
		}
		$res += $bonus;
		return $res;
	}
	
	/**
	 * Retourne l'heure actuelle en millisecondes
	 *
	 * @return integer Heure en millisecondes
	 */
	public static function microtimestamp() {
		list($msec, $sec) = explode(' ', microtime());
		return ((float) $sec + (float) $msec) * 1000000;
	}

	/**
	 * Permet de dé-accent-ifier une chaine de caractère
	 *
	 * @param string $s
	 * @return string
	 */
	public static function cleanString($s) {
		return strtr($s, 'àâäêëèéïîìôòöûüù', 'aaaeeeeiiiooouuu');
	}

    /**
     * Génère un token CSRF (chaine "aléatoire") et le stocke en session
     * @return string
     */
    public static function generateCSRFToken() {
        $token = md5(mt_rand(0, PHP_INT_MAX));
        $_SESSION['csrf_token'] = $token;

        return $token;
    }

    /**
     * Vérifie un token CSRF face à la version en session
     * Une fois vérifié, le token est détruit (même s'il n'était pas correct)
     * @param $token
     * @return bool
     */
    public static function checkCSRFToken($token) {
        $valid = false;
        if (isset($_SESSION['csrf_token']) && $_SESSION['csrf_token'] === $token) {
            $valid = true;
        }
        if (isset($_SESSION['csrf_token'])) {
            unset($_SESSION['csrf_token']);
        }
        return $valid;
    }
	
	/**
	 * Configure et print les header http pour générer un fichier CSV
	 * 
	 * Les header incluent le nom du fichier pour forcer le téléchargement 
	 * ainsi qu'un en-tête UTF-8 BOM pour pouvoir être lu par excel
	 *  
	 * @param string $fileName Nom du fichier à télécharger
	 */
	public static function printCSVHeader($fileName){
		header('Content-Encoding: UTF-8');
		header('Content-type: text/csv; charset=UTF-8');
		
		// Force le téléchargement avec un nom de fichier donné
		header('Content-disposition: attachment;filename='.$fileName.'.csv');
		
		// UTF-8 BOM
		echo "\xEF\xBB\xBF";
	}
}
