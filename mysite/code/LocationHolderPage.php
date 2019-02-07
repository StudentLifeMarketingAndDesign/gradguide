<?php

use SilverStripe\Blog\Model\Blog;

class LocationHolderPage extends Blog {

	private static $db = array(
	);

	private static $has_one = array(

	);

	private static $has_many = array(
	);

	private static $singular_name = 'Location Holder';

	private static $plural_name = 'Location Holders';

	private static $allowed_children = array('LocationPage');
    public function getLumberjackTitle() {
        return 'Locations';
    }
	public function getCMSFields() {
		$f = parent::getCMSFields();
		//$f->removeByName("Content");
		//$gridFieldConfig = GridFieldConfig_RecordEditor::create();
		//$gridFieldConfig->addComponent(new GridFieldSortableRows('SortOrder'));

		/*$gridField = new GridField("StaffTeam", "Staff Teams", StaffTeam::get(), GridFieldConfig_RecordEditor::create());
		$f->addFieldToTab("Root.Main", $gridField); // add the grid field to a tab in the CMS	*/
		return $f;
	}

	public function RandomLocations(){
		return LocationPage::get()->filter(array('ParentID' => $this->ID))->sort('RAND()');
	}
}
