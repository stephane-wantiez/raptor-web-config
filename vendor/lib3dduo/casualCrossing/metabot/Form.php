<?php
namespace lib3dduo\casualCrossing\metabot;

use lib3dduo\casualCrossing\metabot\dataBinding\DataBinder;

use lib3dduo\casualCrossing\metabot\dataBinding\AccessLevelType;

use lib3dduo\utils\Utils;

use lib3dduo\database\Database;

class Form{

	const MODAL_INPUT_SPAN_SIZE = 3;

	const INPUT_SPAN_SIZE = 6;
	
	private $formData;

	private $metaBot;

	private $userManager = false;
	
	private $projectManager = false;
	
	private $dataBinder;

	private $accessLevel;
	
	public function __construct(MetaBot $metaBot, DataBinder $binder = null, $accessLevel = 0){
		$this->dataBinder = $binder;
		$this->accessLevel = $accessLevel;
		
		$formData = array();
		
		$this->metaBot = $metaBot;

		$this->userManager = $this->metaBot->getUserManager();
		
		$this->projectManager = $this->metaBot->getProjectManager();
		
		if (isset($_POST['queryString'])){
			// On explose la liste des requêtes de liste tierse.
			$queries = explode("¤", $_POST['queryString']);
		
			foreach ($queries as $query){
				if(!$query){
					continue;
				}
				$list = array();
		
				$params = explode(';',$query);
				
				if(!$this->projectManager || $params[0]{0} == 'E'){
					$where = ' WHERE 1';
				}else{
					$where = ' WHERE '.$this->projectManager->getProjectFieldName().'='.$this->projectManager->getProjectId();
				}
				if (sizeof($params) > 1){
					$where .= ' AND '.$params[1];
				}
		
				$order = ' ORDER BY name';
				$selectOption = false;
				$sql = '* FROM '.$params[0];
		
				$formData[$params[0]] = $this->metaBot->getDB()->select($sql.$where.$order, $selectOption);
			}
		}
		
		// On explose la liste des clés/valeurs dans un tableau simple.
		if (isset($_POST['dataString'])){
			$data = json_decode($_POST['dataString']);
		
			// Création du tableau associatif PHP à  l'aide du combo clé/valeur.
			for ($i = 0; $i < count($data); $i += 2){
				$formData[$data[$i]] = $data[$i + 1];
			}
		}
		
		if (isset($_POST['paramString'])){
			// On explose la liste des clés/valeurs dans un tableau simple.
			$data = explode("¤", $_POST['paramString']);
		
			// Si on a au moins deux éléments dans le tableau.
			if(count($data) >= 2){
				for ($i = 0; $i < count($data); $i += 2){
					$formData[$data[$i]] = $data[$i + 1];
				}
			}
		}
		$formData['mbNew'] = @$formData['id'] == 'new';

		$allowCreation = isset($_REQUEST['allowCreation']);
		$allowUpdate = isset($_REQUEST['allowUpdate']);
		$allowDuplication = isset($_REQUEST['allowDuplication']);
		$allowDeletion = isset($_REQUEST['allowDeletion']);
		
		if($this->dataBinder){
			$accessLevelType = $this->dataBinder->getAccessLevelType($accessLevel);
		}else{
			$accessLevelType = AccessLevelType::FULL;
		}
		if($accessLevelType < AccessLevelType::CREATE){
			$allowCreation = false;
		}
		if($accessLevelType < AccessLevelType::UPDATE){
			$allowUpdate = false;
		}
		if($accessLevelType < AccessLevelType::DELETE){
			$allowDeletion = false;
		}
	
		$formVars = $formData;
		$this->formData = $formVars;
		$form = @$_REQUEST['form'];
		
		$this->isModal = isset($_REQUEST['isModal']);
		$isModal = $this->isModal;
		
		$formId = $isModal?'modalDataForm':'dataForm';
		
		$formTabs = @json_decode(@$_REQUEST['formTabs']);
		
		include 'templates/form.tpl';
	}
	
