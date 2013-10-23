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
	resetButton = document.getElementById('reset'),
	goButton = document.getElementById('go'),
	repeatButton = document.getElementById('repeat'),
	showButton = document.getElementById('show'),
	fieldSetNormal = document.getElementById('fs_normal'),
	fieldSetGTN = document.getElementById('fs_gtn'),
	//answerElement = document.getElementById('answer'),
	numberToPut,
	DISTANCE_RODS = 60, 
	TOP_MARGIN = 60,
	NUMBER_HEIGHT = 20,
	top_frame,
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
	fromElement = document.getElementById('from'),
	from = parseInt(fromElement.value),
	toElement = document.getElementById('to'),
	to = parseInt(toElement.value),
	showTimeElement = document.getElementById('showTime'),
	showTime = parseInt(showTimeElement.value),
	abacus = null,
	intervalId=null;

// Constructors
var Abacus = function(numberOfRods, mode, frameColor) {
	var rods = [];
	for (var i = 0; i < numberOfRods; i++) {
		var beads = [];
		var rod = new Rod(i+1, beads, 0, false);
		for (var j = 0; j < 5; j++) {
			var bead;
			if (j == 0) { 
				bead = new Bead(rod, true, j, false);
			} else {
				bead = new Bead(rod, false, j, false);
			}
			beads.push(bead);
		}
		rods.push(rod);
	}
	this.numberOfRods = numberOfRods;
	this.rods = rods;
	this.mode = mode;
	this.frameColor = frameColor;
	this.showNumbers = false;
	this.middleRod = Math.floor(numberOfRods / 2) + 1;
	this.width = DISTANCE_RODS * (numberOfRods + 1 ); 
}

var Rod = function(position, beads, value, disabled) {
	this.position = position;
	this.beads = beads;
	this.value = value;
	this.disabled = disabled;
}

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

// Prototypes
Abacus.prototype = {
	drawFrame: function() {
		context.save();
		context.strokeStyle = frameColor;
		context.lineWidth = FRAME_LINE_WIDTH;
		context.shadowColor = 'rgba(0,0,0,0.5)';
		context.shadowOffsetX = 3;
		context.shadowOffsetY = 3;
		context.shadowBlur = 8;
		context.beginPath();
		context.rect(LEFT_MARGIN, top_frame, this.width, HEIGHT);
		context.moveTo(LEFT_MARGIN + FRAME_LINE_WIDTH / 2, top_frame + HEAVEN);
		context.lineTo(LEFT_MARGIN + this.width - FRAME_LINE_WIDTH / 2, top_frame + HEAVEN);
		context.stroke();
		var middle = Math.floor(this.numberOfRods/ 2);
		context.lineWidth = 1;
		context.strokeStyle = DOT_STROKE_STYLE;
		context.fillStyle = DOT_FILL_STYLE;
		for (var i = 0, x = LEFT_MARGIN + DISTANCE_RODS; i < this.numberOfRods; ++i, x += DISTANCE_RODS) {
			// Dot in this and this +- 3
			if ((i - middle) % 3 === 0) {
				context.beginPath();
				context.arc(x, top_frame + HEAVEN, DOT_SIZE, 0, Math.PI * 2, false);
				context.fill();
				context.stroke();
			}
		}
		context.restore();
	},
	
	drawRods : function() {
		context.save();
		context.strokeStyle = ROD_STROKE_STYLE;
		context.lineWidth = ROD_LINE_WIDTH;
		for (var i = 0, x = LEFT_MARGIN + DISTANCE_RODS; i < this.numberOfRods; ++i, x += DISTANCE_RODS) {
			var rod = this.rods[i];
			rod.draw();
		}
		context.restore();
	},
	
	draw: function() {
		context.save();
		if (abacus.showNumbers) {
			top_frame = TOP_MARGIN + NUMBER_HEIGHT;	
		} else {
			top_frame = TOP_MARGIN;
		}
		
		canvas.height = top_frame + HEIGHT + 10;
		context.clearRect(0,0,canvas.width, canvas.height);
		this.drawRods();
		this.drawFrame();
		context.restore();
	},
	
	reset: function() {
		for (var i = 0; i < this.numberOfRods; i++) {
			var rod = this.rods[i];
			rod.reset();
		}
	},
	
	disableUselessRods: function() {
		this.rods[this.numberOfRods -3].disabled = true;
		this.rods[this.numberOfRods -6].disabled = true;
		this.rods[this.numberOfRods -9].disabled = true;
	}
	
}

