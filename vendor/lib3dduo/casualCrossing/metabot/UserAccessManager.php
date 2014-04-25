<?php
namespace lib3dduo\casualCrossing\metabot;

/**
 * Gère les droits d'accès utilisateurs au différents menu et pages de l'application
 * 
 * @author no
 *
 */
abstract class UserAccessManager{

	/**
	 * Récupère le niveau d'accès par défaut
	 *
	 * La valeur est abstraite et sera directement gérée par les menus JS et classes de données PHP
	 * via les paramètre minAccessLevel et maxAccessLevel
	 * Un nombre plus grand implique un accès plus large, un nombre plus petit, un accès restreint.
	 *
	 * @return number Niveau d'accès par défaut de l'utilisateur
	 */
	public abstract function getDefaultAccessLevel();
	
	/**
	 * Récupère le niveau d'accès pour chaque menu
	 *
	 * Chaque niveau d'accès est indexé par l'id du menu correspondant.
	 * Si un menu n'est pas spécifié, c'est le niveau par défaut qui sera donné
	 *
	 * @see getDefaultAccessLevel
	 *
	 * @return array<string,number> Niveau d'accès de l'utilisateur pour chaque menu
	 */
	public abstract function getMenuAccessLevelList();
	
	/**
	 * Récupère le niveau d'accès pour chaque page
	 *
	 * Chaque niveau d'accès est indexé par l'id de la page correspondante.
	 * Si une page n'est pas spécifiée, c'est le niveau du menu qui sera donné
	 *
	 * @see getMenuAccessLevel
	 *
	 * @return array<string,number> Niveau d'accès de l'utilisateur pour chaque page
	 */
	public abstract function getPageAccessLevelList();
	
	/**
	 * Retourne les informations de bdd pour vérifier l'accès au données par des utilisateurs
	 * 
	 * Les informations doivent être retournée sous la forme :
	 * nomDeTable => array(
	 * 		'table' => Table de jointure,
	 * 		'dataField' => Champ pour la jointure sur la table principale,
	 * 		'userField' => Champ contenant l'id de l'utilisatur
	 * )
	 */
	public abstract function getDataUserAccessInfoList();
	
	/**
	 * Récupère le niveau d'accès une page
	 *
	 * @see getPageAccessLevelList
	 *
	 * @param string Page
	 * @return number Niveau d'accès de l'utilisateur pour une page donnée
	 */
	public final function getPageAccessLevel($page){
		$pageAccessLevelList = $this->getPageAccessLevelList();
		if(isset($pageAccessLevelList[$page])){
			return (int)$pageAccessLevelList[$page];
		}else{
			return $this->getDefaultAccessLevel();
		}
	}


	/**
	 * Récupère les droits d'accès sous forme de tableau
	 *
	 * Les droits d'accès sont retournés sous forme de tableau defaultAccessLevel, menuAccessLevel et pageAccessLevel
	 *
	 * @return array Droits d'accès
	 */
	public final function getData(){
		return array(
			'defaultAccessLevel' => $this->getDefaultAccessLevel(),
			'menuAccessLevel' => $this->getMenuAccessLevelList(),
			'pageAccessLevel' => $this->getPageAccessLevelList(),
		);
	}
	
}