<?php

	class TopicExtension extends DataExtension{
		private static $db = array(
			'GgSortOrder' => 'Int'
		);

		private static $belongs_many_many = array (

		);
		private static $has_one = array(
			// "GradGuideHomePage" => "GradGuideHomePage",
		);

		public function updateCMSFields(FieldList $fields){

		}

	}