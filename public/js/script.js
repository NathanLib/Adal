$(window).on("load", function () {
    // Initialisation des variables
    var totalHeight = $("#scroller").height();
    var delta = 0;
    var scrollTop = 0;
    var timeMax = 360; // = 6 minutes

    displayMetrics();

    $("#launch-audio").click(function () {
        playAudio(scrit_audio, "audio_menu");
    });

    $(window).scroll(function () {
        scrollTop = $("body,html").scrollTop();
        delta = scrollTop / totalHeight;

        posS = delta * timeMax;

        render(posS);
        // audioManager(posS);

        // Display dynamic metrics
        $("#scroll-position").text("Scroll position : " + $("body,html").scrollTop());
        $("#posS").text("PosS : " + posS.toFixed(3));
    });
});

$(window).on("beforeunload", function () {
    $(window).scrollTop(0);
});

function findWithName(array, value) {
    return array.findIndex(item => item.name === value);
}

function playAudio(array, name) {
    audios[findWithName(array, name)].object.play();
}

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

function audioManager(posS) {
    for (let i = 0; i < audios.length; i++) {
        const audio = script_audio[i];

        var src = new Audio(audio.source);
        src.loop = true;

        if (posS >= audio.start && posS <= audio.end && src.paused) {
            src.play();
        } else {
            src.pause();
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
            }
        ],
        defaultProperties: {
            scale: 1,
            opacity: 0.5,
            translateX: 0
        }
    },

    {
        type: "persos",
        name: "scene1plan2-persos",
        start: 0,
        end: 60,
        states: [
            {
                type: "translateX",
                startValue: 0,
                endValue: 0.5,
                start: 30,
                end: 60
            }
        ],
        defaultProperties: {
            scale: 1,
            opacity: 1,
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
];

// const script_audio = [
//     {
//         type: "audio",
//         name: "scene1plan2-audio",
//         source: "public/sounds/childs-laugh.mp3",
//         start: 30,
//         end: 60,
//         states: [
//             // {
//             //     type: "volume-fadeIn",
//             //     startValue: 0,
//             //     endValue: 1,
//             //     start: 100,
//             //     end: 350
//             // }
//         ]
//     }
// ];

const scrit_audio = [
    {
        name: "audio_menu",
        object: new Audio("public/sounds/safari-loop.wav", { loop: true })
    },
    {
        name: "audio_scene1plan2_child",
        object: new Audio("public/sounds/childs-laugh.mp3", { loop: true })
    },
    {
        name: "audio_scene1plan2_camel",
        object: new Audio("public/sounds/camel-ride-india.wav", { loop: true })
    }
];
