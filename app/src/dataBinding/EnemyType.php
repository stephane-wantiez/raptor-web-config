<?php
namespace lib3dduo\casualCrossing\metabot\dataBinding;

use \lib3dduo\database\Database;
use \lib3dduo\database\Data;

class EnemyType extends DataBinder{

	public function getData(){
		$where = $this->buildWhereClause('enemy_type', 'et');
		
		$data = $this->getDB()->select('et.*
			FROM enemy_type et
			WHERE '.$where);		
		
		return $data;
	}
	
	public function addData($id){
		$data = new Data('enemy_type');
		$data->addString('name', $_POST['name']);
		$data->addString('type', $_POST['type']);
		$data->addBool('boss', $_POST['boss']);
		
		if($id){
			$this->getDB()->update($data, 'id=?', $id);
		}else{
			$id = $this->getDB()->insert($data);
		}
		return $id;
	}
	
	public function deleteData($id){
		$this->getDB()->delete('enemy_type', 'id=?', $id);
	}
}