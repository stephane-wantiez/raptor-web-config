<?php
namespace lib3dduo\database;

/**
 * Classe data
 *
 * Permet de gérer des structures de données utilisées par la base de données
 * @see Database
 */
class Data{
	/**
	 * Indique s'il faut forcer les enregistrements
	 * Les erreurs de type seront alors ignorées
	 * @var boolean
	 */
	public $force = false;
	
	
	/**
	 * Liste des données brutes
	 * @var array(string)
	 */
	private $data = array();

	/**
	 * Table des données
	 * @var string
	 */
	private $table;

	/**
	 * Autoriser le remplacement de donn�es
	 * @var boolean
	 */
	private $replace = false;

	/**
	 * Ne fait rien
	 */
	function __construct($table, $replace = false){
		$this->table = $table;
		$this->replace = $replace;
	}
	
	public function getTable(){
		return $this->table;
	}
	
	public function allowReplace(){
		return $this->replace;
	}

	/**
	 * Prépare une chaîne de caractére pour utilisation dans bdd
	 *
	 * Par défaut, on transforme les caractéres html spéciaux (",<,>) en code html,
	 * Sinon on ne fait qu'échapper les guillemets
	 * @param string $string Donnée é formater
	 * @param boolean $html Indique si on doit passer le formatage pour html
	 * @return string Chaîne formatée
	 */
	static function prepareString($string, $html){
	    if($html){
	        return '"'.htmlentities($string, ENT_COMPAT, 'UTF-8').'"';
	    }else{
		    return '"'.addslashes($string).'"';
		}
	}

	/**
	 * Prépare un objet pour utilisation dans bdd
	 *
	 * L'objet est serialisé, et stocké comme une simple chaéne de caractéres
	 * @param mixed $object Donnée é formater
	 * @return string Objet formaté
	 */
	static function prepareObject($object){
	    return '"'.addslashes(serialize($object)).'"';
	}
	
	/**
	 * Retourne un tableau de données formatées ($param => $val)
	 *
	 * @return array Données formatées
	 */
	function toArray(){
	    return $this->data;
	}
	
	public function setTable($table){
		$this->table = $table;	
	}
	
	/**
	 * Supprime les données du paramètre donné
	 * Si aucun paramètre n'est donné, tout l'objet est nettoyé
	 * @param string $param Nom du paramètre
	 */
	function clean($param = false){
	    if($param){
			unset($this->data[$param]);
	    }else{
	        $this->data = array();
	    }
	}
	
	/**
	 * Met un champ à vrai
	 * 
	 * @param string $param Nom du paramètre
	 */
	function setTrue($param){
		$this->data[$param] = 1;
	}
	
	/**
	 * Met un champ à faux
	 * 
	 * @param string $param Nom du paramètre
	 */
	function setFalse($param){
		$this->data[$param] = 0;	
	}
	
	/**
	 * Ajoute une chaîne binaire
	 *
	 * @param string $param Nom du paramètre
	 * @param int $val Valeur du paramètre (prise dans $_POST par défaut)
	 */
	function addBinary($param, $val){
		$this->data[$param] = $val;
	}
	
	/**
	 * Ajoute une référence (entier > 0 ou null si 0)
	 *
	 * @param string $param Nom du paramètre
	 * @param int $val Valeur du paramètre (prise dans $_POST par défaut)
	 */
	function addRef($param, $val){
		$val = (int)$val;
		if(!$val){
			$this->setNull($param, $val);
		}else{
			if(!$this->force && !is_numeric($val)){
				new DataException('Ce n\'est pas un nombre !', array($param=>$val));
			}
			$this->data[$param] = $val;
		}
	}
	
	/**
	 * Ajoute un entier
	 *
	 * @param string $param Nom du paramètre
	 * @param int $val Valeur du paramètre (prise dans $_POST par défaut)
	 */
	function addInt($param, $val){
		if(!$this->force && !is_numeric($val)){
			new DataException('Ce n\'est pas un nombre !', array($param=>$val));
		}
		$this->data[$param] = (int)$val;
	}
	
