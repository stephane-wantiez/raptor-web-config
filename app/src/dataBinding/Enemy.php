<?php
namespace lib3dduo\casualCrossing\metabot\dataBinding;

use \lib3dduo\database\Database;
use \lib3dduo\database\Data;

class Enemy extends DataBinder{

	public function getData(){
		$where = $this->buildWhereClause('enemy', 'e');
		
		$data = $this->getDB()->select('e.*, et.name type_name, et.id type, et.boss boss, l.name level_name, l.id level
			FROM enemy e
			LEFT JOIN enemy_type et ON et.id=e.type
			LEFT JOIN level l ON l.id=e.level
			WHERE '.$where);		
		
		return $data;
	}
	
	public function addData($id){
		$data = new Data('enemy');
		$data->addRef('level', $_POST['level']);
		$data->addRef('type', $_POST['type']);
		$data->addInt('pos_x', $_POST['pos_x']);
		$data->addInt('pos_y', $_POST['pos_y']);
		
		if($id){
			$this->getDB()->update($data, 'id=?', $id);
		}else{
			$id = $this->getDB()->insert($data);
		}
		return $id;
	}
	
	public function deleteData($id){
		$this->getDB()->delete('enemy', 'id=?', $id);
	}
}