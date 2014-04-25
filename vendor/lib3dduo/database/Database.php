<?php
namespace lib3dduo\database;

/**
 * class Database
 *
 * Gère les accès à la base de données
 *
 */
class Database{

	const DBMS_MYSQL = 1;

	const DBMS_PGSQL = 2;

	const DBMS_MYSQL_PDO = 3;

	const REQUEST_HTML_STYLE = 'padding:3px;color:black;border:black solid 1px;background-color:deepskyblue;text-align:left;margin:5px;overflow:auto;width:700px';

	/**
	 * Mode de sélection pour avoir des résultats uniques
	 */
	const RES_UNIQUE = 1;

	/**
	 * Mode de sélection pour indexer les résultats par id
	 */
	const INDEX_ID = 2;

	/**
	 * Formate les données dans un tableau numerique et associatif
	 */
    const FETCH_ARRAY = 1;

	/**
	 * Formate les données dans un tableau associatif
	 */
    const FETCH_ASSOC = 2;

	/**
	 * Formate les données dans un objet standard
	 */
    const FETCH_OBJECT = 3;

	/**
	 * Formate uniquement la dernière donnée encontrée (utilisable avec INDEX_ID et RES_UNIQUE)
	 */
	const FETCH_UNIQUE = 4;

	/**
	 * Formate les données dans un tableau numerique
	 */
    const FETCH_ROW = 5;

	/********************************
	******      ATTRIBUTS       *****
	********************************/

	/**
	 * serveur de connexion
	 * @var string $server
	 */
	private $server;

	/**
	 * port de connexion
	 * @var integer
	 */
	private $port;

	/**
  	 * utilisateur pour la connexion
	 * @var string $user
	 */
	private $user;

	/**
	 * password pour la connexion
	 * @var string $password
	 */
	private $password;

	/**
	 * base de données où se connecter
	 * @var string $db
	 */
	private $db;

	/**
	 * Sgbd utilisé (MYSQL ou PGSQL)
	 * @var integer
	 */
	private $dbms = self::DBMS_MYSQL_PDO;

	/**
	 * Indique si la connexion est ouverte
	 * @var boolean
	 */
	private $stream = false;

	/**
	 * Chemin de stockage du cache
	 *
	 * @var string
	 */
	private $cachePath = 'cache/db';

	/**
	 * Chemin de stockage des logs
	 *
	 * @var string
	 */
	public $logPath = 'dblog.htm';

	/**
	 * nombre de requetes select effectuées
	 * @var integer $select
	 * @see log()
	 * @see getRequestCount()
	 */
	private $select = 0;

	/**
  	 * nombre de requetes update effectuées
	 * @var integer
	 * @see log()
	 * @see getRequestCount()
	 */
	private $update = 0;

	/**
	 * nombre de requetes insert effectuées
	 * @var integer
	 * @see log()
	 * @see getRequestCount()
	 */
	private $insert = 0;

	/**
	 * nombre de requetes delete effectuées
	 * @var integer
	 * @see log()
	 * @see getRequestCount()
	 */
	private $delete = 0;

	/**
	 * nombre de requetes autres effectuées
	 * @var integer
	 * @see log()
	 * @see getRequestCount()
	 */
	private $others = 0;

	/**
	 * Tableau des requétes effectuées
	 * @var array
	 * @see queryDB()
	 */
	private $requestList = array();

	/**
	 * Indique si on doit utiliser le systéme de cache ou non
	 * @var boolean
	 * @see startCache()
	 * @see endCache()
	 */
	private $cache = false;

	/**
	 * Variable pour stocker la requete complete en mode groupé
	 */
	private $request;

	/**
	 * Mode groupé
	 */
	private $global_transaction;

	private $affectedRows = false;

	/********************************
	******       METHODES       *****
	********************************/

	/**
	 * Crée une connexion à la base de données
	 *
	 * Il est possible de passer un tableau de paramètres (server,user,password,db),
	 * s'il n'y en a pas, les paramétres de connexion par défaut sont utilisés
	 * @param array(string) $param paramétres de connexion (facultatifs)
	 */
	public function __construct($server, $user, $password, $db = false){
	    $this->server = $server;
	    $this->user = $user;
	    $this->password = $password;
		$this->db = $db;
		$this->request = array();
	}

	public function getDBServer(){
		return $this->server;
	}

	public function getDBUser(){
		return $this->user;
	}

	public function getDBPassword(){
		return $this->password;
	}

