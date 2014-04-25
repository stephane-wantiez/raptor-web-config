<?php
namespace lib3dduo\casualCrossing\metabot;

abstract class SpecialPage{
	
	public abstract function getId();
	
	public abstract function getLabel();
	
	public abstract function display();
	
	public function getLink(){
		return false;
	}
}
