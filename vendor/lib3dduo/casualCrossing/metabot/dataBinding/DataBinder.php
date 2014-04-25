<?php
namespace lib3dduo\casualCrossing\metabot\dataBinding;

use lib3dduo\database\Data;

use lib3dduo\database\Database;

use lib3dduo\casualCrossing\metabot\MetaBot;

/**
 * Classe abstraite de gestion de données
 * 
 * Chaque type de donnée à gérer doit se faire en créant une classe fille de DataBinder.
 * La classe DataBinder se charge de gérer les routines et fournir des méthodes utilitaires
 * comme fournir l'accès à la base de donnée, récupérer les données utilisateur ou projet s'il y en a,
 * ou encore formatter les clauses de filtrages.
 * 
 * La seule méthode à implémenter est getData, pour la récupération d'information, 
 * le reste est facultatif et dépend des besoin de la donnée à gérer (update, delete, fileUpload...)
 * 
 * @author no
 *
 */
abstract class DataBinder{

	/**
	 * Base de données
	 * @var Database
	 */
	private $db;

	/**
	 * Gestionnaire d'utilisateurs (facultatif)
	 * @var UserManager
	 */
	private $userManager = false;
	
	/**
	 * Gestionnaire de projets (facultatif)
	 * @var ProjectManager
	 */
	private $projectManager = false;
	
	/**
	 * Liste des chemins où récupérer les classes de gestion de données
	 * @var array(string)
	 */
	private static $dataBindingPathList = array('app/src/dataBinding/');
	
	/**
	 * Initialise le gestionnaire de données en chargeant les différents manager
	 * 
	 * @param MetaBot $metaBot Référence sur l'instance générale de MetaBot
	 */
	public function __construct(MetaBot $metaBot){
		$this->db = $metaBot->getDB();
		
		$this->userManager = $metaBot->getUserManager();

		$this->projectManager = $metaBot->getProjectManager();
		
		$this->init();
	}
	
	public function init(){
		
	}
	
	/**
	 * Vérifie l'autorisation en lecture pour un niveau d'accès donné
	 * 
	 * Cette méthode doit être surchargée si l'on souhaite restreindre l'accès aux données.
     * S'il n'y a pas d'userAccessManager accessLevel est à PHP_INT_MAX
	 * 
	 * @param number $level Niveau d'accès
	 * @return number Type d'accès autorisé 
	 */
	public function getAccessLevelType($level){
		return AccessLevelType::FULL;
	}
	
	/**
	 * Vérifie l'autorisation en lecture d'un type de lien pour un niveau d'accès donné
	 * 
	 * Cette méthode doit être surchargée si l'on souhaite restreindre l'accès aux liens.
	 * 
	 * @param number $level Niveau d'accès
	 * @param string $linkTableName Nom de la table de lien
	 * @return number Type d'accès autorisé 
	 */
	public function getLinkAccessLevelType($level, $linkTableName){
		return AccessLevelType::FULL;
	}
	
	/**
	 * Indique s'il est possible d'effectuer un process pour un niveau d'accès donné
	 * 
	 * Cette méthode doit être surchargée si l'on souhaite restreindre l'accès aux process.
	 * 
	 * @param number $accessLevel Niveau d'accès
	 * @param string $processId Type de process
	 * @return boolean TRUE si l'accès est autorisé
	 */
	public function canProcess($accessLevel, $processId){
		return true;
	}

	/**
	 * Ajoute un chemin où récupérer les classe de binding de données
	 * 
	 * Le chemin doit être relatif à la racine du projet
	 * 
	 * @param string $path Chemin à ajouter
	 */
	public static function addDataBindingPath($path){
		self::$dataBindingPathList[] = $path;
	}
	
	/**
	 * Instancie la classe de binding
	 * 
	 * @param MetaBot $metaBot
	 * @param string $binderClass
	 * @return DataBinder|boolean
	 */
	public static function getBinder(MetaBot $metaBot, $binderClass){
		$binderClassName = ucfirst($binderClass);
		foreach(self::$dataBindingPathList as $path){
			$path = PROJECT_PATH.$path.$binderClassName.'.php';
			if(file_exists($path)){
				require_once($path);
				$fullClassName = 'lib3dduo\\casualCrossing\\metabot\\dataBinding\\'.$binderClassName;
				return new $fullClassName($metaBot);
			}
		}
		return false;
	}
	
	/**
	 * Retourne la base de données
	 * 
	 * @return Database Base de données
	 */
	public function getDB(){
		return $this->db;
	}

