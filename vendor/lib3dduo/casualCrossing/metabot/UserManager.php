<?php
namespace lib3dduo\casualCrossing\metabot;

use lib3dduo\database\Database;

abstract class UserManager{

	/**
	 * Initialise les données du projet
	 *
	 * L'initialisation du projet se fait après l'initialisation du UserManager
	 */
	public abstract function init();
	
	
	/**
	 * Indique si l'utilisateur est connecté ou non
	 * 
	 * @return boolean Utilisateur connecté
	 */
	public abstract function isConnected();

	/**
	 * Connecte l'utilisateur
	 * 
	 * @param Database $db Base de données
	 * @param string $email Login ou Email de l'utilisateur
	 * @param string $password Mot de passe
	 * @param string $ldapDirectory Directory ldap (facultatif)
	 * @return string|boolean false si la connexion a réussi, sinon le message d'erreur associé
	 */
	public abstract function login(Database $db, $email, $password, $ldapDirectory = 'Users');
	
	/**
	 * Déconnecte l'utilisateur
	 */
	public abstract function logout();
	
	/**
	 * Récupère le nom de l'utilisateur
	 * 
	 * @return string|boolean Nom de l'utilisateur ou false s'il n'est pas connecté
	 */
	public abstract function getUsername();
	
	/**
	 * Récupère l'email de l'utilisateur
	 * 
	 * @return string|boolean Email de l'utilisateur ou false s'il n'est pas connecté
	 */
	public abstract function getUserEmail();
	
	/**
	 * Récupère l'id de l'utilisateur
	 * 
	 * L'id retourné doit toujours être numérique afin de pouvoir être directement utilisé dans les requêtes
	 * 
	 * @return number Id de l'utilisateur ou -1 s'il n'est pas connecté
	 */
	public abstract function getUserId();
	
	/**
	 * Retourne le gestionnaire d'accès utilisateurs s'il y en a un
	 * 
	 * @return UserAccessManager Gestionnaire d'accès utilisateurs
	 */
	public abstract function getUserAccessManager();
}