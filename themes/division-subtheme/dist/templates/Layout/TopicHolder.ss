
$Header


<div class="hero hero--content hero--center">
    <div class="hero__imgwrap hero__imgwrap--medium hero__imgwrap--image" style="background-image:url({$ThemeDir}/dist/images/ggheader.jpg); background-position: 50% 50%;">
    </div>


        <div class="hero__contentwrap grid-container">
            <div class="hero__content">

                    <h2>You're Here. Now what?</h2>

<a href="#resources" class="button">University Resources <i class="fas fa-arrow-right"></i></a>
                    <a href="event-calendar/" class="button">Find things to do <i class="fas fa-arrow-right"></i></a>


                    <a href="dining-entertainment-nightlife/" class="button">Popular places &amp; nightlife <i class="fas fa-arrow-right"></i></a>


            </div>
        </div>

</div>


$BeforeContent

<div class="row">
    <div class="large-8 columns large-centered" style="padding-top: 40px;">

                $Content
                <div id="resources">
                <% loop $SortedTopics %>
                   <% include BlogCardHorizontal %>
                <% end_loop %>
            </div>
    </div>

</div>



$AfterContent


