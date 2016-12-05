

var lng = {left: null, right: null},
	result = '',
	resultFileName = '',
	dropZones = document.getElementsByClassName('drop_zone');

for (var d in dropZones) {
	if (!dropZones[d].addEventListener) continue;
	dropZones[d].addEventListener('dragover', handleDragOver, false);
	dropZones[d].addEventListener('drop', handleFileSelect, false);
}

document.getElementById('download').addEventListener('click', download, false);




function handleFileSelect(evt, opt_encoding) {
	evt.stopPropagation();
	evt.preventDefault();

	var _evt = evt,
		self = this,
		files = evt.dataTransfer.files,
		file = files[0],
		output = [],
		target = this.getAttribute('data-target'),
		reader = new FileReader(),
		opt_encoding = opt_encoding || 'utf-8';

	output.push(
		'<strong>', escape(file.name), '</strong> (', file.type || 'n/a', ', ', opt_encoding,') - ',
		file.size, ' bytes, last modified: ',
		file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a'
	);
	this.innerHTML = output.join('');
	if (target == 'left')
		resultFileName = file.name.replace(/\.srt$/, '.multi.srt');

	reader.onloadend = function(evt) {
		if (evt.target.readyState == FileReader.DONE) {
			if (!evt.target.result.match(/[аиюэоыуея]/ig)) {
				handleFileSelect.call(self, _evt, "cp1251");
				return;
			}
			lng[target] = evt.target.result;
			document.getElementById(target).textContent = lng[target];
			merge();
		}
	};
	reader.readAsText(file, opt_encoding);
}


function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
}


function download() {
	var blob = new Blob([result], {type: "text/plain;charset=utf-8"});
	saveAs(blob, resultFileName);
}


function merge() {
	var data = {},
		block,
		lng0 = lng.left,
		lng1 = lng.right,
		stringDelimiter = '\r\n';

	if (!lng0 || !lng1 || lng0 == "" || lng1 == "")
		return;

	lng0 = lng0.split(stringDelimiter + stringDelimiter);
	lng1 = lng1.split(stringDelimiter + stringDelimiter);

	// if (lng1.length < lng0.length)
	// 	lng0 = [lng1, lng1 = lng0][0];

	for (var a = 0; a < lng0.length; a++) {
		block = lng0[a].split(stringDelimiter);
		if (block.length < 3) continue;
		data[block[0]] = [block[1].split(" --> "), block.splice(2).join(' ')];
	}
	for (var b = 0; b < lng1.length; b++) {
		block = lng1[b].split(stringDelimiter);
		if (block.length < 3) continue;
		block[1] = block[1].split(" --> ");
		for (a in data)
			if (!(data[a][0][1] < block[1][0] || data[a][0][0] > block[1][1])) {
				data[a].push(block.splice(2).join(' '));
				break;
			}
		
	}

	result = [];
	for (a in data) {
		result.push(a);
		result.push(data[a][0].join(' --> '));
		result.push(data[a].splice(1).join(stringDelimiter), '');
	}
	result = result.join(stringDelimiter);

	document.getElementById('result').textContent = result;
	document.getElementById('download_container').removeAttribute('hidden');
}
