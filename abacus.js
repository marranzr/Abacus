var canvas = document.getElementById('canvas'), 
	context = canvas.getContext('2d'),
	modeElement = document.getElementById('mode'),
	mode = modeElement.value,
	frameColorElement = document.getElementById('frameColor'), 
	frameColor = frameColorElement.value, 
	beadColorElement = document.getElementById('beadColor'),
	beadColor = beadColorElement.value,
	beadSound = document.getElementById('beadSound'),
	soundCheckbox = document.getElementById('soundCheckbox'),
	soundActive = soundCheckbox.checked,
	activeColorElement = document.getElementById('activeColor'),
	activeColor = activeColorElement.value == 'none' ? beadColor : activeColorElement.value,
	numberOfRodsElement = document.getElementById('numberOfRods'), 
	numberOfRods = parseInt(numberOfRodsElement.value), 
	resetButton = document.getElementById('reset'),
	goButton = document.getElementById('go'),
	repeatButton = document.getElementById('repeat'),
	showButton = document.getElementById('show'),
	fieldSetNormal = document.getElementById('fs_normal'),
	fieldSetGTN = document.getElementById('fs_gtn'),
	answerElement = document.getElementById('answer'),
	numberToPut,
	DISTANCE_RODS = 60, 
	width = DISTANCE_RODS * (numberOfRods + 1 ), 
	TOP_MARGIN = 60,
	TOP_FRAME = 60 + DISTANCE_RODS/2,
	LEFT_MARGIN = 10,
	FRAME_LINE_WIDTH = 10, 
	ROD_STROKE_STYLE = 'rgba(212,85,0,0.5)', 
	ROD_LINE_WIDTH = 6, 
	DOT_STROKE_STYLE = 'rgba(0, 0, 0, 1)', 
	DOT_FILL_STYLE = 'rgba(255, 255, 255, 1)', 
	DOT_SIZE = 3, 
	BEAD_WIDTH = 56, 
	BEAD_HEIGHT = 30, 
	//BEAD_STROKE = 'rgba(128,51,0,1)', 
	BEAD_STROKE = 'black',
	HEAVEN = BEAD_HEIGHT * 2 + FRAME_LINE_WIDTH, 
	EARTH = BEAD_HEIGHT * 5, 
	HEIGHT = HEAVEN + EARTH + FRAME_LINE_WIDTH,
	beads = []
	fromElement = document.getElementById('from'),
	from = parseInt(fromElement.value),
	toElement = document.getElementById('to'),
	to = parseInt(toElement.value),
	showTimeElement = document.getElementById('showTime'),
	showTime = parseInt(showTimeElement.value),
	showNumbers = true;

// Constructors
var Bead = function(rod, heaven, order, active) {
	this.rod = rod;
	this.heaven = heaven;
	this.order = order;
	this.active = active;
};

var Point = function(x, y) {
	this.x = x;
	this.y = y;
};

// Position prototype
Bead.prototype = {
	getPoints : function() {
		var points = [], center = this.evalPosition();
		points.push(new Point(center.x - BEAD_WIDTH / 2, center.y));
		// .

		points.push(new Point(center.x + BEAD_WIDTH / 2, center.y));
		// ____

		points.push(new Point(center.x + BEAD_WIDTH / 6, center.y - BEAD_HEIGHT / 2));
		// ____\

		//  __
		points.push(new Point(center.x - BEAD_WIDTH / 6, center.y - BEAD_HEIGHT / 2));
		// ____\

		//   __
		points.push(new Point(center.x - BEAD_WIDTH / 2, center.y));
		// /____\

		//   __
		points.push(new Point(center.x - BEAD_WIDTH / 6, center.y + BEAD_HEIGHT / 2));
		// /____\
		// \

		//   __
		points.push(new Point(center.x + BEAD_WIDTH / 6, center.y + BEAD_HEIGHT / 2));
		// /____\
		// \ __

		//   __
		points.push(new Point(center.x + BEAD_WIDTH / 2, center.y));
		// /____\
		// \ __ /

		return points;
	},

	evalPosition : function() {// returns the central point of the bead;
		var x = LEFT_MARGIN + this.rod * DISTANCE_RODS, y = undefined;

		if (this.heaven) {
			if (this.active) {
				y = TOP_FRAME + HEAVEN - BEAD_HEIGHT / 2 - FRAME_LINE_WIDTH / 2;
			} else {
				y = TOP_FRAME + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			}
		} else {//earth
			if (this.active) {
				y = TOP_FRAME + HEAVEN + (this.order - 1) * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			} else {
				y = TOP_FRAME + HEAVEN + this.order * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			}

		}

		return new Point(x, y);
	},

	createPath : function(context) {
		var points = this.getPoints();
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for (var i = 1; i < points.length; ++i) {
			context.lineTo(points[i].x, points[i].y);
		}
	},

	draw : function(context) {
		context.save();
		if (this.active) {
			context.fillStyle = activeColor;
		} else {
			context.fillStyle = beadColor;
		}
		context.strokeStyle = BEAD_STROKE;
		context.lineWidth = 1;
		this.createPath(context);
		context.fill();
		context.stroke();
		context.restore();
	},
	
	erase: function(context) {
		context.save();
		context.lineWidth = 0;
		context.fillStyle = "rgba(255,255,255,0)";
		this.createPath(context);
		context.fill();
		context.stroke();
		context.restore();
	}
};

