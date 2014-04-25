<?php
namespace lib3dduo\casualCrossing\metabot;

use lib3dduo\database\Database;

/**
 * Gère l'accès et les informations de projets
 * 
 * Le project manager permet d'ajouter une notion de projet, compatible avec un système de droit (usermanager) pour metabot.
 * 
 * @author no
 *
 */
abstract class ProjectManager{

	const NO_PROJECT = -1;
	
	const UNVALID_PROJECT = -2;
	
	/**
	 * Initialise les données du projet
	 * 
	 * L'initialisation du projet se fait après l'initialisation du UserManager
	 */
	public abstract function init();
	
	/**
	 * Retourne le nom du champ contenant l'id du projet en bas
	 * 
	 * @return string nom du champ de projet en base
	 */
	public abstract function getProjectFieldName();
	
	/**
	 * Retourne le nom du projet
	 * 
	 * @return string|boolean le nom du projet, false si aucun nom
	 */
	public abstract function getProjectName();
	
	/**
	 * Retourne les données du projet
	 * 
	 * Les données sont au format propre à l'outil, et n'ont vocation à être utilisée que par l'outil, pas MetaBot.
	 * 
	 * @return object|boolean les données du projet
	 */
	public abstract function getProjectData();


	/**
	 * Indique si l'id du projet passé en argument est valide
	 *
	 * Un projet est considéré valide s'il existe et est accessible (notemment s'il y a un système d'utilisateur lié)
	 *
	 * @param number $projectId Id du projet à vérifier
	 * @return boolean Projet valide ou non
	 */
	public abstract function isValidProject($projectId);

	/**
	 * Demande l'id du projet à partir d'un projet donné
	 * @param number id du projet source
	 * @param string $projectType Type de projet demandé
	 * @return number
	 */
	public function getProjectIdForType($projectId, $projectType){
		echo 'getProjectIdForType not implemented';
		return self::NO_PROJECT;
	}
	
	/**
	 * Retourne l'id du projet, -1 si aucun projet sélectionné valide
	 * 
	 * @param string $projectType Type de projet demandé
	 * @return number id du projet, -1 sinon
	 */
	public final function getProjectId($projectType = false){
		$projectId = $this->getRequestProjectId();
		if(!$this->isValidProject($projectId)){
			$projectId = self::UNVALID_PROJECT;
		}else if($projectType){
			$projectId = $this->getProjectIdForType($projectId, $projectType);
		}
		return $projectId;
	}
	
	/**
	 * Retourne l'id du projet demandé, -1 si aucun projet sélectionné
	 * 
	 * 
	 * @return number id du projet, -1 sinon
	 */
	protected final function getRequestProjectId(){
		if(isset($_REQUEST[$this->getProjectFieldName()])){
			return (int)$_REQUEST[$this->getProjectFieldName()];
		}else{
			return self::NO_PROJECT;
		}
	}
	
	/**
	 * Indique si un projet est sélectionné ou non
	 * 
	 * @return boolean Projet sélectionné
	 */
	public final function hasProject(){
		return $this->getProjectId() > 0?true:false;
	}
	
	
}