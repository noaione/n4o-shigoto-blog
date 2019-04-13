function nT_resolve_status(response) {
	if (response.status >= 200 && response.status < 300) {
		return Promise.resolve(response)
	} else {
		return Promise.reject(new Error(response.statusText))
	}
}

function nT_json_data(response) {
	return response.text();
}

function naoTimesProcess(disID) {
	console.log('Fetching naoTimes data');
	fetch('https://gist.githubusercontent.com/noaione/1dff370f9802d2ee13ae8412a8026d7b/raw/nao_showtimes.json')
	.then(nT_resolve_status)
	.then(nT_json_data)
	.then(function(nT_data) {
		var div_data = document.getElementById("naoprogress");
		var loading_elem = document.getElementById('naotimes-loading');
		var json_data = JSON.parse(nT_data)
		console.log('Parsing naoTimes data');
		var dis_data = json_data[disID];
		var available_anime = [];

		for (a in dis_data['anime']) {
			available_anime.push(a);
		}

		for (ava in available_anime) {
			var textRes = '';
			var current_episode = '';
			for (stat in dis_data['anime'][available_anime[ava]]['status']) {
				if (dis_data['anime'][available_anime[ava]]['status'][stat]['status'] != 'released') {
					current_episode += stat;
					if (dis_data['anime'][available_anime[ava]]['status'][stat]['staff_status']['TL'] == 'y') {
						textRes += '';
					} else {
						textRes += 'TL ';
					}
					if (dis_data['anime'][available_anime[ava]]['status'][stat]['staff_status']['TLC'] == 'y') {
						textRes += '';
					} else {
						textRes += 'TLC ';
					}
					if (dis_data['anime'][available_anime[ava]]['status'][stat]['staff_status']['ENC'] == 'y') {
						textRes += '';
					} else {
						textRes += 'Encode ';
					}
					if (dis_data['anime'][available_anime[ava]]['status'][stat]['staff_status']['ED'] == 'y') {
						textRes += '';
					} else {
						textRes += 'Edit ';
					}
					if (dis_data['anime'][available_anime[ava]]['status'][stat]['staff_status']['TM'] == 'y') {
						textRes += '';
					} else {
						textRes += 'Timing ';
					}
					if (dis_data['anime'][available_anime[ava]]['status'][stat]['staff_status']['TS'] == 'y') {
						textRes += '';
					} else {
						textRes += 'TS ';
					}
					if (dis_data['anime'][available_anime[ava]]['status'][stat]['staff_status']['QC'] == 'y') {
						textRes += '';
					} else {
						textRes += 'QC';
					}
					break;
				} else {
					continue;
				}
			}
			if (textRes == '') {
				continue;
			} else {
				console.log('Spitting naoTimes result');
				var h2_node = document.createElement("h2");
				h2_node.classList.add("naotimes-animetitle")
				var h2_textNode = document.createTextNode(available_anime[ava]);
				var stat_node = document.createElement("ul");
				stat_node.classList.add("naotimes-animeprogress")
				if (current_episode.length < 2) { // pad number
					var current_episode = '0' + current_episode;
				}
				var final_text = current_episode + ' @ ' + textRes;
				var stat_textNode = document.createTextNode(final_text);
				h2_node.appendChild(h2_textNode);
				stat_node.appendChild(stat_textNode);
				div_data.appendChild(h2_node);
				div_data.appendChild(stat_node);
			}
		}
		loading_elem.parentNode.removeChild(loading_elem);
		console.log('Finished!')
	}).catch(function(error) {
		console.log('Request failed', error);
	});
}
