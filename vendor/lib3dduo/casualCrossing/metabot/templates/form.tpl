<?php
use lib3dduo\casualCrossing\metabot\dataBinding\AccessLevelType;

use lib3dduo\utils\Utils;

if(!$isModal){
	echo '<div class="panel-bottom well">';
}else{
	echo '<div class="well">';
}
echo '<form method="POST" name="'.$formId.'" class="form-horizontal" id="'.$formId.'" action="#" onsubmit="return false">';
if(!$isModal){
	echo '<div id="dataTabView" class="tabbable tabs-left">';
	echo '<legend>'.@$formVars['name_lc'].@$formVars['name'].'</legend>';
}
if($formTabs){
	if(!$isModal){
		echo '<ul class="nav nav-tabs">';
		$firstTabDisplayed = false;
		$firstTabDisplayIndex = 0;
		foreach($formTabs as $i => $tab){
			if(@$tab->link){
				$accessLevelType = $this->getLinkAccessLevelType(@$tab->link->fromType, @$tab->link->toType, @$tab->link->tableName, @$tab->link->isInternal);
				if($accessLevelType < AccessLevelType::GET){
					continue;
				}
			}
			$dep = @$tab->dependance;
			$invertDep = ($dep[0] == '!');
			if($invertDep){
				$dep = substr($dep, 1);
			}
			echo '<li id="'.$tab->name.'-tab"';
			if(@$tab->dependance && ((!$invertDep && !@$formVars[$dep]) || ($invertDep && @$formVars[$dep]))){
				 echo ' style="display:none"';
			}else if(!$firstTabDisplayed){
				$firstTabDisplayed = true;
				$firstTabDisplayIndex = $i;
				echo ' class="active"';
			}
			echo '><a href="#formtab-'.$tab->name.'" data-toggle="tab">';
			if(isset($tab->icon)){
				echo '<i class="icon-'.$tab->icon.'"></i> '; 
			}
			echo $tab->label.'</a></li>';
		}
		echo '</ul>';
		echo '<div class="tab-content">';
	}else{
		$fields = $formTabs;
		$formTabs = array(new stdClass());
		$formTabs[0]->fields = $fields;
		$formTabs[0]->name = 'modal-form';
	}
	foreach($formTabs as $i => $tab){
		if(@$tab->link){
			$accessLevelType = $this->getLinkAccessLevelType(@$tab->link->fromType, @$tab->link->toType, @$tab->link->tableName, @$tab->link->isInternal);
			if($accessLevelType < AccessLevelType::GET){
				continue;
			}
		}
		if(!$isModal){
			echo '<div id="formtab-'.$tab->name.'" class="tab-pane pb-form';
			if($i == $firstTabDisplayIndex){
				echo ' active';
			}
			echo '">';
		}
		if(@$tab->fields){
			foreach($tab->fields as $f){
				if(isset($f->type)){
					$f->type = strtolower($f->type);
				}
				if(@$f->type == 'hidden' || is_string($f)){
					if(is_string($f)){
						$name = $f;
					}else{
						$name = $f->name;
					}
					echo '<input type="hidden" name="'.$name.'" id="'.$name.'" value="'.@$formVars[$name].'"/>';
				}
			}
			foreach($tab->fields as $f){
				if(is_object($f) && @$f->type != 'hidden'){
					switch(@$f->type){
						case 'select':
							$this->createSelect($f);
							break;
						case 'selectasset':
							$this->createSelectAsset($f);
							break;
						case 'checkbox':
							$this->createCheckbox($f, $formTabs);
							break;
						case 'formulainput':
							$this->createFormulaInput($f);
							break;
						case 'formulatextarea':
							$this->crateFormulaTextarea($f);
							break;
						case 'textarea':
							$this->createTextarea($f);
							break;
						case 'upload':
							$this->createUpload($f);
							break;
						case 'info':
							$this->createInfo($f);
							break;
						case 'image':
							$this->createImage($f);
							break;
						case 'sprite':
							$this->createSprite($f);
							break;
						case 'date':
							$this->createDate($f);
							break;
						case 'thumb':
							$this->createThumb($f);
							break;
						case 'video':
							$this->createVideo($f);
							break;
						case 'audio':
							$this->createAudio($f);
							break;
						case 'plain':
							$this->createPlain($f);
							break;
						case 'year':
							$this->createYear($f);
							break;
						case 'month':
							$this->createMonth($f);
							break;
						case 'day':
							$this->createDay($f);
							break;
						case 'weekday':
							$this->createWeekDay($f);
							break;
						case 'raw':
						case 'row':
							$this->createRaw($f);
							break;
						default:
							$this->createInput($f);
							break;
					}
				}
			}
		}else if(@$tab->content){
			echo $tab->content;
		}else{
			include $form.'/'.@$tab->name.'Tab.tpl';
		}
		if(!$isModal){
			echo '</div>';
		}
	}
	echo '</div>';
}
if(!$isModal){
	echo '</div>';
	echo '<div class="form-actions">
			<div id="leftButtonDiv" class="pull-left"></div>
			<div id="rightButtonDiv" class="pull-right">';
	if($formVars['id'] == 'new'){
		if($allowCreation){
			echo '<button id="dataNewButton" class="btn btn-primary"><i class="icon-ok icon-white"></i> '._2('add').'</button>';
		}
	}else if($allowUpdate){
		if($allowCreation && $allowDuplication){
			echo '<button id="dataNewButton" class="btn"><i class="icon-plus-sign"></i> '._2('add as new').'</button>';
		}
		echo '<button id="dataUpdateButton" class="btn btn-primary"><i class="icon-ok icon-white"></i> '._2('save').'</button>';
		if($allowDeletion){
			echo '<button id="dataDeleteButton" class="btn btn-danger"><i class="icon-trash icon-white"></i> '._2('delete').'</button>';
		}
	}
	echo '</div>';
	echo '</div>';
}
echo '</form></div>';
