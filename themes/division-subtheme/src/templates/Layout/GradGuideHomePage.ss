
<div class="header__container header__container--dark header__container--overlay header__container--no-border header__container--gg-home">
	<div class="header__gg-screen">
		<% include DivisionBar %>
		<% include HeaderGradGuideHomePage %>
		
		<!-- <p class="text-center"><a href="#" class="gg-tag">Events &amp; Nightlife</a></p>
 		<div class="gg-event-slider__container">
			<div class="gg-event-slider">
				<% with $LocalistCalendar %>
					<% loop $EventList.Limit(6) %>
						<div class="gg-event-slider__event" style="background-image: url($Image.URL);">
							<a class="gg-event-slider__link" href="$Link">
							</a>
						</div>
					<% end_loop %>
				<% end_with %>
			</div>
		</div> -->

	</div>
</div>

<div class="gg-home-content__container" style="clear: both;">

<div class="row">

	<div class="gg-home-content large-12 columns">
		<h2 class="text-center gg-home-content__main-header">You're here. Now what?</h2>

		<div class="row">
			<div class="large-8 large-offset-1 columns">
				
				$Content
				<% loop $Topics %>
					<div class="gg-topicpreview">
						<a class="gg-topicpreview__link" href="$Link">
							<div class="row">
								<div class="medium-7 columns">
									<h3>$Title</h3>
									<div class="gg-topicpreview__content">
										$Content.NoHTML.LimitCharacters(100)
									</div>
									<p><span class="keep-reading">Keep reading &rarr;</span></p>
								</div>
								<div class="medium-5 columns">
									<% if $FeaturedImage %>
										<img class="gg-topicpreview__image" src="$FeaturedImage.URL" alt="" role="presentation" />
									<% end_if %>
								</div>

							</div>
						</a>
					</div>
				<% end_loop %>
			</div>
			<div class="large-3 columns dp-sticky">
			$BlockArea(Sidebar)
			</div>
		</div>


<%-- 		<div class="row small-up-1 large-up-2">
			<% loop $Topics %>
			<div class="column column-block">
				<div class="gg-topiclist__item">
					<h3 class="gg-topiclist__heading"><a href="$Link">$Title</a></h3>
					$Content
				</div>
			</div>
			<% end_loop %>
		</div> --%>
		$BlockArea(AfterContent)

	</div>

</div>

<%-- 
<p class="text-center"><a href="#" class="gg-tag">Places to go</a></p> --%>



</div>