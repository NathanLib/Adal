// Initialisation des variables globales
var isAudioAllowed = false;
var isAutoPlay = false;
var isTextDisplayed = true;
var isSourceAvailable = false;

var wasAudio = false;
var wasAutoPlay = false;

var delta = 0;
var scrollTop = 0;
var timeMax = 20000;
var totalHeight = 0;

$(window).on("load", function () {
	// Attribution des valeurs
	totalHeight = $("#scroller").height();

	//Cache tous les boutons de contrôle et la mini-map tant qu'on est sur la homescreen
	$(".controls").hide();
	$("#map").hide();

	displayMetrics();
	applyLoopAudios();
	syncControlsBtnAnimations();

	//Réinitialise le scroll au refresh de la page
	//https://stackoverflow.com/questions/9316415/the-same-old-issue-scrolltop0-not-working-in-chrome-safari
	window.setTimeout(function () {
		$(window).scrollTop(0);
	}, 0);

	$(".start, .control, .close-source").click(function () {
		switch ($(this).attr("id")) {
			case "homescreen_btn_wrapper":
				launchGame();
				break;
			case "sounds":
				toggleSound();
				break;
			case "texts":
				toggleText();
				break;
			case "auto-play":
				toggleAutoPlay();
				break;
			case "information":
				displaySource();
				break;
			case "close-source":
				closeSource();
				break;
		}
	});

	//Contrôle de la mini-map
	$("#pins g").each(function () {
		$(this).hover(function () {
			switch ($(this).attr("id")) {
				case "pin-rissani":
					$("#pin-rissani-hover").toggleClass("d-none");
					break;
				case "pin-sebiba":
					$("#pin-sebiba-hover").toggleClass("d-none");
					break;
				case "pin-alexandrie":
					$("#pin-alexandrie-hover").toggleClass("d-none");
					break;
			}
		});
		$(this).click(function () {
			var id = $(this).attr("id");
			goToDestination(id);
		});
	});

	$(window).scroll(function () {
		scrollTop = $("html, body").scrollTop();
		delta = scrollTop / totalHeight;

		posS = delta * timeMax;

		render(posS);

		// Display dynamic metrics
		$("#scroll-position").text(
			"Scroll position : " + $("html, body").scrollTop()
		);
		$("#posS").text("PosS : " + posS.toFixed(3));
	});
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
	if (!isAudioAllowed) toggleSound();

	//Fait appparaitre tous les boutons de control et la mini-map
	$(".controls").show(1500);
	$("#map").show(1500);
}

function toggleSound() {
	// Change le statut du booléen qui gère le son
	if ($("#sounds #sound-off").hasClass("d-none")) {
		isAudioAllowed = false;
	} else {
		isAudioAllowed = true;
	}

	// Parcours tous les sons pour jouer ou stopper directement au clic du bouton
	fetchSounds();

	// Change l'icon du bouton
	$("#sounds #sound-on, #sounds #sound-off").toggleClass("d-none");
}

function fetchSounds() {
	script.forEach((scene) => {
		scene.audios.forEach((audio) => {
			if (posS >= audio.start && posS <= audio.end && isAudioAllowed) {
				if (audio.object.paused) audio.object.play();
			} else {
				if (!audio.object.paused) audio.object.pause();
			}
		});
	});
}

function toggleText() {
	// Change le statut du booléen qui gère l'affichage du texte
	isTextDisplayed = !isTextDisplayed;

	// Parcours tous les textes pour afficher ou enlever directement l'affichage au clic du bouton
	fetchTexts();

	// Change l'icon du bouton
	$("#texts #text-off, #texts #text-on").toggleClass("d-none");
}

function fetchTexts() {
	script.forEach((scene) => {
		scene.texts.forEach((text) => {
			if (posS >= text.start && posS <= text.end && isTextDisplayed) {
				$("#" + text.name).show();
			} else {
				$("#" + text.name).hide();
			}
		});
	});
}

// Problème Auto-Play sur Chrome et Firefox !!
function toggleAutoPlay() {
	isAutoPlay = !isAutoPlay;

	if (isAutoPlay) {
		// Bloque le scroll quand l'utilisateur est en mode auto-play
		$("body").addClass("no-scroll");

		var bottom = $("#scroller").height() - $(window).height();
		var duration = getDuration(bottom);

		$("html, body").animate(
			{
				scrollTop: bottom,
			},
			duration
		);
	} else {
		$("html, body").stop();
		$("body").removeClass("no-scroll");
	}

	// Change l'icon du bouton
	$("#auto-play #auto-play-on, #auto-play #auto-play-off").toggleClass(
		"d-none"
	);
}

function getDuration(target) {
	var currentTop = $(window).scrollTop(),
		rate = 3,
		distance;
	distance = Math.abs(currentTop - target);
	return distance * rate;
}

function displaySource() {
	var source = $("#information").data("source");

	if (!source) return;

	$("#" + source).removeClass("d-none");

	// Cache les boutons de control et la mini-map car problème de z-index avec position : fixed
	$(".controls").addClass("d-none");
	$("#map").addClass("d-none");

	// Bloque le scroll si la page source est ouverte
	$("body").addClass("no-scroll");

	// Coupe le son et l'auto-play
	if (isAudioAllowed) {
		wasAudio = true;
		toggleSound();
	}
	if (isAutoPlay) {
		wasAutoPlay = true;
		toggleAutoPlay();
	}
}

function closeSource() {
	var source = $("#information").data("source");

	if (!source) {
		return;
	}

	$("#" + source).addClass("d-none");

	// Ré-affiche les boutons de contrôle et la mini-map
	$(".controls").removeClass("d-none");
	$("#map").removeClass("d-none");

	// Débloque le scroll du body
	$("body").removeClass("no-scroll");

	// Rétablie le son et l'auto-play
	if (!isAudioAllowed && wasAudio) {
		toggleSound();
		wasAudio = false;
	}
	if (!isAutoPlay && wasAutoPlay) {
		toggleAutoPlay();
		wasAutoPlay = false;
	}
}

function applyLoopAudios() {
	script.forEach((element) => {
		element.audios.forEach((audio) => {
			audio.loop
				? (audio.object.loop = true)
				: (audio.object.loop = false);
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
		.css(
			"transform",
			"scale(" +
				properties.scale +
				", " +
				properties.scale +
				") translateX(" +
				posX +
				"px)"
		);
}

// Faire la fonction pour qu'elle marche avec le posS
function goToDestination(destination) {
	switch (destination) {
		case "pin-rissani":
			rissani_posS = 2.5;
			scrollTo(rissani_posS);
			break;
		default:
			break;
	}
}

function scrollTo(dest_posS) {
	if (isAutoPlay && !wasAutoPlay) {
		wasAutoPlay = true;
		toggleAutoPlay();
	}

	dest_scroll = Math.ceil((dest_posS * totalHeight) / timeMax);
	$("html, body").animate(
		{
			scrollTop: dest_scroll,
		},
		2000
	);

	if (wasAutoPlay) {
		wasAutoPlay = false;
		toggleAutoPlay();
	}
}

function render(posS) {
	for (let i = 0; i < script.length; i++) {
		const scene = script[i];

		// Reset du bouton information
		$("#information").data("source", "");
		$("#information").addClass("d-none");

		if (posS >= scene.start && posS <= scene.end) {
			$("#" + scene.name).show();

			const properties = {
				scale: scene.defaultProperties.scale,
				opacity: scene.defaultProperties.opacity,
				translateX: scene.defaultProperties.translateX,
			};

			for (let j = 0; j < scene.states.length; j++) {
				const state = scene.states[j];

				switch (state.type) {
					case "scale":
						var ratio = calculateRatio(
							posS,
							state.startValue,
							state.endValue,
							state.start,
							state.end
						);
						if (ratio != null) {
							properties.scale = ratio;
						}
						break;

					case "opacity":
						var ratio = calculateRatio(
							posS,
							state.startValue,
							state.endValue,
							state.start,
							state.end
						);
						if (ratio != null) {
							properties.opacity = ratio;
						}
						break;

					case "translateX":
						var ratio = calculateRatio(
							posS,
							state.startValue,
							state.endValue,
							state.start,
							state.end
						);
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

		for (let l = 0; l < scene.texts.length; l++) {
			const text = scene.texts[l];

			if (posS >= text.start && posS <= text.end && isTextDisplayed) {
				$("#" + text.name).show();
			} else {
				$("#" + text.name).hide();
			}
		}

		for (let m = 0; m < scene.information.length; m++) {
			const info = scene.information[m];

			if (posS >= info.start && posS <= info.end) {
				$("#information").data("source", info.name);
				$("#information").removeClass("d-none");
			}
		}
	}
}

function syncControlsBtnAnimations() {
	setInterval(function () {
		$(".control").toggleClass("pulse");
	}, 1500);
}

const script = [
	{
		type: "help",
		name: "start-help",
		start: 0,
		end: 3,
		states: [
			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 0,
				end: 3,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 1,
			translateX: 0,
		},
		audios: [],
		texts: [],
		information: [],
	},

	{
		type: "plan",
		name: "scene1plan1-background",
		start: 0,
		end: 25,
		states: [
			{
				type: "scale",
				startValue: 1,
				endValue: 4,
				start: 10,
				end: 35,
			},
			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 10,
				end: 25,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 1,
			translateX: 0,
		},
		audios: [],
		texts: [],
		information: [
			{
				name: "scene1plan1-source",
				start: 3,
				end: 20,
			},
		],
	},

	{
		type: "plan",
		name: "scene1plan2-background",
		start: 0,
		end: 890,
		states: [
			{
				type: "opacity",
				startValue: 0.5,
				endValue: 1,
				start: 0,
				end: 20,
			},
			{
				type: "translateX",
				startValue: 0,
				endValue: 0.15,
				start: 22,
				end: 64,
			},
			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 845,
				end: 890,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 0.5,
			translateX: 0,
		},
		audios: [
			{
				name: "camel-ride-india",
				object: new Audio("public/sounds/camel-ride-india.wav"),
				loop: true,
				start: 45,
				end: 60,
			},
		],
		texts: [],
		information: [
			{
				name: "scene1plan2-source",
				start: 25,
				end: 60,
			},
		],
	},

	{
		type: "characters",
		name: "scene1plan2-char",
		start: 0,
		end: 60,
		states: [
			{
				type: "opacity",
				startValue: 0.3,
				endValue: 1,
				start: 10,
				end: 22,
			},

			{
				type: "translateX",
				startValue: 1,
				endValue: -3,
				start: 22,
				end: 60,
			},
			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 42,
				end: 59,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 0,
			translateX: 1,
		},
		audios: [],
		texts: [],
		information: [],
	},

	{
		type: "adal",
		name: "scene1plan3-adal",
		start: 65,
		end: 870,
		states: [
			{
				type: "opacity",
				startValue: 0,
				endValue: 1,
				start: 66,
				end: 69,
			},
			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 830,
				end: 850,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 0,
			translateX: 0,
		},
		audios: [],
		texts: [
			{ name: "scene1plan3-text", start: 80, end: 280 },
			{ name: "scene1plan3-text-2", start: 280, end: 605 },
			{ name: "scene1plan3-text-3", start: 610, end: 810 },
		],
		information: [
			{
				name: "scene1plan3-source",
				start: 70,
				end: 850,
			},
		],
	},

	{
		type: "adal",
		name: "scene1plan4-adal",
		start: 920,
		end: 2400,
		states: [
			{
				type: "opacity",
				startValue: 0,
				endValue: 1,
				start: 920,
				end: 930,
			},
			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 2325,
				end: 2400,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 0,
			translateX: 0,
		},
		audios: [],
		texts: [
			{ name: "scene1plan4-text", start: 940, end: 1595 },
			{ name: "scene1plan4-text-2", start: 1600, end: 2300 },
		],
		information: [],
	},

	{
		type: "plan",
		name: "scene1plan4-background",
		start: 840,
		end: 3200,
		states: [
			{
				type: "opacity",
				startValue: 0,
				endValue: 1,
				start: 845,
				end: 890,
			},

			{
				type: "scale",
				startValue: 1,
				endValue: 5,
				start: 2500,
				end: 3100,
			},

			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 2500,
				end: 3100,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 0,
			translateX: 0,
		},
		audios: [],
		texts: [],
		information: [],
	},

	{
		type: "characters",
		name: "scene1plan4-char",
		start: 845,
		end: 3200,
		states: [
			{
				type: "opacity",
				startValue: 0,
				endValue: 1,
				start: 845,
				end: 915,
			},

			{
				type: "scale",
				startValue: 1,
				endValue: 5,
				start: 2500,
				end: 3100,
			},

			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 2500,
				end: 3100,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 0,
			translateX: 0,
		},
		audios: [],
		texts: [],
		information: [],
	},

	{
		type: "plan",
		name: "scene1plan5-background",
		start: 3050,
		end: 6000,
		states: [
			{
				type: "opacity",
				startValue: 0,
				endValue: 1,
				start: 3050,
				end: 3150,
			},

			{
				type: "translateX",
				startValue: 0,
				endValue: 1,
				start: 4600,
				end: 6000,
			},

			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 5900,
				end: 6000,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 0,
			translateX: 0,
		},
		audios: [],
		texts: [],
		information: [
			{
				name: "scene1plan5-source",
				start: 3100,
				end: 5950,
			},
		],
	},

	{
		type: "characters",
		name: "scene1plan5-char",
		start: 3050,
		end: 6000,
		states: [
			{
				type: "opacity",
				startValue: 0,
				endValue: 1,
				start: 3050,
				end: 3150,
			},

			{
				type: "translateX",
				startValue: 0,
				endValue: 1,
				start: 4600,
				end: 6000,
			},

			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 5900,
				end: 6000,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 0,
			translateX: 0,
		},
		audios: [],
		texts: [],
		information: [],
	},

	{
		type: "adal",
		name: "scene1plan5-adal",
		start: 3200,
		end: 4550,
		states: [
			{
				type: "opacity",
				startValue: 0,
				endValue: 1,
				start: 3200,
				end: 3220,
			},

			{
				type: "opacity",
				startValue: 1,
				endValue: 0,
				start: 4500,
				end: 4550,
			},
		],
		defaultProperties: {
			scale: 1,
			opacity: 0,
			translateX: 0,
		},
		audios: [],
		texts: [
			{ name: "scene1plan5-text", start: 3230, end: 3995 },
			{ name: "scene1plan5-text-2", start: 4000, end: 4450 },
		],
		information: [],
	},

	{
		type: "plan",
		name: "blackscreen-scene1plan5",
		start: 5900,
		end: 6050,
		states: [],
		defaultProperties: {
			scale: 1,
			opacity: 1,
			translateX: 0,
		},
		audios: [],
		texts: [],
		information: [],
	},

	// {
	// 	type: "plan",
	// 	name: "scene2plan1-background",
	// 	start: 900,
	// 	end: 1200,
	// 	states: [
	// 		{
	// 			type: "opacity",
	// 			startValue: 1,
	// 			endValue: 0,
	// 			start: 1000,
	// 			end: 1200,
	// 		},
	// 	],
	// 	defaultProperties: {
	// 		scale: 1,
	// 		opacity: 1,
	// 		translateX: 0,
	// 	},
	// 	audios: [],
	// 	texts: [],
	// 	information: [],
	// },

	// {
	// 	type: "plan",
	// 	name: "scene2plan2-background",
	// 	start: 900,
	// 	end: 2850,
	// 	states: [
	// 		{
	// 			type: "opacity",
	// 			startValue: 0,
	// 			endValue: 1,
	// 			start: 1000,
	// 			end: 1200,
	// 		},

	// 		{
	// 			type: "translateX",
	// 			startValue: 0,
	// 			endValue: 1,
	// 			start: 1200,
	// 			end: 2850,
	// 		},

	// 		{
	// 			type: "opacity",
	// 			startValue: 1,
	// 			endValue: 0,
	// 			start: 1400,
	// 			end: 1750,
	// 		},
	// 	],
	// 	defaultProperties: {
	// 		scale: 1,
	// 		opacity: 0,
	// 		translateX: 0,
	// 	},
	// 	audios: [],
	// 	texts: [],
	// 	information: [],
	// },

	// {
	// 	type: "characters",
	// 	name: "scene2plan2-char",
	// 	start: 900,
	// 	end: 2300,
	// 	states: [
	// 		{
	// 			type: "opacity",
	// 			startValue: 0,
	// 			endValue: 1,
	// 			start: 1100,
	// 			end: 1250,
	// 		},

	// 		{
	// 			type: "translateX",
	// 			startValue: 0,
	// 			endValue: 1.5,
	// 			start: 1200,
	// 			end: 2200,
	// 		},

	// 		{
	// 			type: "opacity",
	// 			startValue: 1,
	// 			endValue: 0,
	// 			start: 1400,
	// 			end: 2200,
	// 		},
	// 	],
	// 	defaultProperties: {
	// 		scale: 1,
	// 		opacity: 0,
	// 		translateX: 0,
	// 	},
	// 	audios: [],
	// 	texts: [],
	// 	information: [],
	// },

	// {
	// 	type: "plan",
	// 	name: "scene2plan3-background",
	// 	start: 900,
	// 	end: 2850,
	// 	states: [
	// 		{
	// 			type: "translateX",
	// 			startValue: 0,
	// 			endValue: 1,
	// 			start: 1200,
	// 			end: 2850,
	// 		},

	// 		{
	// 			type: "opacity",
	// 			startValue: 1,
	// 			endValue: 0,
	// 			start: 1950,
	// 			end: 2300,
	// 		},
	// 	],
	// 	defaultProperties: {
	// 		scale: 1,
	// 		opacity: 1,
	// 		translateX: 0,
	// 	},
	// 	audios: [],
	// 	texts: [],
	// 	information: [],
	// },

	// {
	// 	type: "plan",
	// 	name: "scene2plan4-background",
	// 	start: 900,
	// 	end: 2850,
	// 	states: [
	// 		{
	// 			type: "translateX",
	// 			startValue: 0,
	// 			endValue: 1,
	// 			start: 1200,
	// 			end: 2850,
	// 		},

	// 		{
	// 			type: "opacity",
	// 			startValue: 1,
	// 			endValue: 0,
	// 			start: 2500,
	// 			end: 2850,
	// 		},
	// 	],
	// 	defaultProperties: {
	// 		scale: 1,
	// 		opacity: 1,
	// 		translateX: 0,
	// 	},
	// 	audios: [],
	// 	texts: [],
	// 	information: [],
	// },

	// {
	// 	type: "plan",
	// 	name: "scene2plan4-char",
	// 	start: 2100,
	// 	end: 2850,
	// 	states: [
	// 		{
	// 			type: "translateX",
	// 			startValue: 2,
	// 			endValue: -2,
	// 			start: 1900,
	// 			end: 2850,
	// 		},

	// 		{
	// 			type: "opacity",
	// 			startValue: 1,
	// 			endValue: 0,
	// 			start: 2300,
	// 			end: 2700,
	// 		},
	// 	],
	// 	defaultProperties: {
	// 		scale: 1,
	// 		opacity: 1,
	// 		translateX: 3,
	// 	},
	// 	audios: [],
	// 	texts: [],
	// 	information: [],
	// },

	// {
	// 	type: "plan",
	// 	name: "blackscreen-scene2plan4",
	// 	start: 2500,
	// 	end: 2900,
	// 	states: [],
	// 	defaultProperties: {
	// 		scale: 1,
	// 		opacity: 1,
	// 		translateX: 0,
	// 	},
	// 	audios: [],
	// 	texts: [],
	// 	information: [],
	// },
];

// Créer une fonction ease-in pour le render

// Je le garde ici pour me rappeler comment faire un timer :)
// setTimeout(() => {
//     audio_menu.pause();
// }, 2000);
