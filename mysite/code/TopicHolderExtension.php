<?php

use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\GridField\GridFieldConfig_RecordViewer;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\ORM\DataExtension;
use UndefinedOffset\SortableGridField\Forms\GridFieldSortableRows;
	class TopicHolderExtension extends DataExtension{
		private static $db = array(

		);

		private static $has_one = array(
		);

        private static $header_type = 'dark-header';

		public function SortedTopics(){
			$topics = Topic::get()->filter(array('ParentID' => $this->owner->ID))->sort('GgSortOrder');
			return $topics;
		}
		public function getPageTypeTheme(){
			return "dark-header";
		}
		public function updateCMSFields(FieldList $fields) {
			$fields->removeByName('MetaData');
			$fields->removeByName('Dependent');
			// $fields->removeByName('Blocks');
			$fields->removeByName('Widgets');
			$fields->removeByName('Questions');
			$fields->removeByName('BackgroundImage');
			$conf=GridFieldConfig_RecordViewer::create(20);
			//$conf->removeComponent('AddNew');
			$conf->addComponent(new GridFieldSortableRows('GgSortOrder'));

 			$fields->removeFieldFromTab('Root.Main', 'Content');
      		$fields->addFieldToTab('Root.Topics', new HTMLEditorField('Content','Content'));
			$fields->addFieldToTab('Root.Sorting', new GridField('Topics', 'Feature these topics in the following order', Topic::get(), $conf));
		}

		public function getTopics(){
			//echo 'hello';
			$topics = Topic::get()->sort('GgSortOrder');

			return $topics;

		}
	}
