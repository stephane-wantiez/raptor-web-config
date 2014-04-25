<?php
namespace lib3dduo\casualCrossing\metabot;

use lib3dduo\utils\Utils;
use lib3dduo\database\Database;
use lib3dduo\database\Data;

class ImageGenerator{
	
	private $metaBot;
	
	public function __construct(MetaBot $metaBot){
		$this->metaBot = $metaBot;
	}
	
	public function handleGrid(){
		$sizeX = (int)@$_REQUEST['sizeX'];
		$sizeY = (int)@$_REQUEST['sizeY'];
				
		$img = imagecreatetruecolor($sizeX, $sizeY);
		imagealphablending($img, false);
		imagesavealpha($img, true);
		$transparent = imagecolorallocatealpha($img, 255, 0, 255, 127);
		imagefill($img, 0, 0, $transparent);
		
		$black = imagecolorallocate($img, 200, 200, 200);
		imageline($img, 0, $sizeY - 1, $sizeX - 1, $sizeY - 1, $black);
		imageline($img, $sizeX - 1, 0, $sizeX - 1, $sizeY - 1, $black);
		
		header('Content-Type: image/png');
		imagepng($img);
	}
}
