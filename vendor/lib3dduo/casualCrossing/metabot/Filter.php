<?php
namespace lib3dduo\casualCrossing\metabot;

use lib3dduo\utils\Utils;
use lib3dduo\database\Database;

class Filter{
	
	public function __construct(MetaBot $metaBot){
		$db = $metaBot->getDB();

		$projectManager = $metaBot->getProjectManager();
		if($projectManager){
			$projectFieldName = $projectManager->getProjectFieldName();
			if(isset($_REQUEST['projectField'])){
				$projectFieldName = $db->escape($_REQUEST['projectField']);
			}
		}
				
		if(isset($_REQUEST['fieldPrefix']) && $_REQUEST['fieldPrefix'] != ''){
			$fieldPrefix = $db->escape($_REQUEST['fieldPrefix']).'.';
		}else{
			$fieldPrefix = '';
		}
		$tableName = $db->escape(@$_REQUEST['table']);
		$join = '';
		if($projectManager && isset($_REQUEST['projectLinkTable']) && isset($_REQUEST['projectLinkField'])){
			$join = ' LEFT JOIN '.$_REQUEST['projectLinkTable'].' plt ON '.$_REQUEST['projectLinkField'].'='.$fieldPrefix.'id AND plt.'.$projectFieldName.'='.$projectManager->getProjectId(@$_REQUEST['projectType']);
			$where = 'plt.'.$projectFieldName.' IS NOT NULL';
		}else if (@$_REQUEST['hasProject'] && $_REQUEST['table']{0} != 'E' && $projectManager) {
			$where = $fieldPrefix.$projectFieldName.'='.$projectManager->getProjectId();
		} else {
			$where = '1';
		}
		if (isset($_REQUEST['where']) && $_REQUEST ['where'] != '') {
			$where .= ' AND ' . $_REQUEST['where'];
		}
		$nameField = 'name';
		if(!$db->columnExists($_REQUEST['table'], $nameField)){
			$nameField = 'name_lc';
		}
		$filters = $db->select($fieldPrefix.'* FROM '.$tableName.$join.' WHERE '.$where. ' ORDER BY '.$fieldPrefix.$nameField, Database::INDEX_ID, Database::FETCH_ASSOC);
		
		
		if (isset($_REQUEST['hasParents']) && $_REQUEST['hasParents'] != 'undefined' && $_REQUEST['hasParents'] != 0){
			$root = array();
			foreach($filters as $key => &$filter) {
				if (!isset($filter['children'])) {
					$filter['children'] = array();
				}
				if ($filter['parent'] != 0) {
					$filters[$filter['parent']]['children'][] = &$filter;
				} else {
					$root[] = &$filter;
				}
			}
			sort($root);
			echo '['.NL;
		
			$first = true;
			if (!isset($_REQUEST['noall'])){
				echo '{"text":"<b>Tous</b>", "value":0}';
				$first = false;
			}
			if(isset($_REQUEST['zerovalue']) && $_REQUEST['zerovalue'] == '1'){
				echo '{"text":"<b>Pas de ' . $_REQUEST['zerofieldname'] . '</b>", "value":"0"}';
				$first = false;
			}
			foreach($root as $node){
				if($first){
					$first = false;
				}else{
					echo ',';
				}
				echo $this->tree2json($node, $nameField);
			}
			echo ']'.NL;
		} else if (isset($_REQUEST['sortByLetter']) && $_REQUEST['sortByLetter'] != 'undefined' && $_REQUEST['sortByLetter'] != 0) {
			$root = array(
					array('name' => 'a-d', 'id' => 'a-d', 'children' => array()),
					array('name' => 'e-h', 'id' => 'e-h', 'children' => array()),
					array('name' => 'i-l', 'id' => 'i-l', 'children' => array()),
					array('name' => 'm-p', 'id' => 'm-p', 'children' => array()),
					array('name' => 'q-t', 'id' => 'q-t', 'children' => array()),
					array('name' => 'u-z', 'id' => 'u-z', 'children' => array())
			);
			foreach($filters as &$filter) {
				$letter = strtolower(substr($filter['name_lc'], 0, 1));
				if (ord($letter) < ord('e')) {
					$root[0]['children'][] = &$filter;
				} else if (ord($letter) < ord('i')) {
					$root[1]['children'][] = &$filter;
				} else if (ord($letter) < ord('m')) {
					$root[2]['children'][] = &$filter;
				} else if (ord($letter) < ord('q')) {
					$root[3]['children'][] = &$filter;
				} else if (ord($letter) < ord('u')) {
					$root[4]['children'][] = &$filter;
				} else {
					$root[5]['children'][] = &$filter;
				}
			}
			echo '['.NL;
		
			$first = true;
			if (!isset($_REQUEST['noall']))
			{
				echo '{"text":"<b>Tous</b>", "value":0}';
				$first = false;
			}
			if(isset($_REQUEST['zerovalue']) && $_REQUEST['zerovalue'] == '1'){
				echo '{"text":"<b>Pas de ' . $_REQUEST['zerofieldname'] . '</b>", "value":"0"}';
				$first = false;
			}
			foreach($root as $node){
				if($first){
					$first = false;
				}else{
					echo ',';
				}
				echo $this->tree2json($node, $nameField);
			}
			echo ']'.NL;
		}else {
			$json = '[' . NL;
			if (!isset($_REQUEST['noall'])){
				$json .= '{"text":"<b>Tous</b>", "value":0}';
			}
			if(isset($_REQUEST['zerovalue']) && $_REQUEST['zerovalue'] == '1'){
				$json .= '{"text":"<b>Pas de ' . $_REQUEST['zerofieldname'] . '</b>", "value":"0"}';
				$first = false;
			}
			foreach($filters as $filter) {
				$json .= ',' . NL;
				$json .= '{"text":"' . Utils::str2js($filter[$nameField]) .' ", "value":"' . $filter['id'] . '"}';
			}
			$json .= NL . ']';
			echo $json;
		}
	}
	
	private function tree2json($node, $nameField) {
		if (isset($node['children']) && count($node['children']) > 0) {
			$json = '{'.NL;
			$json .= '"text":"' . Utils::str2js($node[$nameField]) .' ", "value":"' . $node['id'] . '",'.NL;
			$json .= '"submenu":{ "id":"'.Utils::str2js($node[$nameField]).'",'.NL;
			$json .= '"itemData": ['.NL;
	
			$first = true;
	
			foreach($node['children'] as $children){
				if($first){
					$first = false;
				}else{
					$json .= ','.NL;
				}
				$json .= $this->tree2json($children, $nameField);
			}
			$json .= ']'.NL;
			$json .= '}'.NL;
			$json .= '}'.NL;
		} else {
			$json = '{"text":"' . Utils::str2js($node[$nameField]) .' ", "value":"' . $node['id'] . '"}'.NL;
		}
		return $json;
	}
}