	/**
	 * Récupère l'id du projet s'il y a un gestionnaire de projets
	 *
	 * @return number Id du projet ou -1 s'il n'y a pas de gestionnaire de projets
	 */
	public function getProjectId(){
		return $this->projectManager?$this->projectManager->getProjectId():-1;
	}
	
	/**
	 * Récupère les données du projet s'il y a un gestionnaire de projets
	 *
	 * Les données sont retournées telles que fournies par le gestionnaire de projets.
	 * S'il n'y en a pas, on retourne false.
	 * 
	 * @return mixed|boolean Données du projet ou false s'il n'y a pas de gestionnaire de projets 
	 */
	public function getProjectData(){
		return $this->projectManager?$this->projectManager->getProjectData():false;
	}
	
	/**
	 * Retourne le projectManager
	 * @return \lib3dduo\casualCrossing\metabot\dataBinding\ProjectManager|boolean ProjectManager ou false s'il n'y en a pas
	 */
	public function getProjectManager(){
		return $this->projectManager;
	}

	/**
	 * Récupère l'id de l'utilisateur s'il y a un gestionnaire d'utilisateurs
	 *
	 * @return number Id de l'utilisateur ou -1 s'il n'y a pas de gestionnaire d'utilisateurs
	 */
	public function getUserId(){
		return $this->userManager?$this->userManager->getUserId():-1;
	}
	
	/**
	 * Récupère les données
	 * 
	 * Les données doivent être retournée sous forme de tableau php
	 * contenant la liste des entrées elles même sous forme de tableau clé=>valeur
	 */
	public abstract function getData();
	
	/**
	 * Ajoute ou modifie des données
	 * 
	 * @param number|boolean $id Id de la donnée à modifier (false si c'est une nouvelle)
	 */
	public function addData($id){
		echo 'addData not implemented';
	}
	
	/**
	 * Récupère le nom de la table pour l'enregistrement des positions
	 *
	 * @return string Nom de la table
	 */
	public function getMapTableName(){
		echo 'getMapTableName not implemented';
		return false;
	}
	
	/**
	 * Récupère le nom de la table pour l'enregistrement des liens
	 *
	 * @return string Nom de la table
	 */
	public function getMapLinkTableName(){
		echo 'getMapLinkTableName not implemented';
		return false;
	}
	
	/**
	 * Récupère le nom du champ pour enregistrer le point source d'un lien
	 *
	 * @return string Nom du champ
	 */
	public function getMapLinkFromFieldName(){
		echo 'getMapLinkFromFieldName not implemented';
		return false;
	}
	
	/**
	 * Récupère le nom du champ pour enregistrer le point destination d'un lien
	 *
	 * @return string Nom du champ
	 */
	public function getMapLinkToFieldName(){
		echo 'getMapLinkToFieldName not implemented';
		return false;
	}
	
	/**
	 * Récupère le nom du champ pour enregistrer la position x
	 *
	 * @return string Nom du champ
	 */
	public function getMapXFieldName(){
		echo 'getMapXFieldName not implemented';
		return false;
	}
	
	/**
	 * Récupère le nom du champ pour enregistrer la position y
	 *
	 * @return string Nom du champ
	 */
	public function getMapYFieldName(){
		echo 'getMapYFieldName not implemented';
		return false;
	}
	
	/**
	 * Supprime une donnée
	 * 
	 * @param number $id Id de la donnée à supprimer
	 */
	public function deleteData($id){
		echo 'deleteData not implemented';
	}
	
	/**
	 * Uploade un fichier
	 * 
	 * Lors de l'appel à la méthode uploadFile, le fichier est déjà uploadé dans un dossier temporaire.
	 * Toutes les informations sont passées dans le paramètre $fileInfo qui correspond à l'entrée $_FILE du fichier.
	 * 
	 * C'est donc lors de l'implémentation qu'il faut récupérer le fichier avec move_uploaded_file, si celui-ci doit être conservé.
	 * 
	 * @param string $uploadId Id lié au bouton d'upload
	 * @param number|boolean $id Id de l'entrée correspondante ou false s'il n'y en a pas
	 * @param array $filePath Donnée du fichier uploadé (entrée $_FILE correspondante) 
	 * @param array $customData Données supplémentaires
	 * @return boolean Upload effectué avec succès ou non
	 */
	public function uploadFile($uploadId, $id, $fileInfo, $customData){
		echo 'File upload not implemented';
		return false;
	}
	
	/**
	 * Lance un process
	 * 
	 * @param string $processId Type de process
	 * @param number|boolean $id Id de la donnée (false si le process n'est pas liée à une entrée)
	 * @param array $customData Données supplémentaires
	 * @return boolean Process effectué avec succès ou non
	 */
	public function process($processId, $id, $customData){
		echo 'Processing not implemented';
		return false;
	}
	
