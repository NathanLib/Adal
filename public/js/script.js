$(window).on("load", function () {
    // Initialisation des variables
    var totalHeight = $("#scroller").height();
    var delta = 0;
    var scrollTop = 0;
    var timeMax = 360; // = 6 minutes

    displayMetrics();

    $(window).scroll(function () {
        scrollTop = $("body,html").scrollTop();
        delta = scrollTop / totalHeight;

        posS = delta * timeMax;

        render(posS);

        // Display metrics
        $("#scroll-position").text("Scroll position : " + $("body,html").scrollTop());
        $("#posS").text("PosS : " + posS.toFixed(3));
    });
});

function displayMetrics() {
    $("#window-width").text("Window width : " + $(window).innerWidth());
    $("#window-height").text("Window height : " + $(window).innerHeight());
    $("#scroller-width").text("Scroller width : " + $("#scroller").height());
}

function calculateRatio(posS, startValue, endValue, start, end) {
    if (posS >= start) {
        var posState = (posS - start) / (end - start);

        // Securize posState between 0 and 1
        posState = Math.min(1, Math.max(0, posState));

        var ratio = startValue + posState * (endValue - startValue);

        return ratio;
    } else {
        return null;
    }
}

function applyProperties(name, properties) {
    var imgWidth = $("#" + name).width();
    var screenWidth = $(window).innerWidth();
    var offset = imgWidth - screenWidth;

    var posX = -properties.translateX * offset;

    $("#" + name)
        .css("opacity", properties.opacity)
        .css("transform", "scale(" + properties.scale + ", " + properties.scale + ") translateX(" + posX + "px)");
}

// function scale(name, value) {
//     $("#" + name).css("transform", "scale(" + value + ", " + value + ")");
// }

// function opacity(name, value) {
//     $("#" + name).css("opacity", value);
// }

// function horizontalTranslate(name, value) {
//     var imgWidth = $("#" + name).width();
//     var screenWidth = $(window).innerWidth();
//     var offset = imgWidth - screenWidth;

//     console.log("Offset :" + offset);
//     var posX = -value * offset;

//     console.log(posX);

//     $("#" + name).css("transform", "translateX(" + posX + "px)");
// }

// Créer une fonction ease-in pour l'opacité
function render(posS) {
    for (let i = 0; i < script.length; i++) {
        const scene = script[i];

        if (posS >= scene.start && posS <= scene.end) {
            $("#" + scene.name).show();

            const properties = {
                scale: scene.defaultProperties.scale,
                opacity: scene.defaultProperties.opacity,
                translateX: scene.defaultProperties.translateX
            };

            if (scene.states.length > 0) {
                for (let j = 0; j < scene.states.length; j++) {
                    const state = scene.states[j];

                    switch (state.type) {
                        case "scale":
                            var ratio = calculateRatio(posS, state.startValue, state.endValue, state.start, state.end);
                            if (ratio != null) {
                                properties.scale = ratio;
                            }
                            break;

                        case "opacity":
                            var ratio = calculateRatio(posS, state.startValue, state.endValue, state.start, state.end);
                            if (ratio != null) {
                                properties.opacity = ratio;
                            }
                            break;

                        case "translateX":
                            var ratio = calculateRatio(posS, state.startValue, state.endValue, state.start, state.end);
                            if (ratio != null) {
                                properties.translateX = ratio;
                            }
                            break;

                        default:
                            break;
                    }
                }
            }

            applyProperties(scene.name, properties);
        } else {
            $("#" + scene.name).hide();
        }
    }
}

const script = [
    {
        type: "plan",
        name: "scene1plan1",
        start: 0,
        end: 30,
        states: [
            {
                type: "scale",
                startValue: 1,
                endValue: 10,
                start: 0,
                end: 30
            },
            {
                type: "opacity",
                startValue: 1,
                endValue: 0,
                start: 0,
                end: 30
            }
        ],
        defaultProperties: {
            scale: 1,
            opacity: 1,
            translateX: 0
        }
    },

    {
        type: "plan",
        name: "scene1plan2",
        start: 0,
        end: 60,
        states: [
            {
                type: "opacity",
                startValue: 0.5,
                endValue: 1,
                start: 0,
                end: 10
            },
            {
                type: "translateX",
                startValue: 0,
                endValue: 1,
                start: 30,
                end: 60
            },
            {
                type: "opacity",
                startValue: 1,
                endValue: 0.1,
                start: 40,
                end: 60
            }
        ],
        defaultProperties: {
            scale: 1,
            opacity: 0.5,
            translateX: 0
        }
    }

    // {
    //     type: "plan",
    //     name: "scene1plan2",
    //     start: 700,
    //     end: 1000,
    //     states: [
    //         {
    //             type: "paused",
    //             startValue: 0,
    //             endValue: 1,
    //             start: 700,
    //             end: 1000
    //         }
    //     ]
    // },

    // {
    //     type: "audio",
    //     name: "scene1plan2-audio",
    //     source: "public/sounds/childs-laugh.mp3",
    //     start: 100,
    //     end: 700,
    //     states: [
    //         {
    //             type: "volume-fadeIn",
    //             startValue: 0,
    //             endValue: 1,
    //             start: 100,
    //             end: 350
    //         }
    //     ]
    // }
];
