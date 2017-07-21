<header id="header" class="header header--dark-header header--gg-home" role="banner">
			<div class="nav__toggle nav__toggle--menu show-for-small hide-for-medium">
				<div class="nav__link nav__link--{$DarkLight} nav__link--mobile-toggle" data-toggle="offCanvas"><span class="nav__menu-icon nav__menu-icon--{$DarkLight}" id="nav__menu-icon"></span><span class="nav__menu-text nav__menu-text--{$DarkLight}" id="nav__menu-text">Menu</span></div>
			</div>

			<div class="nav__wrapper nav__wrapper--overlay nav__wrapper--{$DarkLight} nav__wrapper--gg-home" id="nav__wrapper">

				<nav role="nav" class="" aria-label="Main menu">
					
					<ul class="nav nav--{$DarkLight} nav--no-bg clearfix" id="nav">
						<% loop $Menu(1) %>
						<li class="nav__item nav__item--{$Top.DarkLight} <% if $FirstLast %>nav__item--$FirstLast<% end_if %><% if $Children %> nav__item--parent<% end_if %> nav__item--{$LinkOrCurrent} nav__item--{$LinkOrSection}">
							<a class="nav__link nav__link--{$Top.DarkLight}<% if $Children %> nav__link--parent<% end_if %> nav__link--small" href="$Link">$MenuTitle</a>
							<% if $Children %>
								<% if $Children.Count > 4 %>
									<ul class="subnav subnav--{$Top.DarkLight} subnav--two-columns">
										<% loop $Children %>
											<li class="subnav__item subnav__item--column <% if $FirstLast %>subnav__item--$FirstLast<% end_if %>"><a class="subnav__link subnav__link--{$Top.DarkLight}" href="$Link">$MenuTitle.LimitCharacters(30)</a></li>
										<% end_loop %>
									</ul>
								<% else %>
									<ul class="subnav subnav--{$Top.DarkLight}">
										<% loop $Children %>
											<li class="subnav__item <% if $FirstLast %>subnav__item--$FirstLast<% end_if %>"><a class="subnav__link subnav__link--{$Top.DarkLight}" href="$Link">$MenuTitle</a></li>
										<% end_loop %>
									</ul>
								<% end_if %>
							<% end_if %>
						</li>
						<% end_loop %>
						<li class="nav__item nav__item--{$DarkLight} nav__search-item" id="nav__search-item" >
							<div class="nav__link nav__link--{$DarkLight} nav__link--search">
								<i class="fa fa-lg fa-search site-search-button" aria-hidden="true"></i>
							</div>
						</li>
						<% include SiteSearch %>
					</ul>
				</nav>
			</div>
			<div class="nav__toggle nav__toggle--search show-for-small hide-for-medium">
				<div class="nav__link nav__link--{$DarkLight}"><i class="fa fa-lg fa-search site-search-button" aria-hidden="true"></i>
				</div>
			</div>
			<h1 class="header__gg-title">The <span>UI</span> Grad Guide</h1>

</header>
