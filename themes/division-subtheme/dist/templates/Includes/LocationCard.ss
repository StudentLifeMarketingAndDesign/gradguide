<article class="bloglistitem clearfix ">
	<% if $Categories.exists %>
		<p class="bloglistitem__category">
		<% loop $Categories %>
			<a href="$Link" class="bloglistitem__category">$Title</a><% if not Last %><% else %><% end_if %>
		<% end_loop %>
		</p>
	<% end_if %>
	<% if $FeaturedImage %>
		<a href="$Link" class="location-card__img  border-effect">
			<img class="dp-lazy" data-original="$FeaturedImage.FocusFill(500,333).URL" width="500" height="333" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="$Title">
		</a>
	<% end_if %>
	<h3 class="bloglistitem__heading"><a href="$Link">$Title</a></h3>

	<div class="bloglistitem__content<% if $FeaturedImage || $BackgroundImage || $YoutubeBackgroundEmbed %>--wimage<% end_if %>">
		<% if $Summary %>
			<div class="bloglistitem__desc">$Summary</div>
		<% else %>
			<p class="bloglistitem__desc">$Content.LimitCharacters(150) <%-- <a href="$Link">Continue reading</a> --%></p>
		<% end_if %>
	</div>
</article>