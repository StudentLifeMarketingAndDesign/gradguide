<?php

use SilverStripe\Core\Config\Config;
use SilverStripe\Blog\Model\BlogPost;
use SilverStripe\Forms\TextField;
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
		$f->addFieldToTab('Root.Main', new TextField('WebsiteURL', 'Location\'s website'), 'Content');
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
