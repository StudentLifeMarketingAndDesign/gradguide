<header class="masthead">
  <a href="https://vp.studentlife.uiowa.edu" target="_blank"><amp-img src="https://vp.studentlife.uiowa.edu/themes/division-subtheme/dist/images/uiowa.png" width="195" height="24" class="masthead-img"></amp-img></a>
  <a class="title" href="$AbsoluteBaseURL" target="_blank">$SiteConfig.Title</a>
</header>
<main role="main">
  <article>
    <header>
      <h1 class="headline">$Title</h1>
      <% if $FeaturedImage %>
        <amp-img src="$FeaturedImage.FocusFill(1024,682).AbsoluteURL" width="1024" height="682" layout="responsive"></amp-img></p>
      <% end_if %>
    </header>

    <div class="main-column">
      <p>
        <amp-social-share type="facebook" width="40" height="40" data-param-app_id="127918570561161" class="social-share"></amp-social-share>
        <amp-social-share type="twitter" width="40" height="40" class="social-share"></amp-social-share>
        <amp-social-share type="linkedin" width="40" height="40" class="social-share"></amp-social-share>
        <amp-social-share type="email" width="40" height="40" class="social-share"></amp-social-share>
      </p>

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

    </div>
  </article>
  <% include AmpFooter %>
</main>