	/**
	 * Ajoute un double
	 *
	 * @param string $param Nom du paramètre
	 * @param int $val Valeur du paramètre (prise dans $_POST par défaut)
	 */
	function addDouble($param, $val){
		if(!$this->force && !is_numeric($val))
			new DataException('Ce n\'est pas un nombre !', array($param=>$val));
		$this->data[$param] = str_replace(',', '.', (double)$val);
	}
	
	/**
	 * Ajoute un booléen
	 *
	 * @param string $param Nom du paramètre
	 * @param bool $value Valeur du paramètre (prise dans $_POST par défaut)
	 */
	function addBool($param, $value){
		if($value){
			$this->setTrue($param);
		}else{
			$this->setFalse($param);
		}
	}

	/**
	 * Ajoute une chaîne
	 *
	 * @param string $param Nom du paramètre
	 * @param string $val Valeur du paramètre (prise dans $_POST par défaut)
	 * @param boolean $html Indique si on doit passer le formatage pour html
	 * @param boolean $allowScript Autorise les scripts (désactivé par défaut pour raisons de sécurité)
	 */
	function addString($param, $val, $html = false, $allowScript = false){
	    $val .= '';
	    if(!$this->force && !is_string($val)){
			throw new DataException('Ce n\'est pas une chaîne de caractére !', array($param=>$val));
	    }
	    if($html){
	    	$this->data[$param] = self::prepareString($val, true);
	    }else{
	    	if(!$allowScript){
	    		$val = str_replace('<script', '&lt;script', $val);
	    	}
			$this->data[$param] = self::prepareString($val, false);
	    }
	}

	/**
	 * Ajoute un objet
	 *
	 * @param string $param Nom du paramètre
	 * @param string $val Valeur du paramètre
	 */
	function addObject($param, $val){
	    if(!$this->force && !is_object($val) && !is_array($val)){
			new DataException('Ce n\'est pas un objet !', array($param=>$val));
	    }
		$this->data[$param] = self::prepareObject($val);
	}

	/**
	 * Met un paramètre é NULL
	 *
	 * @param string $param Nom du paramètre
	 */
	function setNull($param){
	    $this->data[$param] = 'NULL';
	}

	/**
	 * Ajoute une donnée SQL brute
	 *
	 * A utiliser pour insérer des fonctions SQL non implémentées ici
	 *
	 * @param string $param Nom du paramètre
	 * @param string $val Valeur du paramètre (prise dans $_POST par défaut)
	 */
	function addRaw($param, $val){
	    $this->data[$param] = $val;
	}
	
	/**
	 * Incrémente/décrémente une valeur numerique
	 *
	 * La commande est ajoutée dans les données brutes.
	 * @param string $param Nom du paramètre
	 * @param int $val Valeur é ajouter/soustraire (prise dans $_POST par défaut)
	 */
	function add($param, $val){
	    if(!$this->force && !is_numeric($val))
			new DataException('Ce n\'est pas un nombre !', array($param=>$val));
		$val = (double)$val;
		if($val > 0){
	        $val = '+'.$val;
		}
		if($val){
            $this->data[$param] = $param.$val;
		}
	}

	/**
	 * Multiplie une valeur numerique
	 *
	 * La commande est ajoutée dans les données brutes
	 * @param string $param Nom du paramètre
	 * @param int $val Facteur (prise dans $_POST par défaut)
	 */
	function mul($param, $val){
	    if(!$this->force && !is_numeric($val)){
			new DataException('Ce n\'est pas un nombre !', array($param=>$val));
	    }
	    $val = (int)$val;
		if($val){
            $this->data[$param] = $param.' * '.$val;
		}
	}

	/**
	 * Concatène 2 chaînes
	 *
	 * La commande est ajoutée dans les données brutes
	 * @param string $param Nom du paramètre
	 * @param array(string) $values Valeurs à concaténer
	 */
	function concat($param, $values){
	    $this->data[$param] = 'CONCAT('.implde(',', $values).')';
	}
}