	/**
	 * Construit la clause WHERE en fonction des paramètres de requête envoyés par MetaBot
	 * 
	 * Le filtrage ne s'effectue que sur une table, par défaut ce sont les champs id, identifier, name et name_lc qui sont utilisés pour la recherche
	 * mais il est possible d'en spécifier d'autres (il faut alors respécifier la liste complète).
	 * 
	 * @param string $table Table à filtrer
	 * @param string $prefix Préfix de la table
	 * @param array|boolean $searchFields Liste des champ pour la recherche
	 * @param string $restrictFields Champs à exclure du filtrage
	 * @return string Clause WHERE à inclure dans la requête, de la forme "([clause])" ou "1" s'il n'y a aucun filtrage
	 */
	public function buildWhereClause($table, $prefix = '', $searchFields = false, $restrictFields = false){
		if($prefix){
			$prefix .= '.';
		}
		$columnList = $this->db->getTableColumnList($table);
		$where = '';
		if(!$searchFields){
			$searchFields = array();
			if(in_array('id', $columnList) && (!$restrictFields || in_array('id', $restrictFields))){
				$searchFields[] = $prefix.'id';
			}
			if(in_array('name', $columnList) && (!$restrictFields || in_array('name', $restrictFields))){
				$searchFields[] = $prefix.'name';
			}
			if(in_array('name_lc', $columnList) && (!$restrictFields || in_array('name_lc', $restrictFields))){
				$searchFields[] = $prefix.'name_lc';
			}
			if(in_array('identifier', $columnList) && (!$restrictFields || in_array('identifier', $restrictFields))){
				$searchFields[] = $prefix.'identifier';
			}
		}
		if(isset($_REQUEST['search']) && count($searchFields) > 0){
			$where .= ' AND (';
			$or = false;
			foreach($searchFields as $f){
				if($or){
					$where .= ' OR ';
				}else{
					$or = true;
				}
				$where .= $f.' LIKE "%'.$this->db->escape($_REQUEST['search']).'%"';
			}
			$where .= ')';
		}
		foreach($columnList as $col){
			if($this->projectManager && $col == $this->projectManager->getProjectFieldName()){
				$where .= ' AND '.$prefix.$col.'='.$this->projectManager->getProjectId();
			}else if(isset($_REQUEST[$col]) && (!$restrictFields || in_array($col, $restrictFields))){
				$id = (int)$_REQUEST[$col];
				// On check s'il y a un système de parent
				if($col == 'parent'){
					$prefixList = array($table);
				}else{
					$prefixList = array('G'.$col, 'C'.$col, 'M'.$col, $col, $table.ucfirst($col));
				}
				$childList = array();
				foreach($prefixList as $tablePrefix){
					if($this->db->tableExists($tablePrefix) && $this->db->columnExists($tablePrefix, 'parent')){
						$data = $this->db->select('id, parent FROM '.$tablePrefix, Database::INDEX_ID, Database::FETCH_UNIQUE);
						$childList = array($id);
						foreach($data as $d => $p){
							if($d != $id){
								if($p == $id){
									$childList[] = $d;
								}else{
									while(isset($data[$p])){
										$p = $data[$p];
										if($p == $id){
											$childList[] = $d;
											break;
										}
									}
								}
							}
						}
						break;
					}
				}
				if(count($childList) > 0){
					$where .= ' AND '.$prefix.$col.' IN('.implode(',', $childList).')';
				}else{
					$where .= ' AND '.$prefix.$col.'='.$id;
				}
			}
		}
		if(trim(@$_REQUEST['exclude']) != ''){
			$where .= ' AND '.$prefix.'id NOT IN('.$this->db->escape($_REQUEST['exclude']).')';
		}
		
		$where = trim(substr($where, 4));
		if($where == ''){
			$where = '1';
		}else{
			$where = '('.$where.')';
		}
		return $where;
	}
	
	public function handleGet($accessLevel){
		if($this->getAccessLevelType($accessLevel) >= AccessLevelType::GET){
			echo json_encode(array(
				'data' => $this->getData()
			));
		}else{
			echo NL.'Access not granted for level '.$accessLevel;
		}
	}
	
	protected function castId(){
		return true;
	}
	
	public function handleAdd($accessLevel){
		if(isset($_REQUEST['id'])){
			$id = $_REQUEST['id'];
			if($this->castId()){
				$id = (int)$id;
			}
		}else{
			$id = false;
		}
		$accessLevelType = $this->getAccessLevelType($accessLevel);
		if($accessLevelType >= AccessLevelType::CREATE || ($id && $accessLevelType >= AccessLevelType::UPDATE)){
			$result = $this->addData($id);
			if($result){
				echo $id?NL._2('Modifications enregistrées'):NL._2('Nouvel élément ajouté');
			}
		}else{
			echo 'Access not granted for level '.$accessLevel;
		}
	}
	
