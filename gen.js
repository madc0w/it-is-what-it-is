let prevSubject = null;
let isRunning = false;
let intervalId = null;
let seen;

function onLoad() {
	const total =
		((pluralNouns.length + pronouns.length) * pluralVerbs.length * pluralVerbs.length) +
		(singularNouns.length * singularVerbs.length * singularVerbs.length) +
		((pluralNouns.length + pronouns.length) * pluralVerbs.length * pluralEndings.length) +
		(singularNouns.length * singularVerbs.length * singularEndings.length);
	$("#num-permutations").html(total);

	seen = JSON.parse(localStorage.getItem("seen")) || {};
	$("#num-seen").html(Object.keys(seen).length);

	toggle();
}

function go() {
	$("#text").animate({
		"font-size": "0px",
		"width": "0%",
		"margin-top": "100px",
		"opacity": 0,
	}, 2000, () => {
		let isPlural = Math.random() < pluralNouns.length / (pluralNouns.length + singularNouns.length);
		let gender = null;
		let subject = null;
		const isPronoun = Math.random() < 0.3;
		if (isPronoun) {
			subject = getRandomElement(pronouns);
			isPlural = subject.isPlural;
			subject = subject.word;
		} else {
			const nouns = isPlural ? pluralNouns : singularNouns;
			do {
				subject = getRandomElement(nouns);
				if (typeof subject == "object") {
					gender = subject.gender;
					subject = subject.word;
				}
			} while (subject == prevSubject);
		}
		prevSubject = subject;
		let text = ucFirst(subject) + " ";
		const verbs = isPlural ? pluralVerbs : singularVerbs;
		text += getRandomElement(verbs);
		if (Math.random() < 0.4) {
			const endings = isPlural ? pluralEndings : singularEndings;
			let ending = getRandomElement(endings);
			if (gender || isPronoun) {
				ending = ending.replace(/ it /, ' ' + (gender || subject) + ' ');
			}
			text += " " + ending;
		} else {
			text += " what ";
			if (gender) {
				text += " " + gender + " ";
			} else if (isPronoun) {
				text += " " + subject + " ";
			} else {
				text += isPlural ? " they " : " it ";
			}
			text += getRandomElement(verbs);
		}
		text += ".";

		seen[text] = true;
		localStorage.setItem("seen", JSON.stringify(seen));
		$("#num-seen").html(Object.keys(seen).length);

		if (speechSynthesis) {
			let msg = new SpeechSynthesisUtterance(text);
			setRandomVoice(msg);
			speechSynthesis.speak(msg);
		}

		// fail with 403
		//			let url = "https://translation.googleapis.com/language/translate/v2?key=AIzaSyBMRKQyqJQOCsPSA7eVFu0N0DPwFk_aTH4";
		//			url += "&source=EN";
		//			url += "&target=FR";
		//			url += "&q=" + text;
		//			$.get(url, function(data, status) {
		//				console(data.data.translations[0].translatedText);
		//			});

		$("#text").html(text);
		$("#text").animate({
			"margin-top": "20px",
			"font-size": "120px",
			"width": "100%",
			"opacity": 1,
		}, 4000);
	});
}


function ucFirst(word) {
	return word ? word.substring(0, 1).toUpperCase() + word.substring(1) : null;
}

function setRandomVoice(msg) {
	const voices = [];
	new SpeechSynthesisUtterance();
	speechSynthesis.getVoices().forEach(function (voice) {
		if (voice.lang.startsWith("en") || voice.lang.startsWith("fr") || voice.lang.startsWith("zh") || voice.lang.startsWith("ja")) {
			//			console.log("voice", voice);
			voices.push(voice);
		}
	});
	const voice = voices[Math.floor(Math.random() * voices.length)];
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
