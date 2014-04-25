<?php
namespace lib3dduo\casualCrossing\metabot\dataBinding;

use lib3dduo\database\Database;

abstract class StatsDataBinder extends DataBinder{
	
	const DEFAULT_TIME_INTERVAL = 86400;
	const DEFAULT_INTERVAL = 1;
	
	protected abstract function getTableName();

	protected abstract function getTablePrefix();

    protected function getJoint() {
        return '';
    }

	protected function getDateFieldName(){
		return 'creationTime';
	}

    protected function getFloatPrecision() {
        return 0;
    }
	
	protected function getFieldList(){
		return array('Total' => 'COUNT(*)');
	}
	
	protected function getWhereClause($tableName, $tablePrefix){
		return $this->buildWhereClause($tableName, $tablePrefix);
	}
	
	public function getData(){
		$chartType = $_REQUEST['mbChartType'];
		switch($chartType){
			case 'datetime':
				return $this->getDateChartData();
			case 'pie':
				return $this->getPieChartData();
			default:
				return $this->getBasicChartData();
		}
	}

	protected function getXAxisLabel($value) {
		return $value;
	}

	protected function getBasicChartData(){
		$stack = isset($_REQUEST['chart-stack']);

		$tableName = $this->getTableName();
		$tablePrefix = $this->getTablePrefix();
		$xAxisFieldName = $this->getXAxisFieldName();
		$fieldList = $this->getFieldList();
        $joint = $this->getJoint();

		if(isset($_REQUEST['chart-interval'])){
			$interval = (int)$_REQUEST['chart-interval'];
		}else{
			$interval = self::DEFAULT_INTERVAL;
		}

		$fields = '';
		$i = 0;
		foreach($fieldList as $field){
			if(is_array($field)){
				$field = $field[0];
			}
			$fields .= $field.' field'.$i++.', ';
		}
		$data = $this->getDB()->select($fields.'
				FLOOR('.$xAxisFieldName.' / '.$interval.') step
			FROM `'.$tableName.'` '.$tablePrefix.' '.$joint.'
			WHERE '.$this->getWhereClause($tableName, $tablePrefix).'
			GROUP BY step
			ORDER BY step');

		$result = array();
		$categories = array();
		$values = array();
		$fullTotal = 0;

		$i = 0;
		foreach($fieldList as $label => $field){
			$chartType = 'area';

			if(is_array($field)){
				$chartType = $field[1];
			}
			
			$fieldName = 'field'.$i++;

			$subResult = array();
			$total = 0;
			foreach($data as $d){
				$total += $d->$fieldName;
//				if (!empty($categories)) {
					$subResult[] = $stack?$total:(int)$d->$fieldName;
//				} else {
//					$subResult[] = array($d->step, $stack?$total:(int)$d->$fieldName);
//				}
				$categories[] = $this->getXAxisLabel($d->step * $interval);
			}
			$result[] = array(
				'name' => $label,
				'type' => $chartType,
				'data' => $subResult,
			);
			$values[] = $total;
			$fullTotal += $total;
		}

		for($i = 0; $i < count($result); $i++){
			$result[$i]['name'] .= $fullTotal?' ('.round($values[$i] * 100 / $fullTotal).'%)':'';
		}

		return array(
			'total' => $fullTotal,
			'series' => $result,
			'categories' => $categories,
		);
	}

	protected function getPieChartData(){
		$tableName = $this->getTableName();
		$tablePrefix = $this->getTablePrefix();
		$fieldList = $this->getFieldList();

		$fields = '';
		$i = 0;
		foreach($fieldList as $field){
			if($i != 0){
				$fields .= ', ';
			}
			$fields .= $field.' field'.$i++;
		}

		$data = $this->getDB()->select($fields.'
				FROM '.$tableName.' '.$tablePrefix.'
				WHERE '.$this->getWhereClause($tableName, $tablePrefix), Database::RES_UNIQUE);
		
		$result = array();
		$i = 0;
		$total = 0;
		foreach($fieldList as $label => $field){
			$fieldName = 'field'.$i++;
		
			$result[] = array($label, $data->$fieldName);
			$total += $data->$fieldName;
		}
		foreach($result as $i => $d){
			$result[$i] = array($d[0], (double)$d[1]);
		}
		
		return array(
			'series' => array(array(
				'type' => 'pie',
				'data' => $result
			))
		);
	}
	
	protected function getDateToSecondFactor(){
		return 1;
	}
	
	protected function getDateChartData(){
		$stack = isset($_REQUEST['chart-stack']);
		
		$tableName = $this->getTableName();
		$tablePrefix = $this->getTablePrefix();
		$dateFieldName = $this->getDateFieldName();
		$fieldList = $this->getFieldList();
        $joint = $this->getJoint();
		$dateToSecondFactor = $this->getDateToSecondFactor();

		if(isset($_REQUEST['chart-time-interval'])){
			$timeInterval = (int)$_REQUEST['chart-time-interval'];
		}else{
			$timeInterval = self::DEFAULT_TIME_INTERVAL;
		}
		
		$fields = '';
		$i = 0;
		foreach($fieldList as $field){
			if(is_array($field)){
				$field = $field[0];
			}
			$fields .= $field.' field'.$i++.', ';
		}
		$data = $this->getDB()->select($fields.'
            FLOOR('.$dateFieldName.' * '.$dateToSecondFactor.' / '.$timeInterval.') timeStep
			FROM `'.$tableName.'` '.$tablePrefix.' '.$joint.'
			WHERE '.$dateFieldName.' > 0 AND '.$this->getWhereClause($tableName, $tablePrefix).'
			GROUP BY timeStep
			ORDER BY timeStep');

		$result = array();
		$categories = array();
		$values = array();
		$fullTotal = 0;
		
		$pointInterval = $timeInterval * 1000;
		
		$i = 0;
		foreach($fieldList as $label => $field){
			$chartType = 'area';

			if(is_array($field)){
				$chartType = $field[1];
			}
			
			$fieldName = 'field'.$i++;
		
			$subResult = array();
			$total = 0;
			foreach($data as $d){
				$total += $d->$fieldName;
				$subResult[] = array($d->timeStep * $pointInterval, $stack?$total:round($d->$fieldName, $this->getFloatPrecision()));
			}
			$result[] = array(
					'name' => $label,
					'type' => $chartType,
					'data' => $subResult
			);
			$values[] = $total;
			$fullTotal += $total;
		}
		
		for($i = 0; $i < count($result); $i++){
			$result[$i]['name'] .= $fullTotal?' ('.round($values[$i] * 100 / $fullTotal).'%)':' (no data)';
		}
		
		return array(
				'total' => $fullTotal,
				'series' => $result,
				'pointInterval' => $pointInterval
		);
	}
}