	public function getDBName(){
		return $this->db;
	}

	public function getStream(){
		if(!$this->stream){
			$this->open();
		}
		return $this->stream;
	}

	public function __destruct(){
		$this->close();
    }

	/**
	 * Ouvre une connexion é la base de données
	 */
	public function open($connexion = false){
		if($connexion){
			$this->stream = $connexion;
		}else{
		    switch($this->dbms){
			case self::DBMS_MYSQL:
				$this->stream = mysql_connect($this->server,$this->user,$this->password, true);
				if(!$this->stream){
					throw new DatabaseException('Connexion au serveur de base de données impossible.');
				}
				if($this->db){
					if(!mysql_select_db($this->db,$this->stream)){
						throw new DatabaseException('Sélection de la base de donnée impossible.');
					}
				}
				mysql_query('SET NAMES "utf8"', $this->stream);
				break;
			case self::DBMS_MYSQL_PDO:
				$this->stream = new \PDO('mysql:host='.$this->server.';dbname='.$this->db, $this->user, $this->password, array(
					\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
					\PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_OBJ,
					\PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'
				));
				if(!$this->stream){
					throw new DatabaseException('Connexion au serveur de base de données impossible.');
				}
				break;
			case self::DBMS_PGSQL:
				$this->stream = @pg_connect('host='.$this->server
					.' port='.$this->port
					.' dbname='.$this->db
					.' user='.$this->user
					.' password='.$this->password);
				if(!$this->stream){
					throw new DatabaseException('Connexion au serveur de base de données impossible.');
				}
				break;
		    default:
				throw new DatabaseException('SGBD non supporté : '.$this->dbms);
			}
		}
	}

	/**
	 * Ferme la connexion é base de données
	 */
	public function close(){
		switch($this->dbms){
		case self::DBMS_MYSQL:
	    	@mysql_close($this->stream);
	    	break;
		case self::DBMS_PGSQL:
	    	@pg_close($this->stream);
	    	break;
	    }
		$this->stream = false;
	}

	/**
	 * Démarre le cache
	 */
	public function startCache($nom){
	    $this->cache = $nom;
	}

	/**
	 * Termine le cache
	 */
	public function endCache(){
	    $this->cache = false;
	}

	/**
	 * Supprime le cache
	 */
	public function delCache($nom){
	    $dir = opendir($this->cachePath);
	    $l = strlen($nom) + 1;
		while($f = readdir($dir)){
	        if(substr($f,0,$l) == $nom.'_')
	            unlink($this->cachePath.$f);
	    }
	    closedir($dir);
	}

	public function getTableColumnList($table){
		$list = array();
		$q = $this->queryDB('SHOW COLUMNS FROM '.$table);
		while(($r = $this->fetch($q)) !== false){
			$list[] = $r->Field;
		}
		return $list;
	}

	public function columnExists($table, $column){
		return $this->fetch($this->queryDB('SHOW COLUMNS FROM '.$table.' LIKE "'.$column.'"'))?true:false;
	}

	public function tableExists($table){
		return $this->fetch($this->queryDB('SHOW TABLES LIKE "'.$table.'"'))?true:false;
	}

	/**
	 * Formate un résultat de requéte au format donné
	 *
	 * Liste des formats supportés : array,assoc,fields,lengths,object,row
	 *
	 * @param mixed $result résultat d'une requéte select
	 * @param integer $fetch format souhaité
	 * @return mixed résultat de la requéte au format spécifié
	 */
	private function fetch($result, $fetch = self::FETCH_OBJECT){
		switch($this->dbms){
		case self::DBMS_MYSQL:
			switch($fetch){
			case self::FETCH_ARRAY:
			    $res = mysql_fetch_array($result);
			    break;
			case self::FETCH_ROW:
			    $res = mysql_fetch_row($result);
			    break;
			case self::FETCH_ASSOC:
			case self::FETCH_UNIQUE:
			    $res = mysql_fetch_assoc($result);
			    break;
			case self::FETCH_OBJECT:
				$res = mysql_fetch_object($result);
			    break;
			default:
			    throw new DatabaseException('Erreur select() : Format '.$fetch.' inconnu.',E_DATA);
			}
			break;
		case self::DBMS_MYSQL_PDO:
			$pdoFetch = false;
			switch($fetch){
			case self::FETCH_ARRAY:
			case self::FETCH_UNIQUE:
			    $pdoFetch = \PDO::FETCH_ASSOC;
			    break;
			case self::FETCH_ROW:
			    $pdoFetch = \PDO::FETCH_NUM;
			    break;
			case self::FETCH_ASSOC:
			    $pdoFetch = \PDO::FETCH_ASSOC;
			    break;
			case self::FETCH_OBJECT:
			    $pdoFetch = \PDO::FETCH_OBJ;
			    break;
			default:
			    throw new DatabaseException('Erreur select() : Format '.$fetch.' inconnu.',E_DATA);
			}
			$res = $result->fetch($pdoFetch);
			break;
		case self::DBMS_PGSQL:
			switch($fetch)
			{
			case self::FETCH_ARRAY:
			    $res = pg_fetch_array($result);
			    break;
			case self::FETCH_ROW:
			    $res = pg_fetch_row($result);
			    break;
			case self::FETCH_ASSOC:
			    $res = pg_fetch_assoc($result);
			    break;
			case self::FETCH_OBJECT:
			    $res = pg_fetch_object($result);
			    break;
			default:
			    throw new DatabaseException('Erreur select() : Format '.$fetch.' inconnu ou non supporté.',E_DATA);
			}
			break;
	    }
		return $res;
	}

