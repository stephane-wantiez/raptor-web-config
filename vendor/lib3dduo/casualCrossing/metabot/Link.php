<?php
namespace lib3dduo\casualCrossing\metabot;

use lib3dduo\utils\Utils;
use lib3dduo\database\Database;
use lib3dduo\database\Data;

class Link{
	
	private $db;
	
	private static $tableList = false;
	
	private $metaBot;
	
	public function __construct(MetaBot $metaBot){
		$this->metaBot = $metaBot;
		$this->db = $metaBot->getDB();
	}
	
	public static function getLinkTableName($fromType, $toType, $tableName, $isInternal){
		if(!self::$tableList){
			self::$tableList = array_flip(MetaBot::getInstance()->getDB()->getTables());
		}
		
		if($isInternal){
			$tableName = $toType;
		}
		if(!$tableName || $tableName == 'undefined'){
			$tableName = 'G'.$fromType.'_'.$toType;
			if(!isset(self::$tableList[$tableName])){
				$tableName = 'C'.$fromType.'_'.$toType;
				if(!isset(self::$tableList[$tableName])){
					$tableName = $fromType.'_'.$toType;
				}
			}
		}
		if(isset(self::$tableList[$tableName])){
			return $tableName;
		}else{
			trigger_error('Unknown tablename '.$tableName, E_USER_WARNING);
			return false;
		}
	}
	
	public function handleAdd(){
		$fromType = @$_REQUEST['fromType'];
		$toType = @$_REQUEST['toType'];
		$id = (int)@$_REQUEST['id'];
		$order = (int)@$_REQUEST['order'];
		$isInternal = isset($_REQUEST['isInternal']);
		
		$where = '';
		if(isset($_REQUEST['where'])){
			$data = explode('&', $_REQUEST['where']);
			$otherData = array();
			foreach($data as $i => $v){
				list($k, $v) = explode('=', $v);
				$otherData[$k] = $v;
			}
			foreach($otherData as $k => $v){
				$where .= ' AND `'.$k.'`="'.$v.'"';
			}
		}else{
			$otherData = false;
		}
		$tableName = self::getLinkTableName($fromType, $toType, @$_REQUEST['tableName'], $isInternal);
		if($order){
			$max = (int)$this->db->select('MAX(`order`) FROM '.$tableName.' WHERE '.$fromType.'='.$id.$where, Database::RES_UNIQUE, Database::FETCH_UNIQUE);
		}
		$data = new Data($tableName);
		$data->addInt($fromType, $id);
		if($otherData){
			foreach($otherData as $key => $val){
				if($key != $fromType){
					$data->addString($key, $val);
				}
			}
		}
		$customFields = array();
		if(isset($_REQUEST['customFields'])){
			$customFields = json_decode($_REQUEST['customFields']);
		}
		foreach($customFields as $f){
			if(@$f->name && isset($_REQUEST[$f->name]) && $f->name != $fromType){
				if(@$f->type == 'select'){
					$data->addRef($f->name, $_REQUEST[$f->name]);
				}else{
					$data->addString($f->name, $_REQUEST[$f->name]);
				}
			}
		}
		$projectManager = $this->metaBot->getProjectManager();
		if($projectManager && $this->db->columnExists($tableName, $projectManager->getProjectFieldName()) && $projectManager->getProjectFieldName() != $fromType){
			$data->addRef($projectManager->getProjectFieldName(), $projectManager->getProjectId());
		}
		if($isInternal){
			if($order){
				$data->addInt('order', ++$max);
			}
			$this->db->insert($data);
			echo 'Lien ajouté';
		}else{
			$idList = explode(',', $_REQUEST['linkList']);
			foreach($idList as $to){
				$data->addInt($toType, $to);
				if($order){
					$data->addInt('order', ++$max);
				}
				$this->db->insert($data);
			}
			echo count($idList).' liens ajoutés';
		}
	}
	
