<?php

use SilverStripe\ORM\DataExtension;

	class GgBlogTagExtension extends DataExtension{
		private static $db = array();

		private static $belongs_many_many = array (
			'Locations' => 'LocationPage'

		);


	}