	/**
	 * Alias fonction query
	 * @deprecated
	 * @see Database::query
	 *
	 * @param string $request requete é effectuer
	 * @param string $commentaire Commentaire sur la requéte
	 * @return mixed résultat de la requéte (ressource mysql result)
	 */
	public function queryDB($request, $args = array(), $commentaire = false){
		return $this->query($request, $args, $commentaire);
	}

	/**
	 * Effectue une requête quelconque
	 *
	 * Le résultat retourné est celui retourné par la fonction mysql_query()
	 * Il est possible de mettre en forme le résultat via la méthode fetch
	 *
	 * @param string $request requete é effectuer
	 * @param string $commentaire Commentaire sur la requéte
	 * @return mixed résultat de la requéte (ressource mysql result)
	 */
	public function query($request, $args = array(), $commentaire = false){
	    if(!$this->stream){
	        $this->open();
	    }

	    if($commentaire){
			$this->requestList[] = $request.' ['.$commentaire.']';
	    }else{
			$this->requestList[] = $request;
	    }
	    switch(strtoupper(substr($request,0,6))){
		case 'SELECT':
		    $this->select++;
			break;
		case 'INSERT':
		case 'REPLAC':
			$this->insert++;
			break;
		case 'UPDATE':
		    $this->update++;
			break;
		case 'DELETE':
		    $this->delete++;
			break;
		default:
		    $this->others++;
		}

		$this->affectedRows = false;
		$error = false;
		switch($this->dbms){
		case self::DBMS_MYSQL:
		    $result = @mysql_query($request, $this->stream);
		    $error = mysql_error($this->stream);
		    break;
		case self::DBMS_MYSQL_PDO:
			try{
				$result = $this->stream->prepare($request);
				if(!is_array($args)){
					$args = array($args);
				}
				$result->execute($args);
			}catch(\PDOException $e){
				$error = $e->getMessage();
			}
			break;
		case self::DBMS_PGSQL:
		    $result = @pg_query($this->stream, $request);
		    $error = pg_last_error($this->stream);
		    break;
		}
		if($error){
			throw new DatabaseException($error, $request, $args);
		}else{
			switch($this->dbms){
				case self::DBMS_MYSQL:
					$this->affectedRows = mysql_affected_rows($this->stream);
					break;
				case self::DBMS_MYSQL_PDO:
					$this->affectedRows = $result->rowCount();
					break;
				case self::DBMS_PGSQL:
					$this->affectedRows = pg_affected_rows($this->stream);
					break;
			}
			return $result;
		}
	}

