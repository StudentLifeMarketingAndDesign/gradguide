<?php

	class TopicHolderExtension extends DataExtension{
		private static $db = array(
			
		);

		private static $default_sort = 'GgSortOrder';
		private static $has_one = array(
		);

		public function SortedTopics(){
			$topics = Topic::get()->filter(array('ParentID' => $this->owner->ID))->sort('GgSortOrder');
			return $topics;
		}
	}