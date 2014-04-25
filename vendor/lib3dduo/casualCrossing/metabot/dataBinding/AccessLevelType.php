<?php
namespace lib3dduo\casualCrossing\metabot\dataBinding;

/**
 * Type de niveaux d'accès
 * 
 * Les niveaux d'accès sont en ordre croissant.
 * 
 * Par extension, si on donne un niveau d'accès en mise à jour, il aura l'accès en lecture.
 * Si on a l'accès en création, on a l'accès en mise à jour et lecture,
 * et un accès en suppression équivaut à un accès total
 * 
 * @author no
 */
class AccessLevelType{
	
	/**
	 * Aucun accès
	 * @var number
	 */
	const NONE 		= 0;
	
	/**
	 * Accès en lecture
	 * @var number
	 */
	const GET 		= 1;

	/**
	 * Accès en création
	 * @var number
	 */
	const UPDATE 	= 2;

	/**
	 * Accès en création
	 * @var number
	 */
	const CREATE 	= 3;

	/**
	 * Accès en suppression
	 * @var number
	 */
	const DELETE 	= 4;

	/**
	 * Accès global (équivalent à accès en suppression)
	 * @var number
	 */
	const FULL 		= 5;
}