	public function preparedSelect($request, $args = array(), $mode = false, $fetch = self::FETCH_OBJECT){
		if($fetch == 'assoc'){
			$fetch = self::FETCH_ASSOC;
		}elseif($fetch == 'object'){
			$fetch = self::FETCH_OBJECT;
		}elseif($fetch == 'array'){
			$fetch = self::FETCH_ARRAY;
		}elseif($fetch == 'row'){
			$fetch = self::FETCH_ROW;
		}
     	if(!$this->cache || !file_exists($this->cachePath.$this->cache.'_'.md5($request))){

	        if($mode == self::RES_UNIQUE && substr($request,-7) != 'LIMIT 1'){
	            $request .= ' LIMIT 1';
	        }

			if($this->cache){
				$result = $this->queryDB('SELECT '.$request, $args, 'création de cache "'.$this->cache.'"');
	    	}else{
				$result = $this->queryDB('SELECT '.$request, $args);
			}
			$tab_res = array();
        	while(($res = $this->fetch($result, $fetch)) !== false){
				if($mode == self::INDEX_ID && $fetch == self::FETCH_OBJECT){
					$tab_res[$res->id] = $res;
				}elseif($mode == self::INDEX_ID){
					if($fetch == self::FETCH_UNIQUE){
						$tab_res[$res['id']] = end($res);
					}else{
						$tab_res[$res['id']] = $res;
					}
				}elseif($fetch == self::FETCH_UNIQUE){
					$tab_res[] = end($res);
				}else{
					$tab_res[] = $res;
				}
			}
			switch($this->dbms){
			case self::DBMS_MYSQL:
				mysql_free_result($result);
				break;
			case self::DBMS_PGSQL:
			    pg_free_result($result);
			    break;
			}
			//$this->close();
			if($mode == self::RES_UNIQUE && sizeof($tab_res) == 0){
			    return false;
	    	}elseif($mode == self::RES_UNIQUE){
			    return $tab_res[0];
			}

			if($this->cache){
				file_put_contents($this->cachePath.$this->cache.'_'.md5($request),serialize($tab_res));
			}
			return $tab_res;
		}else{
	        return unserialize(file_get_contents($this->cachePath.$this->cache.'_'.md5($request),true));
	    }
	}

	/**
	 * Effectue une requéte de sélection dans la base de données
	 *
	 * Il est possible de choisir le format de retour des données
	 * (voir méthode fetch) par défaut le format est 'object'.
	 * Si la requéte ne retourne aucun résultat, on retourne un tableau
	 * vide.
	 *
	 * @param string $request requete (sans le 'SELECT ')
	 * @param integer $mode Mode de sélection (normal, INDEX_ID ou RES_UNIQUE)
	 * @param string $fetch format des données é retourner (objet par défaut)
	 * @return mixed le tableau des résultats au format souhaité ou l'objet résultat ou FAUX (mode RES_UNIQUE)
	 */
	public function select($request, $mode = false, $fetch = self::FETCH_OBJECT){
		return $this->preparedSelect($request, array(), $mode, $fetch);
	}

	/**
	 * Effectue une requete d'insertion dans la base de donnée
	 *
	 * Si le tableau de valeur est indexé par des clés non numériques,
	 * alors ces clés sont prises comme champs
	 *
	 * @param string $table table à insérer
	 * @param mixed $tab_val tableau contenant les donnée é insérer, ou objet data
	 * @return integer id de l'objet inséré
	 */
	public function insert(Data $data){
		$table = $data->getTable();
		$replace = $data->allowReplace();
		$tab_val = $data->toArray();

		$tab_champs = array_keys($tab_val);
		if(sizeof($tab_val) == 0 || is_numeric($tab_champs[0])){
		    $champs = '';
		}else{
			$champs = ' (`'.implode('`,`',$tab_champs).'`)';
		}
		$valeurs = '('.implode(',',$tab_val).')';

		if($replace){
			$action = 'REPLACE';
		}else{
			$action = 'INSERT';
		}
		$query = $action.' INTO `'.$table.'`'.$champs.' VALUES '.$valeurs;
		if(!$this->global_transaction){
			if($this->queryDB($query)){
				return $this->getLastInsertId();
			}else{
				return $id;
			}
		}else{
			$this->request[] = $query;
		}
	}

	public function getLastInsertId(){
		switch($this->dbms){
		case self::DBMS_MYSQL:
  			return mysql_insert_id($this->stream);
		case self::DBMS_MYSQL_PDO:
  			return $this->stream->lastInsertId();
		case self::DBMS_PGSQL:
  			return pg_last_oid($this->stream);
		}
		return false;
	}

