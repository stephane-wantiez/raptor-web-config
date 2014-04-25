<?php
namespace lib3dduo\database;

class DataException extends \Exception{
	
	public function __construct($msg, $data){
		parent::__construct($msg.' :'.print_r($data, true));
	}
}
