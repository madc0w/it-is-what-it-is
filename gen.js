var prevSubject = null;
var isRunning = false;
var intervalId = null;
var seen;

function onLoad() {
	var total = ((pluralNouns.length + pronouns.length) * pluralVerbs.length * pluralVerbs.length) + (singularNouns.length * singularVerbs.length * singularVerbs.length);
	$("#num-permutations").html(total);

	seen = JSON.parse(localStorage.getItem("seen")) || {};
	$("#num-seen").html(Object.keys(seen).length);

	toggle();
}

function go() {
	$("#text").animate({
		"font-size" : "0px",
		"width" : "0%",
		"margin-top" : "80px",
		"opacity" : 0,
	}, 2000, "swing", () => {
		var isPlural = Math.random() < pluralNouns.length / (pluralNouns.length + singularNouns.length);
		var gender = null;
		var subject = null;
		var isPronoun = false;
		if (Math.random() < 0.3) {
			isPronoun = true;
			subject = getRandomElement(pronouns);
			isPlural = subject.isPlural;
			subject = subject.word;
		} else {
			var nouns = isPlural ? pluralNouns : singularNouns;
			do {
				subject = getRandomElement(nouns);
				if (typeof subject == "object") {
					gender = subject.gender;
					subject = subject.word;
				}
			} while (subject == prevSubject);
		}
		prevSubject = subject;
		var text = ucFirst(subject) + " ";
		var verbs = isPlural ? pluralVerbs : singularVerbs;
		text += getRandomElement(verbs);
		text += " what ";
		if (gender) {
			text += " " + gender + " ";
		} else if (isPronoun) {
			text += " " + subject + " ";
		} else {
			text += isPlural ? " they " : " it " ;
		}
		text += getRandomElement(verbs);
		text += ".";

		seen[text] = true;
		localStorage.setItem("seen", JSON.stringify(seen));
		$("#num-seen").html(Object.keys(seen).length);

		if (speechSynthesis) {
			var msg = new SpeechSynthesisUtterance(text);
			setRandomVoice(msg);
			speechSynthesis.speak(msg);
		}

		// fail with 403
		//			var url = "https://translation.googleapis.com/language/translate/v2?key=AIzaSyBMRKQyqJQOCsPSA7eVFu0N0DPwFk_aTH4";
		//			url += "&source=EN";
		//			url += "&target=FR";
		//			url += "&q=" + text;
		//			$.get(url, function(data, status) {
		//				console(data.data.translations[0].translatedText);
		//			});

		$("#text").html(text);
		$("#text").animate({
			"margin-top" : "0px",
			"font-size" : "120px",
			"width" : "100%",
			"opacity" : 1,
		}, 4000);
	});
}


function ucFirst(word) {
	return word ? word.substring(0, 1).toUpperCase() + word.substring(1) : null;
}

function setRandomVoice(msg) {
	var voices = [];
	new SpeechSynthesisUtterance();
	speechSynthesis.getVoices().forEach(function(voice) {
		if (voice.lang.startsWith("en") || voice.lang.startsWith("fr")) {
			//			console.log("voice", voice);
			voices.push(voice);
		}
	});
	var voice = voices[Math.floor(Math.random() * voices.length)];
	msg.pitch = 1 + ((Math.random() - 0.5) * 0.8);
	msg.voice = voice;
}

function getRandomElement(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function toggle() {
	isRunning = !isRunning;
	if (isRunning) {
		go();
		intervalId = setInterval(go, 6000);
	} else {
		clearInterval(intervalId);
	}
	$("#toggle-button").html(isRunning ? "Please... Make it stop." : "More wisdom, please!");
}