	/**
	 * Effectue une requete update dans la base de donnée
	 *
	 * @param string $table table é actualiser
	 * @param array $tab_val tableau champ => nouvelle valeur ou objet data
	 * @param string $condition filtre les entrées é modifier (toutes par défaut)
	 * @param array $args Arguments pour une requête préparée
	 * @param boolean $backquotes Mettre é faux si vous ne voulez pas protéger les nom de champ par des backquotes
	 * @return integer nombre de lignes affectées
	 */
	public function update(Data $data, $condition = '1', $args = array(), $backquotes = true){
	    $table = $data->getTable();
		$tab_val = $data->toArray();
		if(count($tab_val) == 0){
			return 0;
		}

		$valeurs = '';
		foreach($tab_val as $champ => $val){
		    if($val === false)
		        $val = 0;
			elseif($val === '')
			    $val = 'NULL';
		    if($backquotes)
				$valeurs .= '`'.$champ.'`='.$val.',';
			else
				$valeurs .= $champ.'='.$val.',';
		}
		$valeurs = substr($valeurs,0,-1);
		
		$query = 'UPDATE `'.$table.'` SET '.$valeurs.' WHERE '.$condition;

		if(!$this->global_transaction){
			$this->queryDB($query, $args);
			return $this->getAffectedRows();
		}else{
			$this->request[] = $query;
		}
	}

	public function getAffectedRows(){
		return $this->affectedRows;
	}

	/**
	 * Effectue une requete delete dans la base de donnée
	 *
	 * Si la condition est un nombre alors on supprimera l'enregistrement
	 * dont le champ 'id' est égal é ce nombre, sinon on effectue la condition
	 * telle quelle.
	 *
	 * @param string $table table à actualiser
	 * @param mixed $condition Identifiant ou condition
	 * @param string Champs à supprimer
	 * @return integer nombre de lignes affectées
	 */
	public function delete($table, $condition, $args = array(), $selection = ''){
		if(is_numeric($condition)){
			$condition = 'id='.$condition;
		}
		if($this->queryDB('DELETE '.$selection.' FROM '.$table.' WHERE '.$condition, $args)){
			return $this->getAffectedRows();
		}else{
			return false;
		}
	}

	/**
	 * Dit s'il exists au moins un enregistrement dans une table
	 *
	 * Il est possible de définir des conditions pour cet enregistrement
	 *
	 * @param string $table Table oé faire la recherche
	 * @param string $conditions Condition de recherche
	 * @return boolean Existence ou non d'au moins un enregistrement
	 */
	public function exists($table, $conditions = 1, $args = array()){
		$res = $this->preparedSelect('COUNT(*) AS nb FROM '.$table.' WHERE '.$conditions.' LIMIT 1', $args);
		return ($res[0]->nb > 0);
	}

	public function escape($string){
		switch($this->dbms){
			case self::DBMS_MYSQL:
				return mysql_real_escape_string($string, $this->getStream());
			case self::DBMS_MYSQL_PDO:
				return substr($this->getStream()->quote($string), 1, -1);
			default:
				throw DatabaseException('escape not implemented for DBMS '.$this->dbms);
		}
	}

	/**
	 * Retourne le nombre d'enregistrements de la table pour les conditions voulues
	 *
	 * Les conditions sont facultatives.
	 *
	 * @param string $table Table(s) oé effectuer les recherches
	 * @param integer $conditions Conditions de recherche
	 * @return integer Nombre d'enregistrements correspondants
	 */
	public function count($table, $conditions = 1, $args = array()){
		$res = $this->preparedSelect('COUNT(*) as nb FROM '.$table.' WHERE '.$conditions, $args);
		return (int)$res[0]->nb;
	}

	/**
	 * Retourne le nombre de requetes total depuis le début de la connection
	 *
	 * @return integer nombre de requetes
	 */
	public function getRequestCount(){
		return $this->select + $this->insert + $this->update + $this->delete + $this->others;
	}

	public function getLastQuery(){
		return end($this->requestList);
	}

	/**
	 * Enregistre la liste des requétes effectuées dans le fichier de log ou l'affiche é l'écran
	 *
	 * @param boolean $log Mettre à vrai pour enregistrer le résultat au lieu de l'afficher
	 */
	public function log($logToFile = false){
		$str = '<div style="text-align:center;position:relative;z-index:1000">'.NL;
		$str .= '<div style="background-color:white;border:black solid 1px">'.NL;
		$str .= '<b>Résumé des requétes :</b><br />'.NL;
		$str .= 'SELECT : '.$this->select.'<br />'.NL;
		$str .= 'INSERT : '.$this->insert.'<br />'.NL;
		$str .= 'UPDATE : '.$this->update.'<br />'.NL;
		$str .= 'DELETE : '.$this->delete.'<br />'.NL;
		$str .= 'Autres : '.$this->others.'<br /><br />'.NL;
		$str .= '<b>Soit '.$this->getRequestCount().' requétes au total.</b><br /><br />'.NL.NL;
		$str .= '<b>Liste des requétes effectuées :</b><br />'.NL;
		foreach($this->requestList as $request)
			$str .= '<div style="'.self::REQUEST_HTML_STYLE.'">'.nl2br($request).'</div><br />'.NL;
		$str .= '</div>';
		$str .= '</div>';

		if($logToFile){
			$logPath = $logToFile;
			if($logPath === true){
				$logPath = $this->logPath;
			}
			$f = @fopen($logPath,'w');
			if($f){
				fwrite($f,'<html><body>');
				fwrite($f,$str);
				fwrite($f,'</body></html>');
				fclose($f);
			}
		}else{
		    echo $str;
		}
	}

