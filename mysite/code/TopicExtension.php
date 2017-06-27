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

		}


	}