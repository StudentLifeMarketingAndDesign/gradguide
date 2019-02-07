$Header
<main class="main-content__container" id="main-content__container">
	<!-- Background Image Feature -->
	<% if $BackgroundImage %>
		<% include FeaturedImage %>
	<% end_if %>
	$Breadcrumbs
	<div class="column row">
		<div class="main-content__header">
			<h1 class="page-title">
				<% if $ArchiveYear %>
					<%t Blog.Archive 'Archive' %>:
					<% if $ArchiveDay %>
						$ArchiveDate.Nice
					<% else_if $ArchiveMonth %>
						$ArchiveDate.format('F, Y')
					<% else %>
						$ArchiveDate.format('Y')
					<% end_if %>
				<% else_if $CurrentTag %>
					<%t Blog.Tag 'Tag' %>: $CurrentTag.Title
				<% else_if $CurrentCategory %>
					<%t Blog.Category 'Category' %>: $CurrentCategory.Title
				<% else %>
					
				<% end_if %>
			</h1>
		</div>
	</div>

	$BlockArea(BeforeContent)

	<div class="row">
		<div role="main" class="main-content main-content--with-padding <% if $Children || $Menu(2) || $SidebarBlocks ||  $SidebarView.Widgets %>main-content--with-sidebar<% else %>main-content--full-width<% end_if %>">
			$BlockArea(BeforeContentConstrained)
			<div class="main-content__text">
				$Content
				<% if $PaginatedList %>
					<div class="row large-up-2">
					<% loop $PaginatedList %>
						<div class="column column-block">
							<% include LocationCard %>
						</div>
					<% end_loop %>
					</div>
				<% end_if %>

				$BlockArea(AfterContentConstrained)
				$Form
				$CommentsForm

				<% with $PaginatedList %>
					<% include Pagination %>
				<% end_with %>

			</div>
		</div>
		<aside class="sidebar">
			<% include SideNav %>
			<% if $SideBarView %>
				$SideBarView
			<% end_if %>
			$BlockArea(Sidebar)
		</aside>
	</div>
	$BlockArea(AfterContent)
</main>