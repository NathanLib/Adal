// Taille d'écran de référence : 1920x1080

$(window).on("load", function () {
    var backgroundEl = $("#story-background");
    var scrollerEl = $("#scroller");
    var storyEl = $("#story");

    displayMetrics();
    launchGame();

    // Init scroller height based on story width
    scrollerEl.height(backgroundEl.width());

    // ----------
    // -- FONCTION POUR LE SCROLL --
    // ----------
    $(window).scroll(function () {
        var pos = $(window).scrollTop();
        $("#scroll-position").text("Scroll postion : " + pos);

        // Map vertical scroll to story horizontal scroll
        storyEl.scrollLeft(pos);
    });

    // $("#rissani-door").scroll(function() {
    //     scaleOnScroll($('#rissani-door-img'));
    // });
});

function displayMetrics() {
    $("#window-width").text("Window width : " + $(window).innerWidth());
    $("#window-height").text("Window height : " + $(window).innerHeight());
    $("#story-width").text("Story width : " + $("#story-background").height());
}

function launchGame() {
    $("#splash-screen-btn").click(function () {
        $("#splash-screen").fadeOut();
        $("body").toggleClass("no-scroll");
    });
}

function scaleOnScroll(el) {
    var scaleScroll = ($(window).scrollTop() + 60) / 60; /* Is the ratio */ /* +60 to directly start at 1 */

    if (scaleScroll >= 1) {
        el.css("transform", "scale(" + scaleScroll + ", " + scaleScroll + ")");

        if (scaleScroll > 12) {
            el.fadeOut("slow");
        } else {
            el.fadeIn();
            $("#scroller").toggleClass("no-scroll");
            $("#scroller").toggleClass("scroll");
        }
    }
}
