
$Header
<main class="main-content__container" id="main-content__container">
    <% if $BackgroundImage %>
        <% include FeaturedImage %>
    <% end_if %>

    <% if $YoutubeBackgroundEmbed %>
        <div class="backgroundvideo">
            <div id="ESEE" class="backgroundvideo__container" data-interchange="[http://img.youtube.com/vi/$YoutubeBackgroundEmbed/sddefault.jpg, small], [http://img.youtube.com/vi/$YoutubeBackgroundEmbed/maxresdefault.jpg, large]">
                <a href="http://www.youtube.com/embed/$YoutubeBackgroundEmbed" data-video="$YoutubeBackgroundEmbed" class="backgroundvideo__link">
                </a>
            </div>
        </div>
    <% end_if %>

    <div class="column row">
        <div class="main-content__header">
            <% if not $BackgroundImage %>
                $Breadcrumbs
                <h1>$Title</h1>
            <% end_if %>
            <div class="blogmeta">
                <% if not $Parent.HideDatesAndAuthors %>
                    <% include ByLine %>
                <% end_if %>
                <ul class="social-icons">
                    <li><a href="javascript:window.open('http://www.facebook.com/sharer/sharer.php?u=$AbsoluteLink', '_blank', 'width=400,height=500');void(0);"  title="Share on Facebook"><img src="{$ThemeDir}/dist/images/icon_facebook.png" alt="Share on Facebook"></a>
                    </li>
                    <li><a href="https://twitter.com/intent/tweet?text=$AbsoluteLink" title="Share on Twitter" target="_blank"><img src="{$ThemeDir}/dist/images/icon_twitter.png" alt="Share on Twitter"></a></li>
                    <li><a href="javascript:window.open('https://www.linkedin.com/cws/share?url=$AbsoluteLink', '_blank', 'width=400,height=500');void(0);" title="Share on LinkedIn" target="_blank"><img src="{$ThemeDir}/dist/images/icon_linkedin.png" alt="share on linkedid"></a></li>
                </ul>
            </div>
        </div>
    </div>


    $BeforeContent

    <div class="row">
        <article role="main" class="main-content main-content--with-padding <% if $Children || $Menu(2) || $SidebarArea.Elements ||  $SidebarView.Widgets %>main-content--with-sidebar<% else %>main-content--full-width<% end_if %>">
            $BeforeContentConstrained
            <div class="main-content__text">
                <% if $FeaturedImage %>
                    <p><img class="dp-lazy" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-original="$FeaturedImage.ScaleWidth(860).URL" <% if $FeaturedImageAltText %> alt="$FeaturedImageAltText" <% else %> alt="" role="presentation" <% end_if %>width="840" height="$FeaturedImage.ScaleWidth(860).Height" /></p>
                <% end_if %>
                $Content
        <% if $Address || $Location %>
          <h2>Located here:</h2>
          $GoogleMap
        <% end_if %>
        <% if $Links %>
          <h2>Additional links:</h2>
          <ul>
          <% loop $Links %>
            <li><a href="$URL" target="_blank"><% if $Title %>$Title<% else %>$URL.LimitCharacters(50)<% end_if %></a></li>
          <% end_loop %>
          </ul>
        <% end_if %>
                <% if $ExternalURL %>
                    <p><a href="$ExternalURL" class="button--shaded" target="_blank">$ExternalURLText</a></p>
                <% end_if %>
                $AfterContentConstrained
            </div>
            <% include TagsCategories %>
            $Form
            <% include TopicRelated %>
        </article>
        <% if $Children || $Menu(2) || $SidebarArea.Elements ||  $SidebarView.Widgets %>
            <aside class="sidebar dp-sticky">
                <% include SideNav %>
                <% if $SideBarView %>
                    $SideBarView
                <% end_if %>
                $SidebarArea
            </aside>
        <% end_if %>
    </div>
    $AfterContent


</main>

<% if $LocationPages %>
<div class="block_area block_area_aftercontent">
  <section class="content-block__container recentnews" aria-labelledby="RelatedNewsSection">
    <div class="content-block row">
      <div class="newsblock">
        <div class="column">
          <h3 class="newsblock-title text-center" id="RelatedNewsSection">Related locations</h3>
        </div>
        <ul class="medium-up-3 ">
          <% loop $LocationPages %>
            <li class="column column-block">
              <% include LocationCard %>
            </li>
          <% end_loop %>
        </ul>
      </div>
    </div>
  </section>
</div>
<% end_if %>