	private function getLinkAccessLevelType($fromType, $toType, $tableName, $isInternal){
		if($this->dataBinder){
			return $this->dataBinder->getLinkAccessLevelType($this->accessLevel, Link::getLinkTableName($fromType, $toType, $tableName, $isInternal));
		}else{
			return AccessLevelType::FULL;
		}
	}
	
	public function createImage($field){
		$path = $this->getValue($field);
		if(strpos($path, '?') > 0){
			$path .= '&r'.time();
		}else{
			$path .= '?r'.time();
		}
		$this->createField($field, '<img src="'.$path.'" '.(@$field->border?'style="border:black solid 1px"':'').'/>');
	}
	
	public function createSprite($field){
		$path = $this->getValue($field);
		if(strpos($path, '?') > 0){
			$path .= '&r'.time();
		}else{
			$path .= '?r'.time();
		}
		$this->createField($field, '<canvas 
				id="'.$field->name.'-canvas" 
				data-type="sprite" 
				data-path="'.$path.'" 
				data-frame-count="'.$field->frameCount.'"
				data-frame-rate="'.$field->frameRate.'"
				></canvas><br/><a target="_blank" href="'.$path.'">Voir le spritesheet</a>');
	}
	
	public function createThumb($field){
		static $thumbCount = 0;
		$thumbCount++;
		$path = $this->getValue($field);
		if(strpos($path, '?') > 0){
			$path .= '&r'.time();
		}else{
			$path .= '?r'.time();
		}
		$refresh = '$(\'#thumb'.$thumbCount.'\').css(\'left\', $(\'#'.$field->xField.'\').get(0).value + \'px\').css(\'top\', $(\'#'.$field->yField.'\').get(0).value + \'px\').css(\'width\', $(\'#'.$field->widthField.'\').get(0).value + \'px\').css(\'height\', $(\'#'.$field->heightField.'\').get(0).value + \'px\');';
		$content = ' x <input type="text" style="width:30px" id="'.$field->xField.'" name="'.$field->xField.'" value="'.$this->getValue($field->xField).'" onchange="'.$refresh.'"/>';
		$content .= ' y <input type="text" style="width:30px" id="'.$field->yField.'" name="'.$field->yField.'" value="'.$this->getValue($field->yField).'" onchange="'.$refresh.'"/>';
		$content .= ' w <input type="text" style="width:30px" id="'.$field->widthField.'" name="'.$field->widthField.'" value="'.$this->getValue($field->widthField).'" onchange="'.$refresh.'"/>';
		$content .= ' h <input type="text" style="width:30px" id="'.$field->heightField.'" name="'.$field->heightField.'" value="'.$this->getValue($field->heightField).'" onchange="'.$refresh.'"/>';
		$content .= '<div style="cursor:crosshair;position:relative" onclick="$(\'#'.$field->xField.'\').get(0).value=event.offsetX-Math.round($(\'#'.$field->widthField.'\').get(0).value/2);$(\'#'.$field->yField.'\').get(0).value=event.offsetY-Math.round($(\'#'.$field->heightField.'\').get(0).value/2);'.$refresh.'">';
		$content .= '<img src="'.$path.'"/>';
		$content .= '<div id="thumb'.$thumbCount.'" style="pointer-events:none;position:absolute;margin:-1px;border:red solid 2px;top:'.$this->getValue($field->yField).'px;left:'.$this->getValue($field->xField).'px;';
		$content .= 'width:'.$this->getValue($field->widthField).'px;height:'.$this->getValue($field->heightField).'px"></div>';
		$content .= '</div>';
		$this->createField($field, $content);
	}
	
	public function createInfo($field){
		$this->createField($field, '<input type="hidden" name="'.$field->name.'" value="'.htmlspecialchars($this->getValue($field)).'"/><span class="span'.$this->getInputSpanSize().' uneditable-input">'.$this->getValue($field).'</span>');
	}
	
	public function createDate($field){
		$this->createField($field, '<input type="date" style="width:auto" name="'.$field->name.'" id="'.$field->name.'" '.(@$field->disabled?'disabled="disabled"':'').(($this->getValue($field) && $this->getValue($field)!=='null')?' value="'.date('Y-m-d', (int)$this->getValue($field)).'"':'') .'/>');
	}
	
	public function createInput($field){
		$class = 'span'.$this->getInputSpanSize();
		switch(@$field->type){
			case 'tel':
			case 'email':
			case 'password':
			case 'color':
				$inputType = $field->type;
				if(!@$field->append){
					switch(@$field->type){
						case 'tel':
							$field->append = 'Tel.';
							break;
						case 'email':
							$field->append = '<i class="icon-envelope"></i>';
							break;
					}
				}
				break;
			default:
				$inputType = 'text';
		}
		if(@$field->append){
			$class = 'span12';
		}
		$content = '<input type="'.$inputType.'" class="'.$class.'" name="'.$field->name.'" id="'.$field->name.'" '.(@$field->disabled?'disabled="disabled"':'').' value="'.htmlspecialchars($this->getValue($field)).'"/>';
		if(@$field->append){
			$content = '<div class="span'.$this->getInputSpanSize().' input-append">'.$content.'<span class="add-on">'.$field->append.'</span></div>';
		}
		$this->createField($field, $content);
	}
	
	public function createTextarea($field){
		$this->createField($field, '<textarea class="span10" name="'.$field->name.'" id="'.$field->name.'" '.(@$field->disabled?'disabled="disabled"':'').'>'.$this->getValue($field).'</textarea>');
	}
	
	public function createPlain($field){
		$this->createField($field, '<span class="help-block">'.$this->getValue($field).'</span>');
	}
	
	public function createRaw($field){
		$this->createField($field, '<span class="help-block">'.@$field->value.'</span>');
	}
	
	public function createCheckbox($field, $formTabs){
		$value = $this->getValue($field);
		if($value && (strtolower($value) == 'false' || strtolower($value) == 'undefined')){
			$value = false;
		}
		$content = '<input type="checkbox" name="'.$field->name.'" id="'.$field->name.'" '.(@$field->disabled?'disabled="disabled"':'').($value?' checked="checked"':'');
		

		$tabList = array();
		$notTabList = array();
		foreach($formTabs as $tab){
			if(@$tab->dependance == $field->name){
				$tabList[] = $tab->name.'-tab';
			}else if(substr(@$tab->dependance, 0, 1) == '!' && substr(@$tab->dependance, 1) == $field->name){
				$notTabList[] = $tab->name.'-tab';
			}
			if(@$tab->fields){
				foreach($tab->fields as $f){
					if(@$f->dependance == $field->name){
						$tabList[] = $f->name.'-row';
					}else if(substr(@$f->dependance, 0, 1) == '!' && substr(@$f->dependance, 1) == $field->name){
						$notTabList[] = $f->name.'-row';
					}
				}
			}
		}
		if(count($tabList) > 0 || count($notTabList) > 0){
			$content .= ' onclick="';
			foreach($tabList as $t){
				$content .= 'Dom.get(\''.$t.'\').style.display=(this.checked?\'\':\'none\');';
			}
			foreach($notTabList as $t){
				$content .= 'Dom.get(\''.$t.'\').style.display=(this.checked?\'none\':\'\');';
			}
			$content .= '"';
		}
		$content .= '/>';
		$this->createField($field, $content);
	}
	
	public function createYear($field){
		$from = date('Y', 0);
		if(@$field->from == 'now'){
			$from = date('Y', time());
		}else if(@$field->from){
			$from = (int)$field->from;
		}
		$to = date('Y', PHP_INT_MAX);
		if(@$field->to == 'now'){
			$to = date('Y', time());	
		}else if(@$field->to){
			$to = (int)$field->to;
		}

		if(@$field->value){
			$value = $field->value;
		}else{
			$value = $this->getValue($field);
		}
		if(!$value){
			$value = date('Y', time()); 
		}
		
		$content = '<select name="'.$field->name.(@$field->multiple?'[]':'').'" id="'.$field->name.'" '.(@$field->disabled?' disabled="disabled"':'').(@$field->multiple?' multiple="multiple"':'').(@$field->size?' size="'.$field->size.'"':'').' class="span'.$this->getInputSpanSize().'">';
		
		$continue = true;
		for($i = $from; $continue; $i += ($to > $from?1:-1)){
			$content .= '<option value="'.$i.'"';
			if($value == $i){
				$content .= ' selected="selected"';
			}
			$content .= '>'.$i.'</option>';
			if($i == $to){
				$continue = false;
			}
		}
		
		$content .= '</select>';
		echo $this->createField($field, $content);
	}
	
	public function createDay($field){
		if(@$field->value){
			$value = $field->value;
		}else{
			$value = $this->getValue($field);
		}
		if(!$value){
			$value = date('d', time()); 
		}
		
		$content = '<select name="'.$field->name.(@$field->multiple?'[]':'').'" id="'.$field->name.'" '.(@$field->disabled?' disabled="disabled"':'').(@$field->multiple?' multiple="multiple"':'').(@$field->size?' size="'.$field->size.'"':'').' class="span'.$this->getInputSpanSize().'">';
		
		for($i = 1; $i <= 31; $i++){
			$content .= '<option value="'.$i.'"';
			if($value == $i){
				$content .= ' selected="selected"';
			}
			$content .= '>'.$i.'</option>';
		}
		
		$content .= '</select>';
		echo $this->createField($field, $content);
	}
	
	public function createMonth($field){
		
		if(@$field->value){
			$value = $field->value;
		}else{
			$value = $this->getValue($field);
		}
		if(!$value){
			$value = date('n', time()); 
		}
		
		$monthList = array(_2('janvier'), _2('février'), _2('mars'), _2('avril'), _2('mai'), _2('juin'), _2('juillet'), _2('août'), _2('septembre'), _2('octobre'), _2('novembre'), _2('décembre'));
		          
		$content = '<select name="'.$field->name.(@$field->multiple?'[]':'').'" id="'.$field->name.'" '.(@$field->disabled?' disabled="disabled"':'').(@$field->multiple?' multiple="multiple"':'').(@$field->size?' size="'.$field->size.'"':'').' class="span'.$this->getInputSpanSize().'">';
		
		foreach($monthList as $i => $m){
			$content .= '<option value="'.($i+1).'"';
			if($value == $i + 1){
				$content .= ' selected="selected"';
			}
			$content .= '>'.$m.'</option>';
		}
		
		$content .= '</select>';
		echo $this->createField($field, $content);
	}
	
	public function createWeekDay($field){
		
		if(@$field->value){
			$value = $field->value;
		}else{
			$value = $this->getValue($field);
		}
		if(!$value){
			$value = date('n', time()); 
		}
		
		$dayList = array(_2('lundi'), _2('mardi'), _2('mercredi'), _2('jeudi'), _2('vendredi'), _2('samedi'), _2('dimanche'));
		          
		$content = '<select name="'.$field->name.(@$field->multiple?'[]':'').'" id="'.$field->name.'" '.(@$field->disabled?' disabled="disabled"':'').(@$field->multiple?' multiple="multiple"':'').(@$field->size?' size="'.$field->size.'"':'').' class="span'.$this->getInputSpanSize().'">';
		
		foreach($dayList as $i => $d){
			$content .= '<option value="'.$i.'"';
			if($value == $i){
				$content .= ' selected="selected"';
			}
			$content .= '>'.$d.'</option>';
		}
		
		$content .= '</select>';
		echo $this->createField($field, $content);
	}
	
	public function createSelect($field){
		static $cache = array();
		
		if(@$field->value){
			$value = $field->value;
		}else{
			$value = $this->getValue($field);
		}
		if(!is_array($value)){
			if(@$field->multiple){
				$value = json_decode($value);
				if(!$value){
		 			$value = explode(',', $value);
				}
			}else{
				$value = array($value);
			}
		}
				
		$content = '<select name="'.$field->name.(@$field->multiple?'[]':'').'" id="'.$field->name.'" '.(@$field->disabled?' disabled="disabled"':'').(@$field->multiple?' multiple="multiple"':'').(@$field->size?' size="'.$field->size.'"':'').' class="span'.$this->getInputSpanSize().'">';
		if(@$field->values){
			foreach($field->values as $v){
				$optionValue = $v;
				$optionText = $v;
				if(is_object($v)){
					$optionValue = $v->value;
					$optionText = $v->text;
				}
				$content .= '<option value="'.$optionValue.'"';
				if(in_array($optionValue, $value)){
					$content .= ' selected="selected"';
				}
				$content .= '>'.$optionText.'</option>';
			}
		}else{
			$cacheId = $field->table.'_'.@$field->where.'_'.$this->getProjectId();
			if(!isset($cache[$cacheId])){
				$where = '1';
				
				$columnName = 'name';
				if(@$field->nameField){
					$columnName = $field->nameField;
				}else if(!$this->metaBot->getDB()->columnExists($field->table, $columnName)){
					$columnName = 'name_lc';
				}
				if(@$field->idField){
					$idField = $field->idField;
				} else {
					$idField = 'id';
				}
				
				$join = '';
				if($this->userManager && $this->userManager->getUserAccessManager()){
					$dataUserAccess = $this->userManager->getUserAccessManager()->getDataUserAccessInfoList();
					if(isset($dataUserAccess[$field->table])){
						$info = $dataUserAccess[$field->table];
						$join = ' JOIN '.$info['table'].' j ON j.'.$info['dataField'].'='.$idField.' AND j.'.$info['userField'].'='.$this->getUserId();
					}
				}
				
				if($this->projectManager){
					$projectFieldName = $this->projectManager->getProjectFieldName();
					if(isset($field->projectLinkTable) && isset($field->projectLinkField)){
						$join = ' LEFT JOIN '.$field->projectLinkTable.' plt ON '.$field->projectLinkField.'=id AND plt.'.$projectFieldName.'='.$this->projectManager->getProjectId(@$field->projectType);
						$where .= ' AND plt.'.$projectFieldName.' IS NOT NULL';
					}else if($field->table{0} != 'E' && !isset($field->hasProject) && $this->metaBot->getDB()->columnExists($field->table, $projectFieldName)){
						$where .= ' AND '.$projectFieldName.'='.$this->getProjectId();
					}
				}
				if (isset($field->linkTable) && isset($field->linkField)) {
					$join = ' LEFT JOIN '.$field->linkTable.' plt ON '.$field->linkField;
				}
				if(@$field->where){
					$where .= ' AND '.@$field->where;
				}
				
				$cache[$cacheId] = $this->metaBot->getDB()->select($idField.' id, '.$columnName.' name FROM '.$field->table.$join.' WHERE '.$where.' ORDER BY '.$columnName);
			}
			$list = $cache[$cacheId];
			if(!@$field->multiple){
				$content .= '<option value="0">---</option>';
			}
			foreach($list as $o){
				$content .= '<option value="'.$o->id.'"';
				if(in_array($o->id, $value)){
					$content .= ' selected="selected"';
				}
				$content .= '>['.$o->id.'] '.$o->name.'</option>';
			}
		}
		$content .= '</select>';
		echo $this->createField($field, $content);
	}
	
	public function createSelectAsset($field){
		$content = 'ok';
		static $cache = array();
		
		if(@$field->value){
			$value = $field->value;
		}else{
			$value = $this->getValue($field);
		}
		
		$name = '';
		if($value){
			$name .= '['.$value.'] ';
			if(@$field->table && $this->metaBot->getDB()->columnExists($field->table, 'name_lc')){
				$name .= $this->metaBot->getDB()->select('name_lc FROM '.$field->table.' WHERE id='.$value, Database::RES_UNIQUE, Database::FETCH_UNIQUE);
			}elseif(@$field->table && $this->metaBot->getDB()->columnExists($field->table, 'name')){
				$name .= $this->metaBot->getDB()->select('name FROM '.$field->table.' WHERE id='.$value, Database::RES_UNIQUE, Database::FETCH_UNIQUE);
			}else{
				$name .= '???';
			}
		}
		$requestParam = @$field->requestParam;
		$content = '<input type="hidden" value="'.$value.'" id="'.$field->name.'" name="'.$field->name.'"/>';
		$content .= '<input style="width:200px" type="text" disabled="disabled" value="'.$name.'" id="'.$field->name.'Name" name="'.$field->name.'Name"/>';
		$content .= ' <img src="'.WEB_STATIC_URI.'vendor/metabot/img/icons/page_white_edit.png" align="absmiddle" style="cursor:pointer" title="Modifier" onclick="selectAsset('.$field->configName.',function(dataList){Dom.get(\''.$field->name.'\').value=(dataList.length > 0?dataList[0].getData(\'id\'):0);Dom.get(\''.$field->name.'Name\').value=(dataList.length > 0?\'[\' + dataList[0].getData(\'id\') + \'] \' + dataList[0].getData(\'name_lc\'):\'\');},\''.$requestParam.'\');"/>';
		$content .= ' <img src="'.WEB_STATIC_URI.'vendor/metabot/img/icons/page_copy.png" align="absmiddle" style="cursor:pointer" title="Copier" onclick="copyAssetSelection(\''.$field->table.'\',\''.$field->name.'\')"/>';
		$content .= ' <img src="'.WEB_STATIC_URI.'vendor/metabot/img/icons/paste_plain.png" align="absmiddle" style="cursor:pointer" title="Coller" onclick="pasteAssetSelection(\''.$field->table.'\',\''.$field->name.'\')"/>';
		$content .= ' <img src="'.WEB_STATIC_URI.'vendor/metabot/img/icons/delete.png" align="absmiddle" style="cursor:pointer" title="X" onclick="Dom.get(\''.$field->name.'\').value=\'\';Dom.get(\''.$field->name.'Name\').value=\'\'"/>';
		$repeat = false;
		echo $this->createField($field, $content);
	}
	
	public function createVideo($field){
		static $videoId = 0;
		$videoId++;
		$audioId = 'form-video-sound-'.$videoId;
		$content = '<video id="form-video-'.$videoId.'" width="640" height="360" onplay="$(\'#'.$audioId.'\').get(0).play()" controls><source src="'.$this->getValue($field->name).'" type="video/ogg"></video>';
		if(@$field->audioField){
			$content .= '<audio id="'.$audioId.'"><source src="'.$this->getValue($field->audioField).'" type="audio/wav"></audio>';
		}
		
		echo $this->createField($field, $content);
	}
	
	public function createAudio($field){
		
		$content = '<audio controls><source src="'.$this->getValue($field->name).'" type="audio/wav"></audio>';
		
		echo $this->createField($field, $content);
	}
	
	public function createField($field, $input){
		$dep = @$field->dependance;
		$invertDep = ($dep[0] == '!');
		if($invertDep){
			$dep = substr($dep, 1);
		}
		echo '<div class="control-group" id="'.$field->name.'-row"';
		if(@$field->dependance){
			$value = (int)$this->getValue($dep);
			if((!$invertDep && !$value) || ($invertDep && $value)){
				echo ' style="display:none"';
			}
		}
		echo '>';
		if(@$field->label){
			echo '<label class="control-label" for="'.$field->name.'">'.$field->label.(@$field->info?'<br/><em>'.$field->info.'</em>':'').'</label>';
			echo '<div class="controls">'.$input.'</div>';
		}else{
			echo $input;
		}
		echo '</div>';
	}
	
	public function getValue($field){
		if(is_object($field)){
			if(isset($field->value)){
				return $field->value;
			}else{
				$field = $field->name;
			}
		}
		return @$this->formData[$field];
	}

	public function getProjectId(){
		return $this->projectManager?$this->projectManager->getProjectId():-1;
	}
	
	public function getUserId(){
		return $this->userManager?$this->userManager->getUserId():-1;
	}
	
	public function getInputSpanSize(){
		return $this->isModal?self::MODAL_INPUT_SPAN_SIZE:self::INPUT_SPAN_SIZE; 
	}
}
