<?php

	class TopicExtension extends DataExtension{
		private static $db = array(
			'GgSortOrder' => 'Int'
		);

		private static $belongs_many_many = array (
			'LocationPages' => 'LocationPage'
		);
		private static $has_one = array(
			// "GradGuideHomePage" => "GradGuideHomePage",
		);

		public function updateCMSFields(FieldList $fields){

			// $locationGridFieldConfig = GridFieldConfig_RelationEditor::create();

			// $locationGridField = GridField::create('LocationPages', 'Relevant locations', $this->owner->LocationPages(), $locationGridFieldConfig);

			// $fields->addFieldToTab('Root.Main', $locationGridField);

		$lField = TagField::create(
						'LocationPages',
						'Locations relevant to this topic:',
						LocationPage::get(),
						$this->owner->LocationPages()
					)->setShouldLazyLoad(true)->setCanCreate(false);

		$fields->addFieldToTab('blog-admin-sidebar', $lField);
		}


	}