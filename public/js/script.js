// Initialisation des variables globales
var isAudioAllowed = false;

$(window).on("load", function () {
    // Initialisation des variables
    var totalHeight = $("#scroller").height();
    var delta = 0;
    var scrollTop = 0;
    var timeMax = 360; // = 6 minutes

    displayMetrics();
    applyLoopAudios();

    $("#launch-audio").click(function () {
        var audio_menu = new Audio("public/sounds/safari-loop.wav", { loop: true });
        audio_menu.play();

        setTimeout(() => {
            audio_menu.pause();
        }, 2000);
    });

    $("#homescreen_btn_wrapper").click(function () {
        launchGame();
    });

    $("#sounds").click(function () {
        toggleSound();
    });

    $("auto-play").click(function () {
        autoPlay();
    });

    $(window).scroll(function () {
        scrollTop = $("body,html").scrollTop();
        delta = scrollTop / totalHeight;

        posS = delta * timeMax;

        render(posS);

        // Display dynamic metrics
        $("#scroll-position").text("Scroll position : " + $("body,html").scrollTop());
        $("#posS").text("PosS : " + posS.toFixed(3));
    });
});

$(window).on("beforeunload", function () {
    $(window).scrollTop(0);
});

function displayMetrics() {
    $("#window-width").text("Window width : " + $(window).innerWidth());
    $("#window-height").text("Window height : " + $(window).innerHeight());
    $("#scroller-width").text("Scroller width : " + $("#scroller").height());
}

function launchGame() {
    $("body").toggleClass("no-scroll");
    $("#homescreen").fadeOut("slow");

    //Autorise le son si ce n'est pas déjà fait
    !isAudioAllowed ? toggleSound() : (isAudioAllowed = false);
}

function toggleSound() {
    // Change le statut du booléen qui gère le son
    if ($("#sounds #sound-off").hasClass("d-none")) {
        isAudioAllowed = false;

        for (let i = 0; i < script.length; i++) {
            const scene = script[i];

            for (let j = 0; j < scene.audios.length; j++) {
                const audio = scene.audios[j];
                audio.object.pause();
            }
        }
    } else {
        isAudioAllowed = true;
    }

    // Change l'icon du bouton
    $("#sounds #sound-off").toggleClass("d-none");
    $("#sounds #sound-on").toggleClass("d-none");
}

function applyLoopAudios() {
    script.forEach(element => {
        element.audios.forEach(audio => {
            audio.loop ? (audio.object.loop = true) : (audio.object.loop = false);
        });
    });
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

// Créer une fonction ease-in pour le render

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

            applyProperties(scene.name, properties);
        } else {
            $("#" + scene.name).hide();
        }

        for (let k = 0; k < scene.audios.length; k++) {
            const audio = scene.audios[k];

            if (posS >= audio.start && posS <= audio.end && isAudioAllowed) {
                if (audio.object.paused) {
                    audio.object.play();
                }
            } else {
                if (!audio.object.paused) {
                    audio.object.pause();
                }
            }
        }
    }
}

function soundManager(scene) {}

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
        },
        audios: []
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
        },
        audios: [
            {
                name: "childs-laugh",
                object: new Audio("public/sounds/childs-laugh.mp3"),
                loop: true,
                start: 30,
                end: 60
            },

            {
                name: "camel-ride-india",
                object: new Audio("public/sounds/camel-ride-india.wav"),
                loop: true,
                start: 45,
                end: 60
            }
        ]
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
        },
        audios: []
    }
];
