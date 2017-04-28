<?php

	class TopicExtension extends DataExtension{
		private static $db = array(

		);

		private static $belongs_many_many = array (
			'Locations' => 'LocationPage'
		);

		public function updateCMSFields(FieldList $fields){

			$locationField = TagField::create(
						'Locations',
						'Relevant Locations',
						LocationPage::get(),
						$this->owner->Locations()
					)->setShouldLazyLoad(true)->setCanCreate(false);

			$fields->addFieldToTab('blog-admin-sidebar', $locationField, 'Tags');
		}

	}