// Functions..............................................
function windowToCanvas(x, y) {
	var bbox = canvas.getBoundingClientRect();
	return { x: x - bbox.left * (canvas.width / bbox.width),
			 y: y - bbox.top * (canvas.height / bbox.height)
	};
}

function saveDrawingSurface() {
	drawingSurfaceImageData = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreDrawingSurface() {
	context.putImageData(drawingSurfaceImageData, 0, 0);
}

function drawAbacus() {
	context.shadowColor = 'rgba(0,0,0,0.5)';
	context.shadowOffsetX = 3;
	context.shadowOffsetY = 3;
	context.shadowBlur = 8;
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawRods();
	drawBeads();
	drawFrame();
	drawHeavenLine();
	drawDots();
}

function drawFrame() {
	context.save();
	context.strokeStyle = frameColor;
	context.lineWidth = FRAME_LINE_WIDTH;
	context.beginPath();
	context.rect(LEFT_MARGIN, TOP_FRAME, width, HEIGHT);
	context.stroke();
	context.restore();
}

function drawHeavenLine() {
	context.save();
	context.strokeStyle = frameColor;
	context.lineWidth = FRAME_LINE_WIDTH;
	context.beginPath();
	context.moveTo(LEFT_MARGIN + FRAME_LINE_WIDTH / 2, TOP_FRAME + HEAVEN);
	context.lineTo(LEFT_MARGIN + width - FRAME_LINE_WIDTH / 2, TOP_FRAME + HEAVEN);
	context.stroke();
	context.restore();
}

function drawRods() {
	context.font="20px Georgia";
	context.textAlign="center";
	context.save();
	context.lineWidth = ROD_LINE_WIDTH;
	for (var i = 0, x = LEFT_MARGIN + DISTANCE_RODS; i < numberOfRods; ++i, x += DISTANCE_RODS) {
		context.beginPath();
		context.strokeStyle = ROD_STROKE_STYLE;
		context.moveTo(x, TOP_FRAME);
		context.lineTo(x, TOP_FRAME + HEIGHT);
		context.stroke();
		if (showNumbers) {
			context.beginPath();
			//context.shadowColor = 'rgba(0,0,0,0)';
			context.strokeStyle = 'rgba(153,76,0,1)';
			context.fillStyle = 'rgba(255,255,240,1)';
			//context.arc(x, TOP_MARGIN, DISTANCE_RODS/4, 0, Math.PI * 2, false);
			//context.rect(x - DISTANCE_RODS/2, TOP_MARGIN - DISTANCE_RODS*0.8/2, DISTANCE_RODS, DISTANCE_RODS*0.8);
			//context.fillRect(x - DISTANCE_RODS/2, TOP_MARGIN - DISTANCE_RODS*0.8/2, DISTANCE_RODS, DISTANCE_RODS*0.8);
			context.strokeStyle = 'blue';
			//context.strokeText(i,x,TOP_MARGIN);
			context.fillText(i,x,TOP_MARGIN);
			//context.stroke();
			//context.fill();
		}
	}
	

	context.restore();
}

function drawDots() {
	context.save();
	var middle = Math.floor(numberOfRods / 2);
	context.lineWidth = 1;
	context.strokeStyle = DOT_STROKE_STYLE;
	context.fillStyle = DOT_FILL_STYLE;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	for (var i = 0, x = LEFT_MARGIN + DISTANCE_RODS; i < numberOfRods; ++i, x += DISTANCE_RODS) {
		// Dot in this and this +- 3
		if ((i - middle) % 3 === 0) {
			context.beginPath();
			context.arc(x, TOP_FRAME + HEAVEN, DOT_SIZE, 0, Math.PI * 2, false);
			context.fill();
			context.stroke();
		}
	}
	context.restore();
}


function drawBeads() {
	for (var i = 1; i <= numberOfRods; i++){
		drawBeadsInRod(i);
	}
}

function drawBeadsInRod(rod) {
	for (var i = 0; i < beads[rod].length; i++){
		beads[rod][i].draw(context);
	};
}

function resetAbacus() {
	beads = [];
	for (var i = 0; i < numberOfRods; i++) {
		beads[i+1] = [];
		var heaven = new Bead(i + 1, true, 0, false);
		beads[i+1].push(heaven);
		for (var j = 0; j < 4; j++) {
			var earth = new Bead(i + 1, false, j + 1, false);
			beads[i+1].push(earth);
		}
	}
	drawBeads();
}

function getBead(rod, heaven, order) {
	for (var i = 0; i < beads[rod].length; i++) {
		if (beads[rod][i].heaven === heaven 
		 && beads[rod][i].order === order) {
		 	return beads[rod][i];
		 }	
	}
}


// Event handlers.................................................................

function clickOrTouch(e) {
	if (mode == 'normal') {	
		var loc = windowToCanvas(e.clientX, e.clientY);
//		e.preventDefault();
		
		for (var i = 1; i <= numberOfRods; i++) {
			for(var j = 0; j < beads[i].length; j++) {
				beads[i][j].createPath(context);
				if (context.isPointInPath(loc.x, loc.y)) {
					if (soundActive) {
						beadSound.play();
					}
					clickedBead(beads[i][j]);	
				}
			}
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawAbacus();
	}
}

canvas.onclick = clickOrTouch;
// document.ontouchstart = clickOrTouch;
// document.ontouchend = function(e) {
//	e.preventDefault();	
// };


numberOfRodsElement.onchange = function(e) {
	numberOfRods = parseInt(numberOfRodsElement.value);
	width = DISTANCE_RODS * (numberOfRods + 1 );
	canvas.width = width + 2 * LEFT_MARGIN;
	localStorage.setItem("numberOfRods", numberOfRodsElement.selectedIndex);
	resetAbacus();
	drawAbacus();
};

modeElement.onchange = function(e) {
	mode = modeElement.value;
	if (mode == 'normal') {
		TOP_FRAME = TOP_MARGIN;
		canvas.style.cursor='pointer';
		fieldSetNormal.disabled=false;
		fieldSetGTN.disabled=true;
		showNumbers = false;
	} else if (mode == 'game1') {
		TOP_FRAME = TOP_MARGIN;
		canvas.style.cursor='auto';
		fieldSetNormal.disabled=true;
		fieldSetGTN.disabled=false;
		showButton.disabled=true;
		showNumbers = false;
	} else if (mode == 'watch') {
		TOP_FRAME = TOP_MARGIN + DISTANCE_RODS/2;
		canvas.style.cursor='auto';
		fieldSetNormal.disabled=true;
		fieldSetGTN.disabled=false;
		showButton.disabled=true;
		showNumbers = true;
	}
	answerElement.style.display = 'none';
	resetAbacus();
	drawAbacus();
	localStorage.setItem("mode", modeElement.selectedIndex);
}

frameColorElement.onchange = function(e) {
	frameColor = frameColorElement.value;
	localStorage.setItem("frameColor", frameColorElement.selectedIndex);
	drawAbacus();
};

beadColorElement.onchange = function(e) {
	beadColor = beadColorElement.value;
	localStorage.setItem("beadColor", beadColorElement.selectedIndex);
	drawAbacus();
};

activeColorElement.onchange = function(e) {
	activeColor = activeColorElement.value == 'none' ? beadColor : activeColorElement.value;
	localStorage.setItem("activeColor", activeColorElement.selectedIndex);
	drawAbacus();
};

soundCheckbox.onchange = function(e) {
	soundActive = soundCheckbox.checked;
	localStorage.setItem("soundActive", soundActive ? "1" : "0");
};

fromElement.onchange = function(e) {
	from = parseInt(fromElement.value);
	localStorage.setItem("from", from);
};

toElement.onchange = function(e) {
	to = parseInt(toElement.value);
	localStorage.setItem("to", to);
};

showTimeElement.onchange = function(e) {
	showTime = parseInt(showTimeElement.value);
	localStorage.setItem("showTime", showTime);
};

resetButton.onclick = function(e) {
	answerElement.style.display = 'none';
	showButton.disabled = true;
	resetAbacus();
	drawAbacus();
};

goButton.onclick = function(e) {
	numberToPut = (from + Math.random() * (to - from)).toFixed(0);
	answerElement.style.display = 'none';
	showButton.disabled = true;
	repeatButton.disabled = false;
	answerElement.innerHTML = numberToPut;
	writeNumberInAbacus(numberToPut, evalUnitsRod());
	setTimeout(function() {	resetAbacus();
				drawAbacus();
				showButton.disabled=false}, showTime);
};

repeatButton.onclick = function(e) {
	if (numberToPut != undefined) {
		answerElement.style.display = 'none';
		showButton.disabled = true;
		answerElement.innerHTML = numberToPut;
		writeNumberInAbacus(numberToPut, evalUnitsRod());
		setTimeout(function() {	resetAbacus();
					drawAbacus();
					showButton.disabled=false}, showTime);
	}
}

showButton.onclick = function(e) {
	answerElement.style.display = 'inline';
	writeNumberInAbacus(numberToPut, evalUnitsRod());
};

// Calculations...............................................................

function writeNumberInAbacus(number, unitsRod) {
	resetAbacus();
	
	// Convert the number to string to make calculations easier
	var toWrite = number.toString();
	for (var i = 0; i < toWrite.length; i++) {
		putNumberInRod(toWrite.substring(i,i+1), unitsRod - toWrite.length + i + 1);
	}
	
}

function evalUnitsRod() {
	// Units is middle row
	return Math.floor(numberOfRods / 2) + 1; 
}

function clickedBead(bead) {
	if (bead.heaven) {
		bead.active = !bead.active;	
	} else {
		if (bead.active) {
			bead.active = false;
			for (var i = bead.order + 1; i <= 4; i++) {
				var nextBead = getBead(bead.rod, false, i);
				nextBead.active = false;
			}
		} else {
			bead.active = true;
			for (var i = 1; i < bead.order; i++) {
				var nextBead = getBead(bead.rod, false, i);
				nextBead.active = true;
			}
		}
	}
	return;
}

function putNumberInRod(number, rod) {
    resetRod(rod);
    if (number > 0) {
        if (number <= 4) {
            clickedBead(beads[rod][number]);
        } else if (number == 5) {
            clickedBead(beads[rod][0]);
        } else {
        	clickedBead(beads[rod][0]);
            clickedBead(beads[rod][number-5]);
        }
    }    
    drawAbacus(); 
}

function resetRod(rod) {
	for (var i = 0; i < beads[rod].length; i++) {
		beads[rod][i].active = false;
	}
}

// Initialization..................................................................

resetAbacus();

var	modeIndex = localStorage.getItem("mode");
	beadColorIndex = localStorage.getItem("beadColor"),
	activeColorIndex = localStorage.getItem("activeColor"),
	frameColorIndex = localStorage.getItem("frameColor"),
	numberOfRodsIndex = localStorage.getItem("numberOfRods"),
	isSoundActive = localStorage.getItem("soundActive"),
	from = localStorage.getItem("from"),
	to = localStorage.getItem("to"),
	showTime = localStorage.getItem("showTime"),
modeElement.selectedIndex = modeIndex;
modeElement.onchange.apply();
beadColorElement.selectedIndex = beadColorIndex;
beadColorElement.onchange.apply();
activeColorElement.selectedIndex = activeColorIndex;
activeColorElement.onchange.apply();
frameColorElement.selectedIndex = frameColorIndex;
frameColorElement.onchange.apply();
numberOfRodsElement.selectedIndex = numberOfRodsIndex;
numberOfRodsElement.onchange.apply();
soundCheckbox.checked = isSoundActive === "1" ? true : false;
soundCheckbox.onchange.apply();
fromElement.value = from;
fromElement.onchange.apply();
toElement.value = to;
toElement.onchange.apply(),
showTimeElement.value = showTime,
showTimeElement.onchange.apply();
 
drawAbacus();

