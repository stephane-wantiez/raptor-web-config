<?php
namespace lib3dduo\database;

class DatabaseException extends \Exception {

	private $error;
	private $request;
	private $args;
	
	public function __construct($error, $request, $args = array()){
		parent::__construct('Erreur "'.$error.'" dans la requête : <div style="'.Database::REQUEST_HTML_STYLE.'"><pre>'.$request.'</pre></div>');
		$this->error = $error;
		$this->request = $request;
		$this->args = $args;
	}
	
	public function getPlainMessage(){
		$message = 'Erreur "'.$this->error.'" dans la requête : '.NL.$this->request.NL;
		if(count($this->args) > 0){
			$message .= 'Parameters : '.json_encode($this->args).NL;
		}
		return $message;
	}
}
