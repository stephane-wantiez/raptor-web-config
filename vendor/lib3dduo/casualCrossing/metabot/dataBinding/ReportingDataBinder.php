<?php
namespace lib3dduo\casualCrossing\metabot\dataBinding;

use lib3dduo\database\Data;
use lib3dduo\database\Database;

abstract class ReportingDataBinder extends DataBinder {

	const NO_DATA = '-';
	
    public function process($processId, $id, $customData){
        $result = false;
        switch($processId) {
            case 'export':
                App::getInstance()->exportReporting($customData['month'], $customData['year']);
                $result = true;
                break;
            default:
                break;
        }

        return $result;
    }
    
    protected abstract function getPeriodData($forExport, $from, $to, $fromTime, $toTime, $month);
    
    public final function getData($forExport = false){

    	if($forExport){
    		$month = @$_REQUEST['month'];
    		$year = @$_REQUEST['year'];
    	
    		list($from, $to, $fromTime, $toTime, $month) = $this->getDateParamFromMonth($month, $year);
    	}else{
    		$from = @$_REQUEST['from'];
    		$to = @$_REQUEST['to'];
    	
    		list($from, $to, $fromTime, $toTime, $month) = $this->getDateParam($from, $to);
    	}
    	
    	if($from == $to){
    		return array();
    	}
    	
    	$data = $this->getPeriodData($forExport, $from, $to, $fromTime, $toTime, $month);
    	
    	if(!$forExport){
	    	$tmp = $fromTime;
	    	$fromTime -= ($toTime - $fromTime);
	    	$toTime = $tmp;
	    	$from = date('Y-m-d', $fromTime);
	    	$to = date('Y-m-d', $toTime);
	    	$month = date('Y-m', $fromTime);
	    	
	    	$data2 = $this->getPeriodData($forExport, $from, $to, $fromTime, $toTime, $month);
	    	
	    	foreach($data as $i => $d){
	    		if(!isset($data2[$i])){
	    			$data[$i]->value2 = self::NO_DATA;
	    		}else{
		    		$data[$i]->value2 = $data2[$i]->value;
	    		}
	    		if($data[$i]->value2 == 0 || $data[$i]->value2 == self::NO_DATA || $data[$i]->value == self::NO_DATA){
	    			$d->progress = self::NO_DATA;
	    		}else{
	    			$d->progress = round($d->value / $data2[$i]->value - 1, 3);
	    		}
	    	}
    	}
    	    	
    	return array_values($data);
    }

    protected function getDateParamFromMonth($month = false, $year = false){
    	if($month && $year){
    		$from = $year.'-'.str_pad($month, 2, '0', STR_PAD_LEFT).'-01';
    		$to = $year.'-'.str_pad($month, 2, '0', STR_PAD_LEFT).'-'.str_pad(date('t', strtotime($from)), 2, '0', STR_PAD_LEFT);
    	}else{
    		$from =  date('Y-m-d', strtotime(date('Y-m-01')));
    		$to = date('Y-m-d');
    	}
    	$fromTime = strtotime($from);
    	$toTime = strtotime($to);
    	$month = date('Y-m', $fromTime);
    	return array($from, $to, $fromTime, $toTime, $month);
    }

    protected function getDateParam($from = false, $to = false){
    	if(!$from){
    		$from =  date('Y-m-d', strtotime(date('Y-m-01')));
    	}
    	if(!$to){
    		$to = date('Y-m-d');
    	}
    	$fromTime = strtotime($from);
    	$toTime = strtotime($to);
    	$month = date('Y-m', $fromTime);
    	 
    	return array($from, $to, $fromTime, $toTime, $month);
    }
}
