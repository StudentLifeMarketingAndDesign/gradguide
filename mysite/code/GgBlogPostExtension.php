<?php

use SilverStripe\ORM\DataExtension;

    class GgBlogPostExtension extends DataExtension{
        private static $db = array(

            'WebsiteURL' => 'Text'

        );

        private static $belongs_many_many = array (


        );


    }