	public function handleSaveMap($accessLevel){
		$positionData = json_decode($_REQUEST['positionData']);
		$linkData = json_decode($_REQUEST['linkData']);
		$deleteLinkData = json_decode($_REQUEST['deleteLinkData']);
		$accessLevelType = $this->getAccessLevelType($accessLevel);
		if($accessLevelType >= AccessLevelType::UPDATE){
			$tableName = $this->getMapTableName();
			$xFieldName = $this->getMapXFieldName();
			$yFieldName = $this->getMapYFieldName();
			if($tableName && $xFieldName && $yFieldName){
				$data = new Data($tableName);
				$saveCount = 0;
				foreach($positionData as $id => $pos){
					$data->addInt($xFieldName, $pos[0]);
					$data->addInt($yFieldName, $pos[1]);
					$saveCount += $this->db->update($data, 'id=?', $id);
				}
				echo NL.$saveCount.' positions modifiées';

				$linkTableName = $this->getMapLinkTableName();
				$fromFieldName = $this->getMapLinkFromFieldName();
				$toFieldName = $this->getMapLinkToFieldName();
				$linkCount = 0;
				$deleteLinkCount = 0;
				if($linkTableName && $fromFieldName && $toFieldName){
					$data = new Data($linkTableName, true);
					foreach($linkData as $link){
						$data->addRef($fromFieldName, $link[0]);
						$data->addRef($toFieldName, $link[1]);
						$this->db->insert($data);
						$linkCount++;
					}
					foreach($deleteLinkData as $link){
						$this->db->delete($linkTableName, $fromFieldName.'=? AND '.$toFieldName.'=?', $link);
						$deleteLinkCount++;
					}
				}
				echo NL.$linkCount.' liens enregistés';
				echo NL.$deleteLinkCount.' liens supprimés';
			}
		}else{
			echo 'Access not granted for level '.$accessLevel;
		}
	}
	
	public function handleDelete($accessLevel){
		if($this->getAccessLevelType($accessLevel) >= AccessLevelType::DELETE){

			$id = @$_REQUEST['id'];
			if($this->castId()){
				$id = (int)$id;
			}
			
			$this->deleteData($id);
			echo NL.'Elément supprimé';
		}else{
			echo NL.'Access not granted for level '.$accessLevel;
		}
	}
	
	public function handleUpload($accessLevel){
		if(isset($_REQUEST['id'])){
			$id = @$_REQUEST['id'];
			if($this->castId()){
				$id = (int)$id;
			}
		}else{
			$id = false;
		}
		$accessLevelType = $this->getAccessLevelType($accessLevel);
		if($accessLevelType >= AccessLevelType::CREATE || ($id && $accessLevelType >= AccessLevelType::UPDATE)){
			$customData = array();
			if(isset($_REQUEST['customData'])){
				$customData = json_decode($_REQUEST['customData'], true);
			}
			if($this->uploadFile($_REQUEST['uploadId'], $id, $_FILES[$_REQUEST['uploadId']], $customData)){
				echo NL._2('Fichier uploadé');
			}else{
				echo NL._2('Echec');
			}
		}else{
			echo NL.'Access not granted for level '.$accessLevel;
		}
	}
	
	public function handleProcess($accessLevel){
		ini_set('zlib.output_compression', 0);
		if(isset($_REQUEST['id'])){
			$id = @$_REQUEST['id'];
			if($this->castId()){
				$id = (int)$id;
			}
		}else{
			$id = false;
		}
		if(isset($_GET['modal'])){
			include __DIR__.'/../templates/process-header.tpl';
		}
		if(!$this->canProcess($accessLevel, $_REQUEST['processId'])){
			echo NL.'Access to "'.$_REQUEST['processId'].'" process not granted for level '.$accessLevel;
		}else{
			$customData = array();
			if(isset($_REQUEST['customData'])){
				$customData = json_decode($_REQUEST['customData'], true);
			}
			if($this->process($_REQUEST['processId'], $id, $customData)){
				if(isset($_GET['modal'])){
					echo NL.'Process "'.$_REQUEST['processId'].'" effectué';
				}
			}else{
				if(isset($_GET['modal'])){
					echo NL.'Process "'.$_REQUEST['processId'].'" échoué';
				}
			}
		}
		if(isset($_GET['modal'])){
			include __DIR__.'/../templates/process-footer.tpl';
		}
	}
}