Rod.prototype = {
	drawBeads : function() {
		for (var i = 0; i < this.beads.length; i++){
			this.beads[i].draw(context);
		}
	},
	
	drawRod : function() {
		context.save();
		context.strokeStyle = ROD_STROKE_STYLE;
		context.lineWidth = ROD_LINE_WIDTH;
		if (this.disabled) {
			context.globalAlpha = 0.2;
		} else {
			context.globalAlpha = 1;
		}
		context.shadowColor = 'rgba(0,0,0,0.5)';
		context.shadowOffsetX = 3;
		context.shadowOffsetY = 3;
		context.shadowBlur = 8;
		context.beginPath();
		context.moveTo(this.evalXPos(), top_frame);
		context.lineTo(this.evalXPos(), top_frame + HEIGHT);
		context.stroke();
		context.restore();	
	},
	
	draw : function() {
		this.drawRod();
		this.drawBeads();
		if (abacus.showNumbers) {
			this.writeValue();
		}
	},
	
	evalXPos : function() {
		return LEFT_MARGIN + this.position * DISTANCE_RODS;
	},
	
	
	reset :  function() {
		for (var i = 0; i < this.beads.length; i++){
			this.beads[i].reset();
		}
		this.value = 0;
		
	},
	
	writeValue: function() {
		if (this.disabled) {
			context.globalAlpha = 0.2;
		} else {
			context.globalAlpha = 1;
		}
		context.font="35px Tahoma, Geneva, sans-serif";
		context.textAlign="center";
		context.lineWidth=2;
		context.fillStyle='rgba(153,76,0,1)';
		context.strokeStyle='rgba(153,76,0,1)';
		context.fillText(this.value,this.evalXPos(),TOP_MARGIN);
		context.strokeText(this.value,this.evalXPos(),TOP_MARGIN);
	}
}

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
		var x = LEFT_MARGIN + this.rod.position * DISTANCE_RODS, y = undefined;

		if (this.heaven) {
			if (this.active) {
				y = top_frame + HEAVEN - BEAD_HEIGHT / 2 - FRAME_LINE_WIDTH / 2;
			} else {
				y = top_frame + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			}
		} else {//earth
			if (this.active) {
				y = top_frame + HEAVEN + (this.order - 1) * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			} else {
				y = top_frame + HEAVEN + this.order * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
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
		context.shadowColor = 'rgba(0,0,0,0.5)';
		context.shadowOffsetX = 3;
		context.shadowOffsetY = 3;
		context.shadowBlur = 8;
		if (this.active) {
			context.fillStyle = activeColor;
		} else {
			context.fillStyle = beadColor;
		}
		if (this.rod.disabled) {
			context.globalAlpha = 0.2;
		} else {
			context.globalAlpha = 1;
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
	},
	
	reset: function() {
		this.active = false;
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

function drawAbacus2() {
	abacus = new Abacus(numberOfRods, modeElement.value, frameColor);
	abacus.draw();
}


function resetAbacus() {
	abacus = new Abacus(abacus.numberOfRods, abacus.mode, abacus.frameColor);
}

function getBead(rod, heaven, order) {
	for (var i = 0; i < rod.beads.length; i++) {
		if (rod.beads[i].heaven === heaven 
		 && rod.beads[i].order === order) {
		 	return rod.beads[i];
		 }	
	}
}

function writeTime() {
	var date = new Date;
	var cents = Math.floor(date.getMilliseconds()/10);
	var secs = date.getSeconds();
	var mins = date.getMinutes();
	var hours = date.getHours();
	abacus.disableUselessRods();
	putNumberInRod(cents%10, abacus.numberOfRods - 1);
	putNumberInRod(Math.floor(cents/10), abacus.numberOfRods - 2);
	putNumberInRod(secs%10, abacus.numberOfRods - 4);
	putNumberInRod(Math.floor(secs/10), abacus.numberOfRods - 5);
	putNumberInRod(mins%10, abacus.numberOfRods - 7);
	putNumberInRod(Math.floor(mins/10), abacus.numberOfRods - 8);
	putNumberInRod(hours%10, abacus.numberOfRods - 10);
	putNumberInRod(Math.floor(hours/10), abacus.numberOfRods - 11);
}


// Event handlers.................................................................

function clickOrTouch(e) {
	if (mode == 'normal') {	
		var loc = windowToCanvas(e.clientX, e.clientY);
//		e.preventDefault();
		var found = false;
		for (var i = 0; i < abacus.numberOfRods && !found; i++) {
			var currentRod = abacus.rods[i];
			for(var j = 0; j < currentRod.beads.length && !found; j++) {
				var currentBead = currentRod.beads[j];
				currentBead.createPath(context);
				if (context.isPointInPath(loc.x, loc.y)) {
					found = true;
					if (soundActive) {
						beadSound.play();
					}
					clickedBead(currentBead);	
				}
			}
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		//drawAbacus();
		abacus.draw();
	}
}

canvas.onclick = clickOrTouch;
// document.ontouchstart = clickOrTouch;
// document.ontouchend = function(e) {
//	e.preventDefault();	
// };


numberOfRodsElement.onchange = function(e) {
	abacus.numberOfRods = parseInt(numberOfRodsElement.value);
	abacus.width = DISTANCE_RODS * (abacus.numberOfRods + 1 );
	canvas.width = abacus.width + 2 * LEFT_MARGIN;
	localStorage.setItem("numberOfRods", numberOfRodsElement.selectedIndex);
	resetAbacus();
	abacus.draw();
};

modeElement.onchange = function(e) {
	resetAbacus();
	mode = modeElement.value;
	if (mode == 'normal') {
		top_frame = top_frame;
		canvas.style.cursor='pointer';
		fieldSetNormal.disabled=false;
		fieldSetGTN.disabled=true;
		abacus.showNumbers = false;
		abacus.draw();
		clearInterval(intervalId);
	} else if (mode == 'game1') {
		top_frame = top_frame;
		canvas.style.cursor='auto';
		fieldSetNormal.disabled=true;
		fieldSetGTN.disabled=false;
		showButton.disabled=true;
		abacus.showNumbers = false;
		abacus.draw();
		clearInterval(intervalId);
	} else if (mode == 'clock') {
		top_frame = top_frame + DISTANCE_RODS/2;
		canvas.style.cursor='auto';
		fieldSetNormal.disabled=true;
		fieldSetGTN.disabled=false;
		showButton.disabled=true;
		abacus.showNumbers = true;
		abacus.draw();
		intervalId = setInterval(writeTime, 10);
	}
	//answerElement.style.display = 'none';
	localStorage.setItem("mode", modeElement.selectedIndex);
}

frameColorElement.onchange = function(e) {
	frameColor = frameColorElement.value;
	localStorage.setItem("frameColor", frameColorElement.selectedIndex);
	//drawAbacus();
	abacus.draw();
};

beadColorElement.onchange = function(e) {
	beadColor = beadColorElement.value;
	localStorage.setItem("beadColor", beadColorElement.selectedIndex);
	//drawAbacus();
	abacus.draw();
};

activeColorElement.onchange = function(e) {
	activeColor = activeColorElement.value == 'none' ? beadColor : activeColorElement.value;
	localStorage.setItem("activeColor", activeColorElement.selectedIndex);
	//drawAbacus();
	abacus.draw();
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
	//answerElement.style.display = 'none';
	showButton.disabled = true;
	resetAbacus();
	abacus.draw();
};

goButton.onclick = function(e) {
	abacus.showNumbers = false;
	numberToPut = (from + Math.random() * (to - from)).toFixed(0);
	//answerElement.style.display = 'none';
	showButton.disabled = true;
	repeatButton.disabled = false;
	//answerElement.innerHTML = numberToPut;
	writeNumberInAbacus(numberToPut, abacus.middleRod);
	setTimeout(function() {	resetAbacus();
				abacus.draw();
				showButton.disabled=false}, showTime);
};

repeatButton.onclick = function(e) {
	abacus.showNumbers = false;
	if (numberToPut != undefined) {
		//answerElement.style.display = 'none';
		showButton.disabled = true;
		//answerElement.innerHTML = numberToPut;
		writeNumberInAbacus(numberToPut, abacus.middleRod);
		setTimeout(function() {	resetAbacus();
					abacus.draw();
					showButton.disabled=false}, showTime);
	}
}

showButton.onclick = function(e) {
	abacus.showNumbers = true;
	//answerElement.style.display = 'inline';
	writeNumberInAbacus(numberToPut, abacus.middleRod);
	//disableUselessRods(numberToPut);
};

// Calculations...............................................................

function writeNumberInAbacus(number, unitsRod) {
	resetAbacus();	
	// Convert the number to string to make calculations easier
	var toWrite = number.toString();
	for (var i = 0; i < toWrite.length; i++) {
		putNumberInRod(toWrite.substring(i,i+1), unitsRod - toWrite.length + i);
	}
	
}

function clickedBead(bead) {
	if (bead.heaven) {
		if (bead.active) {
			bead.active = false;
			bead.rod.value -= 5;
		} else {
			bead.active = true;
			bead.rod.value += 5;
		}
	} else {
		if (bead.active) {
			bead.active = false;
			bead.rod.value--;
			for (var i = bead.order + 1; i <= 4; i++) {
				var nextBead = getBead(bead.rod, false, i);
				if (nextBead.active) {
					nextBead.active = false;
					nextBead.rod.value--;
				}
			}
		} else {
			bead.active = true;
			bead.rod.value++;
			for (var i = 1; i < bead.order; i++) {
				var nextBead = getBead(bead.rod, false, i);
				if (!nextBead.active) {
					nextBead.active = true;
					nextBead.rod.value++;
				}
			}
		}
	}
	return;
}

function putNumberInRod(number, rodNumber) {
    abacus.rods[rodNumber].reset();
    if (number > 0) {
        if (number <= 4) {
            clickedBead(abacus.rods[rodNumber].beads[number]);
        } else if (number == 5) {
            clickedBead(abacus.rods[rodNumber].beads[0]);
        } else if (number < 10) {
		clickedBead(abacus.rods[rodNumber].beads[0]);
		clickedBead(abacus.rods[rodNumber].beads[number-5]);
        } else {
		
	}
    }    
    //drawAbacus();
    abacus.draw();
}

// Initialization..................................................................

//resetAbacus();

drawAbacus2();

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
 
//drawAbacus();