	/**
	 * Retourne la liste des tables de la base de données
	 *
	 * @return array Liste des tables
	 */
	public function getTables(){
		switch($this->dbms){
		case self::DBMS_MYSQL:
		case self::DBMS_MYSQL_PDO:
		    $result = $this->queryDB('SHOW TABLES');
			$tab_res = array();
			while($res = $this->fetch($result,self::FETCH_ROW)){
				$tab_res[] = $res[0];
			}
			if($this->dbms == self::DBMS_MYSQL){
				mysql_free_result($result);
			}
			break;
		case self::DBMS_PGSQL:
		    $tab_res = $this->select('tablename FROM pg_tables WHERE tableowner = current_user',false,self::FETCH_ROW);
			break;
		}
		return $tab_res;
	}

	/**
	 * Vérifie une table et retourne faux si elle est corrompue
	 *
	 * Une table est corrompue si la derniére ligne de la requéte CHECK TABLE est différente de OK
	 * @param string $table Table é vérifier
	 * @return boolean Vrai si la table est intacte, faux sinon
	 */
	public function checkTable($table){
		switch($this->dbms)
		{
		case self::DBMS_MYSQL:
		    $result = $this->queryDB('CHECK TABLE '.$table);
			while($res = $this->fetch($result,'object'))
			{
				$intacte = $res->Msg_text;
			}
			mysql_free_result($result);
			return ($intacte == 'OK');
			break;
		default:
		    throw new DatabaseException('Cette fonction n\'est utilisable que par mysql.');
		}
	}

	/**
	 * Répare une table corrompue
	 *
	 * @param string $table Table é réparer
	 */
	public function repairTable($table){
		switch($this->dbms){
		case self::DBMS_MYSQL:
		    $this->queryDB('REPAIR TABLE '.$table);
			break;
		default:
		    throw new DatabaseException('Cette fonction n\'est utilisable que par mysql.');
		}
	}

	public function beingDBQuery(){
		$this->global_transaction = true;
	}

	public function endDBQuery(){
		if(count($this->request) != 0){
			$this->open();
			foreach($this->request as $request){
				switch($this->dbms){
				case self::DBMS_MYSQL:
				    $result = @mysql_unbuffered_queryDB($request, $this->stream);
			 	   $error = mysql_error($this->stream);
				    break;
				case self::DBMS_PGSQL:
				    $result = @mysql_unbuffered_queryDB($this->stream, $request);
				    $error = pg_last_error($this->stream);
				    break;
				}
			}
			$this->request = array();
			$this->close();
		}
		$this->global_transaction = false;
	}

	public function startTransaction(){
		switch($this->dbms){
			case self::DBMS_MYSQL:
				$this->queryDB('BEGIN');
				break;

			case self::DBMS_MYSQL_PDO:
				return $this->stream->beginTransaction();

			default:
			    throw new DatabaseException('Cette fonction n\'est utilisable que par mysql.');
		}
	}

	public function commit(){
		switch($this->dbms){
			case self::DBMS_MYSQL:
				$this->queryDB('COMMIT');
				break;

			case self::DBMS_MYSQL_PDO:
				return $this->stream->commit();

			default:
			    throw new DatabaseException('Cette fonction n\'est utilisable que par mysql.');
		}
	}

	public function rollback(){
		switch($this->dbms){
			case self::DBMS_MYSQL:
				$this->queryDB('ROLLBACK');
				break;

			case self::DBMS_MYSQL_PDO:
				return $this->stream->rollback();

			default:
			    throw new DatabaseException('Cette fonction n\'est utilisable que par mysql.');
		}
	}
}
