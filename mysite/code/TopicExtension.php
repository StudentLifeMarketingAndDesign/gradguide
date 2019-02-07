<?php

use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextField;
use SilverStripe\TagField\TagField;
use SilverStripe\ORM\DataExtension;

	class TopicExtension extends DataExtension{
		private static $db = array(
			'GgSortOrder' => 'Int'
		);

		private static $belongs_many_many = array (
			'LocationPages' => 'LocationPage'
		);

		private static $default_sort = 'GgSortOrder';
		private static $has_one = array(
			// "GradGuideHomePage" => "GradGuideHomePage",
		);

		public function updateCMSFields(FieldList $fields){

			// $locationGridFieldConfig = GridFieldConfig_RelationEditor::create();

			// $locationGridField = GridField::create('LocationPages', 'Relevant locations', $this->owner->LocationPages(), $locationGridFieldConfig);

			// $fields->addFieldToTab('Root.Main', $locationGridField);

        $fields->addFieldToTab('Root.Main', TextField::create('ExternalURL'));

		$lField = TagField::create(
						'LocationPages',
						'Locations relevant to this topic:',
						LocationPage::get(),
						$this->owner->LocationPages()
					)->setShouldLazyLoad(true)->setCanCreate(false);

		$fields->addFieldToTab('Root.Main', $lField);


		}


	}