	public function handleGet(){

		$fromType = @$_REQUEST['fromType'];
		$toType = @$_REQUEST['toType'];
		$id = (int)@$_REQUEST['id'];
		$order = (int)@$_REQUEST['order'];
		$isInternal = isset($_REQUEST['isInternal']);

		$tableName = self::getLinkTableName($fromType, $toType, @$_REQUEST['tableName'], $isInternal);
		
		
		if(isset($_REQUEST['toTypeTableName'])){
			$toTypeTable = $_REQUEST['toTypeTableName'];
		}else{
			$toTypeTable = 'G'.$toType;
			if(!$this->db->tableExists($toTypeTable)){
				$toTypeTable = 'C'.$toType;
				if(!$this->db->tableExists($toTypeTable)){
					$toTypeTable = 'E'.$toType;
					if(!$this->db->tableExists($toTypeTable)){
						$toTypeTable = $toType;
					}
				}
			}
		}
		
		if($isInternal){
			$toType = 'id';
		}
		
		$where = '';
		if(isset($_REQUEST['where'])){
			$data = explode('&', $_REQUEST['where']);
			$otherData = array();
			foreach($data as $i => $v){
				list($k, $v) = explode('=', $v);
				$otherData[$k] = $v;
			}
			foreach($otherData as $k => $v){
				$where .= ' AND `'.$k.'`="'.$v.'"';
			}
		}
		if(isset($_REQUEST['checkProject'])){
			$where .= ' AND t2.project='.$_REQUEST['project'];
		}
		
		$isActiveCol = $this->db->columnExists($toTypeTable, 'isActive');
		
		$typeTableName = $toTypeTable.'Type';
		if(isset($_REQUEST['typeTableName'])){
			$typeTableName = $_REQUEST['typeTableName'];
		}
		$typeTableField = $typeTableName;
		if(isset($_REQUEST['typeTableField'])){
			$typeTableField = $_REQUEST['typeTableField'];
		}

		$typeExists = $this->db->columnExists($toTypeTable, $typeTableField);
		if($typeExists){
			$typeExists = $this->db->tableExists($typeTableName);
			if(!$typeExists){
				$typeTableName = 'E'.$toType.'Type';
				$typeExists = $this->db->tableExists($typeTableName);
			}
			if($typeExists){
				$typeNameField = 'name';
				if(!$this->db->columnExists($typeTableName, $typeNameField)){
					$typeNameField = 'name_lc';
				}
			}
		}
		$customFields = array();
		if(isset($_REQUEST['customFields'])){
			$customFields = @json_decode($_REQUEST['customFields']);
			if(!is_array($customFields)){
				$customFields = array();
			}
		}
		$i = 0;
		$select = '';
		$join = '';
		$customFieldList = array();
		$customFieldNameList = array();
		foreach($customFields as $f){
			$hasName = false;
			if(@$f->type == 'select' && @$f->table){
				$nameField = 'name';
				if(!$this->db->columnExists($f->table, $nameField)){
					$nameField = 'name_lc';
					if(!$this->db->columnExists($f->table, $nameField)){
						$nameField = false;
					}
				}
				if($nameField){
					$join .= ' LEFT JOIN `'.$f->table.'` j'.$i.' ON t1.'.$f->name.'=j'.$i.'.id ';
					$select .= ', j'.$i.'.'.$nameField.' name'.$i;
					$customFieldNameList[$f->name] = 'name'.$i;
					$hasName = true;
					$i++;
				}
			}
			if(!$hasName && @$f->name){
				$customFieldList[] = $f->name;
			}
		}
		
		$sql = ($typeExists?'t3.*, t3.'.$typeNameField:'"-"').' typeName'.$select.', t2.*, t1.*
			FROM '.$tableName.' t1
			LEFT JOIN '.$toTypeTable.' t2 ON t2.id=t1.'.$toType
					.($typeExists?' LEFT JOIN '.$typeTableName.' t3 ON t2.'.$typeTableField.'=t3.id':'')
					.$join
					.' WHERE t1.'.$fromType.'='.$id.$where.' AND t2.id IS NOT NULL'
					.' GROUP BY t2.id ';
		if($order){
			$sql .= 'ORDER BY t1.`order`';
		}
		
		$data = $this->db->select($sql, Database::INDEX_ID);
		$result = array();
		foreach($data as $d){

			if(isset($_REQUEST['nameField'])){
				$name = $d->{$_REQUEST['nameField']};
			}else{
				$name = @$d->name.@$d->name_lc;
			}
			$entry = array(
				'id' => (int)$d->id,
				'name' => $name,
				'typeName' => $d->typeName,
				'isActive' => (int)($isActiveCol?$d->isActive:true)
			);
			foreach($customFieldList as $key){
				$entry[$key] = $d->$key;
			}
			foreach($customFieldNameList as $key => $val){
				$entry[$key] = $d->$key;
				$entry[$key.'Name'] = $d->$key?'['.$d->$key.'] '.$d->$val:'-';
			}
			if($order){
				$entry['order'] = (int)$d->order;
			}
			$result[] = $entry;
		}
		
		echo json_encode(array('data' => $result));
	}
	
