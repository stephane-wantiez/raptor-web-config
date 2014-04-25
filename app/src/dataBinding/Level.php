<?php
namespace lib3dduo\casualCrossing\metabot\dataBinding;

use \lib3dduo\database\Database;
use \lib3dduo\database\Data;

class Level extends DataBinder{

	public function getData(){
		$where = $this->buildWhereClause('level', 'l');
		
		$data = $this->getDB()->select('l.*
			FROM level l
			WHERE '.$where);		
		
		return $data;
	}
	
	public function addData($id){
		$data = new Data('level');
		$data->addString('name', $_POST['name']);
		$data->addInt('number', $_POST['number']);
		$data->addString('background', $_POST['background']);
		$data->addString('music_boss', $_POST['music_boss']);
		$data->addString('music_defeat', $_POST['music_defeat']);
		$data->addString('music_fight', $_POST['music_fight']);
		$data->addString('music_victory', $_POST['music_victory']);
		
		if($id){
			$this->getDB()->update($data, 'id=?', $id);
		}else{
			$id = $this->getDB()->insert($data);
		}
		return $id;
	}
	
	public function deleteData($id){
		$this->getDB()->delete('level', 'id=?', $id);
	}
}