<?php

use SilverStripe\Forms\GridField\GridFieldConfig_RecordViewer;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Core\Config\Configurable;
class GradGuideHomePage extends Page {

    use Configurable;

    private static $has_many = array(

    );

    private static $header_type = 'dark-header';


	public function getCMSFields() {
		$fields=parent::getCMSFields();
		$fields->removeByName('LayoutType');

		$conf=GridFieldConfig_RecordViewer::create(20);
		//$conf->removeComponent('AddNew');
		$conf->addComponent(new GridFieldSortableRows('GgSortOrder'));

		$fields->addFieldToTab('Root.Main', new GridField('Topics', 'Feature these topics in the following order', Topic::get(), $conf));

		return $fields;
	}

	public function getTopics(){
		//echo 'hello';
		$topics = Topic::get()->sort('GgSortOrder');

		return $topics;

	}
}
