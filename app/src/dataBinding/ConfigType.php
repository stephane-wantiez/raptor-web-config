<?php
namespace lib3dduo\casualCrossing\metabot\dataBinding;

use \lib3dduo\database\Database;
use \lib3dduo\database\Data;

class ConfigType extends DataBinder{

	public function getData(){
		$where = $this->buildWhereClause('config_type', 'ct');
		
		$data = $this->getDB()->select('ct.*
			FROM config_type ct
			WHERE '.$where);
		
		
		return $data;
	}
	
	public function addData($id){
		$data = new Data('config_type');
		$data->addString('name', $_POST['name']);
		$data->addString('identifier', $_POST['identifier']);
		
		if($id){
			$this->getDB()->update($data, 'id=?', $id);
		}else{
			$id = $this->getDB()->insert($data);
		}
		return $id;
	}
	
	public function deleteData($id){
		$this->getDB()->delete('config_type', 'id=?', $id);
	}
}