<?php
class LocationPage extends BlogPost {

	private static $db = array(
	);

	private static $has_one = array(

		// 'Image' => 'Image'

	);

	private static $has_many = array(
	);

	private static $many_many = array(
		// 'Tags' => 'BlogTag',
		'Topics' => 'Topic'
	);

	private static $defaults = array(
		'Suburb' => 'Iowa City',
		'State' => 'IA',
		'Country' => 'United States'

	);

	private static $singular_name = 'Location';

	private static $plural_name = 'Locations';

	private static $allowed_children = array();

	private static $can_be_root = false;

	public function getCMSFields() {
		$f = parent::getCMSFields();

		$f->removeByName('Authors');
		$f->removeByName('AuthorNames');
		$f->removeByName('PhotosBy');
		$f->removeByName('PhotosByEmail');
		$f->renameField('Suburb', 'City');
		$f->renameField('Postcode', 'ZIP Code');
		$f->renameField('ExternalURL', 'Location\'s website');
		$f->renameField('IsFeatured', 'Feature this location near the top of the page?');

		// $f->addFieldToTab('Root.Main', new UploadField('Image', 'Image'), 'Content');

		// $tagsField = TagField::create(
		// 				'Tags',
		// 				'Tags',
		// 				BlogTag::get(),
		// 				$this->Tags()
		// 			)->setShouldLazyLoad(true)->setCanCreate(false);

		// $topicsField = TagField::create(
		// 				'Topics',
		// 				'Relevant specific topics',
		// 				Topic::get(),
		// 				$this->Topics()
		// 			)->setShouldLazyLoad(true)->setCanCreate(false);

		// $f->addFieldToTab('Root.Main', $tagsField, 'Content');
		// $f->addFieldToTab('Root.Main', $topicsField, 'Content');
		// //$f->removeByName("Content");
		//$gridFieldConfig = GridFieldConfig_RecordEditor::create();
		//$gridFieldConfig->addComponent(new GridFieldSortableRows('SortOrder'));

		/*$gridField = new GridField("StaffTeam", "Staff Teams", StaffTeam::get(), GridFieldConfig_RecordEditor::create());
		$f->addFieldToTab("Root.Main", $gridField); // add the grid field to a tab in the CMS	*/
		return $f;
	}
    public function getAddressEncoded(){
    	$address = $this->obj('Address')->getValue();

    	return rawurlencode($address);
    }
	/**
	 * Returns a static google map of the address, linking out to the address.
	 *
	 * @param int $width
	 * @param int $height
	 * @return string
	 */
	public function GoogleMap() {
		$data = $this->owner->customise(array(
			'Address' => rawurlencode($this->getFullAddress()),
			'GoogleAPIKey' => Config::inst()->get('GoogleGeocoding', 'google_api_key')
		));
		return $data->renderWith('TopicGoogleMap');
	}
}

class LocationPage_Controller extends BlogPost_Controller {

	/**
	 * An array of actions that can be accessed via a request. Each array element should be an action name, and the
	 * permissions or conditions required to allow the user to access it.
	 *
	 * <code>
	 * array (
	 *     'action', // anyone can access this action
	 *     'action' => true, // same as above
	 *     'action' => 'ADMIN', // you must have ADMIN permissions to access this action
	 *     'action' => '->checkAction' // you can only access this action if $this->checkAction() returns true
	 * );
	 * </code>
	 *
	 * @var array
	 */
	// private static $allowed_actions = array(
	// );

	public function init() {
		parent::init();
	}

}