	public function handleDelete(){
		$fromType = @$_REQUEST['fromType'];
		$toType = @$_REQUEST['toType'];
		$id = (int)@$_REQUEST['id'];
		$isInternal = isset($_REQUEST['isInternal']);

		$tableName = self::getLinkTableName($fromType, $toType, @$_REQUEST['tableName'], $isInternal);
		if($isInternal){
			$toType = 'id';
		}
		
		$where = '';
		if(isset($_REQUEST['where'])){
			$data = explode('&', $_REQUEST['where']);
			$otherData = array();
			foreach($data as $i => $v){
				list($k, $v) = explode('=', $v);
				$otherData[$k] = $v;
			}
			foreach($otherData as $k => $v){
				$where .= ' AND `'.$k.'`="'.$v.'"';
			}
		}
		
		$this->db->delete($tableName, $fromType.'='.$id.' AND '.$toType.'='.(int)@$_REQUEST['rowId'].$where);
	}
	
	public function handleOrder(){
		$fromType = @$_REQUEST['fromType'];
		$toType = @$_REQUEST['toType'];
		$id = (int)@$_REQUEST['id'];
		$isInternal = isset($_REQUEST['isInternal']);

		$tableName = self::getLinkTableName($fromType, $toType, @$_REQUEST['tableName'], $isInternal);
		if($isInternal){
			$toType = 'id';
		}
		
		$where = '';
		if(isset($_REQUEST['where'])){
			$data = explode('&', $_REQUEST['where']);
			$otherData = array();
			foreach($data as $i => $v){
				list($k, $v) = explode('=', $v);
				$otherData[$k] = $v;
			}
			foreach($otherData as $k => $v){
				$where .= ' AND `'.$k.'`="'.$v.'"';
			}
		}
		
		$rowId = (int)@$_REQUEST['rowId'];
		$orderBy = isset($_REQUEST['up'])?'DESC':'ASC';
		$comp = isset($_REQUEST['up'])?'<=':'>=';
		
		$fromOrder = $this->db->select('`order` FROM '.$tableName.' WHERE '.$fromType.'='.$id.' AND '.$toType.'='.$rowId.$where, Database::RES_UNIQUE, Database::FETCH_UNIQUE);
		$otherRowId = $this->db->select($toType.' FROM '.$tableName.'
			WHERE '.$fromType.'='.$id.' AND '.$toType.'<>'.$rowId.' AND `order`'.$comp.$fromOrder.$where.'
			ORDER BY `order` '.$orderBy, Database::RES_UNIQUE, Database::FETCH_UNIQUE);
		
		if($otherRowId){
			$otherRowOrder = $this->db->select('`order` FROM '.$tableName.' WHERE '.$fromType.'='.$id.' AND '.$toType.'='.$otherRowId.$where, Database::RES_UNIQUE, Database::FETCH_UNIQUE);
			if($otherRowOrder == $fromOrder){
				$otherRowOrder = $fromOrder + (isset($_REQUEST['up'])?-1:1);
			}
			$data = new Data($tableName);
			$data->addInt('order', $otherRowOrder);
			$this->db->update($data, $fromType.'='.$id.' AND '.$toType.'='.$rowId);
		
			$data->addInt('order', $fromOrder);
			$this->db->update($data, $fromType.'='.$id.' AND '.$toType.'='.$otherRowId);
		}
	}
	
	public function handleUpdate(){
		$fromType = @$_REQUEST['fromType'];
		$toType = @$_REQUEST['toType'];
		$id = (int)@$_REQUEST['id'];
		$isInternal = isset($_REQUEST['isInternal']);

		$tableName = self::getLinkTableName($fromType, $toType, @$_REQUEST['tableName'], $isInternal);
		if($isInternal){
			$toType = 'id';
		}
		
		$where = '';
		if(isset($_REQUEST['where'])){
			$data = explode('&', $_REQUEST['where']);
			$otherData = array();
			foreach($data as $i => $v){
				list($k, $v) = explode('=', $v);
				$otherData[$k] = $v;
			}
			foreach($otherData as $k => $v){
				$where .= ' AND `'.$k.'`="'.$v.'"';
			}
		}
		
		$rowId = (int)@$_REQUEST['rowId'];
		
		$data = new Data($tableName);
		
		$fieldList = json_decode($_REQUEST['customFields']);
		foreach($fieldList as $f){
			if(isset($_REQUEST[$f->name])){
				if(@$f->type == 'select'){
					$data->addRef($f->name, $_REQUEST[$f->name]);
				}else{
					$data->addString($f->name, $_REQUEST[$f->name]);
				}
			}
		}
		if($this->db->update($data, $fromType.'='.$id.' AND '.$toType.'='.$rowId)){
			echo 'Enregistrement mis à jour';
		}else{
			echo 'Aucun enregistrement mis à jour';
		}
	}
}
