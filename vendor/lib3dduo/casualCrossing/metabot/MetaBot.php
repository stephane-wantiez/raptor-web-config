<?php
namespace lib3dduo\casualCrossing\metabot;

use lib3dduo\casualCrossing\metabot\dataBinding\AccessLevelType;

use lib3dduo\database\DatabaseException;

use lib3dduo\utils\Utils;

use lib3dduo\casualCrossing\metabot\dataBinding\DataBinder;

use lib3dduo\database\Database;

class MetaBot{
	
	const MAX_ICON_HEIGHT = 40;

	public static $TITLE = 'MetaBot';
	
	public static $ICON_URL = false;
	
	private $db = false;
	
	/**
	 * Gestionnaire d'utilisateur (facultatif)
	 * 
	 * Si présent, gère un mode logué
	 * @var UserManager
	 */
	private $userManager = null;

	/**
	 * Gestionnaire de projet (facultatif)
	 *
	 * Si présent, gère un mode projet
	 * @var ProjectManager
	 */
	private $projectManager = null;
	
	private static $instance = false;
	
	private $scriptList = array();
	
	private $specialPageList = array();
	
	private $specialPage = false;
	
	private function __construct(){
		$this->db = new Database(DB_HOST, DB_USER, DB_PASS, DB_NAME);
		require_once('init.php');
	}
	
	public function setUserManager(UserManager $userManager){
		$this->userManager = $userManager;
	}
	
	public function setProjectManager(ProjectManager $projectManager){
		$this->projectManager = $projectManager;
	}
	
	public function getDB(){
		return $this->db;
	}
	
	public function getUserManager(){
		return $this->userManager;
	}
	
	public function getProjectManager(){
		return $this->projectManager;
	}
	
	private function display($tpl, $data = array()){
		include('templates/'.$tpl.'.tpl');
	}
	
	public static function getInstance(){
		if(!self::$instance){
			self::$instance = new self();
		}
		return self::$instance;
	}
	
	public function run(){
		if(isset($_REQUEST['logout']) && $this->userManager){
			$this->userManager->logout();
			header('Location: ./');
			exit;
		}else if(!$this->userManager || $this->userManager->isConnected()){
			
			$this->specialPage = false;
			if(isset($_REQUEST['sp'])){
				foreach($this->specialPageList as $page){
					if($page->getId() == $_REQUEST['sp']){
						$this->specialPage = $page;
						break;
					}
				}
			}
			$this->display('index');
		}else{
			if(isset($_REQUEST['email']) && isset($_REQUEST['password'])){
				$loginError = $this->userManager->login($this->db, $_REQUEST['email'], $_REQUEST['password'], @$_REQUEST['ldapDirectory']);
				if($loginError){
					session_unset();
					$_SESSION['loginError'] = $loginError;
				}
				header('Location: '.$_SERVER['REQUEST_URI']);
				exit;
			}else{
				$this->display('login');
				$_SESSION['loginError'] = false;
			}
		}
	}

	public function handleAPI(){
		try{
			if(isset($_GET['mbAction'])){
				$action = strtoupper($_GET['mbAction']);
			}else{
				$action = strtoupper($_POST['mbAction']);
			}
			if(isset($_REQUEST['mbClass'])){
				$mbClass = $_REQUEST['mbClass'];
			}else{
				$mbClass = false;
			}
			$accessLevel = PHP_INT_MAX;
			if($this->userManager && $this->userManager->getUserAccessManager()){
				$accessLevel = $this->userManager->getUserAccessManager()->getPageAccessLevel($mbClass);
			}
			
			switch($action){
				case 'GET':
				case 'ADD':
				case 'DELETE':
				case 'SAVE_MAP':
				case 'UPLOAD':
				case 'PROCESS':
					if($action == 'FORM' && isset($_REQUEST['isModal'])){
						$mbClass = true;
					}
					if(!$mbClass){
						die('Missing mbClass');
					}
					$binder = DataBinder::getBinder($this, ucfirst($mbClass));
					if(!$binder){
						die('Missing binding class '.ucfirst($mbClass));
					}
					switch($action){
						case 'GET':
							$binder->handleGet($accessLevel);
							break;
						case 'ADD':
							$binder->handleAdd($accessLevel);
							break;
						case 'SAVE_MAP':
							$binder->handleSaveMap($accessLevel);
							break;
						case 'DELETE':
							$binder->handleDelete($accessLevel);
							break;
						case 'UPLOAD':
							$binder->handleUpload($accessLevel);
							break;
						case 'PROCESS':
							$binder->handleProcess($accessLevel);
							break;
					}
					break;
				case 'FORM':
					$binder = false;
					if(!isset($_REQUEST['isModal'])){
						if(!$mbClass){
							die('Missing mbClass');
						}
						$binder = DataBinder::getBinder($this, ucfirst($mbClass));
						if(!$binder){
							die('Missing binding class '.ucfirst($mbClass));
						}
						new Form($this, $binder, $accessLevel);
					}else{
						new Form($this);
					}
					break;
				case 'FILTER':
					new Filter($this);
					break;
				case 'LINK_GET':
				case 'LINK_ADD':
				case 'LINK_UPDATE':
				case 'LINK_DELETE':
				case 'LINK_ORDER':
					$link = new Link($this);
					switch($action){
						case 'LINK_GET':
							$link->handleGet();
							break;
						case 'LINK_ADD':
							$link->handleAdd();
							break;
						case 'LINK_DELETE':
							$link->handleDelete();
							break;
						case 'LINK_ORDER':
							$link->handleOrder();
							break;
						case 'LINK_UPDATE':
							$link->handleUpdate();
							break;
					}
					break;
				case 'IMG_GRID':
					$imageGenerator = new ImageGenerator($this);
					$imageGenerator->handleGrid();
					break;
				default:
					echo 'Unknown mbAction '.$action;
			}
		}catch(DatabaseException $e){
			$traceList = $e->getTrace();
			$i = 1;
			do{
				$trace = $traceList[$i++];
				$fileName = basename($trace['file']);
			}while($fileName == 'Database.php');
			echo 'DatabaseException in function '.$trace['function'].' ('.$fileName.':'.$trace['line'].') : '.$e->getPlainMessage();
		}catch(\Exception $e){
			echo get_class($e).' : '.$e->getMessage();
		}
	}
	
	public function addScript($scriptPath){
		$this->scriptList[] = $scriptPath;
	}
	
	public function addSpecialPage(SpecialPage $page){
		$this->specialPageList[] = $page;
	}
	
	public function getSpecialPageList(){
		return $this->specialPageList;
	}
}