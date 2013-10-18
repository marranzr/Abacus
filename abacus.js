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
	debugLabel = document.getElementById('debug'),
	ongoingTouches = [];

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
				y = TOP_MARGIN + HEAVEN - BEAD_HEIGHT / 2 - FRAME_LINE_WIDTH / 2;
			} else {
				y = TOP_MARGIN + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			}
		} else {//earth
			if (this.active) {
				y = TOP_MARGIN + HEAVEN + (this.order - 1) * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			} else {
				y = TOP_MARGIN + HEAVEN + this.order * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
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
	context.rect(LEFT_MARGIN, TOP_MARGIN, width, HEIGHT);
	context.stroke();
	context.restore();
}

function drawHeavenLine() {
	context.save();
	context.strokeStyle = frameColor;
	context.lineWidth = FRAME_LINE_WIDTH;
	context.beginPath();
	context.moveTo(LEFT_MARGIN + FRAME_LINE_WIDTH / 2, TOP_MARGIN + HEAVEN);
	context.lineTo(LEFT_MARGIN + width - FRAME_LINE_WIDTH / 2, TOP_MARGIN + HEAVEN);
	context.stroke();
	context.restore();
}

function drawRods() {
	context.save();
	context.strokeStyle = ROD_STROKE_STYLE;
	context.lineWidth = ROD_LINE_WIDTH;
	context.beginPath();
	for (var i = 0, x = LEFT_MARGIN + DISTANCE_RODS; i < numberOfRods; ++i, x += DISTANCE_RODS) {
		context.moveTo(x, TOP_MARGIN);
		context.lineTo(x, TOP_MARGIN + HEIGHT);
	}
	context.stroke();

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
			context.arc(x, TOP_MARGIN + HEAVEN, DOT_SIZE, 0, Math.PI * 2, false);
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

function evalRod(x) {
	var column = Math.floor(((x - LEFT_MARGIN + DISTANCE_RODS/2) / DISTANCE_RODS)) 
	return column <= numberOfRods ? column : 0 ; 
}

function ongoingTouchIndexById(idToFind) {
  for (var i=0; i<ongoingTouches.length; i++) {
    var id = ongoingTouches[i].touch.identifier;
    //debugLabel.innerHTML = 'touch id = ' +  id;
    //debugLabel.innerHTML += ', idToFind = ' +  idToFind;
    
    if (id == idToFind) {
      //debugLabel.innerHTML += ', devuelvo = ' +  i;
      return i;
    }
  }
  return -1;    // not found
}

function createRodPathForClipping(rod) {
	context.beginPath();
	//context.strokeStyle = 'red';
	//context.lineWidth = 1;
	context.rect(LEFT_MARGIN + (DISTANCE_RODS)*rod - (DISTANCE_RODS/2), TOP_MARGIN, DISTANCE_RODS, HEIGHT);
	//context.stroke();
	context.clip();
}

function registerTouchedBeads(touches) {
	for (var i = 0; i < touches.length; i++) {
		var loc = windowToCanvas(touches[i].clientX, touches[i].clientY);	
		var touchedRod = evalRod(loc.x);
		if (touchedRod > 0) { // touch on a rod
			var found = false;
			for(var j = 0; j < beads[touchedRod].length && !found; j++) {
				var bead = beads[touchedRod][j];
				bead.createPath(context);
				if (context.isPointInPath(loc.x, loc.y)) {
					var data =     {clientX: touches[i].clientX,
							clientY: touches[i].clientY,
							identifier: touches[i].identifier}
					ongoingTouches.push({bead: bead, touch: data});
					//debugLabel.innerHTML = "Registered bead " + j + " in rod " + touchedRod + ", identifier: " + touches[i].identifier;
					
					found = true;
				}
			}
		}
	}
}

function showTouchIds(touchList) {
	debugLabel.innerHTML = "";
	for (var i = 0; i < touchList.length; i++) {
		debugLabel.innerHTML += "touch " + i + ": " + touchList[i].touch.identifier;
	}
}

// Event handlers.................................................................

function click(e) {
//	debugLabel.innerHTML = 'Hola Click';
	if (mode == 'normal') {
		var loc = windowToCanvas(e.clientX, e.clientY);
		var clickedRod = evalRod(loc.x);
		//debugLabel.innerHTML = clickedRod;
		if (clickedRod == 0) {return};
//		e.preventDefault();
		
		var found = false;
		for(var j = 0; j < beads[clickedRod].length && !found; j++) {
			beads[clickedRod][j].createPath(context);
			if (context.isPointInPath(loc.x, loc.y)) {
				if (soundActive) {
					beadSound.play();
				}
				clickedBead(beads[clickedRod][j]);
				found = true;
			}
		}
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.save();
		createRodPathForClipping(clickedRod);
		drawAbacus();
		context.restore();
	}
}

function touchStart(e) {
	//debugLabel.innerHTML = 'Start id: ' + e.changedTouches[0].identifier;
	if (mode == 'normal') {
		e.preventDefault();
		var touches = e.changedTouches;
		registerTouchedBeads(touches);
		showTouchIds(ongoingTouches);
	}
}
		
function touchEnd(e) {
	if (mode == 'normal') {
		var touches = e.changedTouches;
		for (var i = 0; i < touches.length; i++) {
			var idx = ongoingTouchIndexById(touches[i].identifier);
			ongoingTouches.splice(idx, 1);
			showTouchIds(ongoingTouches);
		}
	}
}

function touchMove(e) {
	//debugLabel.innerHTML = 'Move id: ' + e.changedTouches[0].identifier;
	//debugLabel.innerHTML = 'hola';
	if (mode == 'normal') {
		console.time('1');
		e.preventDefault();
		// test if we are in a bead movement
		var changedTouches = e.changedTouches;
		var found = false;
		var loc, startLoc, idx;
		console.timeEnd('1');
		console.time('2');
		for (var i = 0; i < changedTouches.length && !found; i++) {
			//debugLabel.innerHTML += ', changed touch id[' + i + '] = ' + changedTouches[i].identifier;
			idx = ongoingTouchIndexById(changedTouches[i].identifier);
			if (idx >= 0) {
				//debugLabel.innerHTML += 'touch found';
				found = true;
				loc = windowToCanvas(changedTouches[i].clientX, changedTouches[i].clientY);
				//debugLabel.innerHTML += ', loc.y = ' + loc.y;
				startLoc = windowToCanvas(ongoingTouches[idx].touch.clientX, ongoingTouches[idx].touch.clientY);
				//debugLabel.innerHTML += ', startLoc.y = ' + startLoc.y;
			} else {
				//debugLabel.innerHTML += 'touch not found';
				
			}
		}
		console.timeEnd('2');
		console.time('3');
		var bead = ongoingTouches[idx].bead;
		//debugLabel.innerHTML = bead.position;
		// touch, and therefore, bead, identified
		// move the bead if needed
		if (bead.heaven) {
			if (bead.active) {
				if (loc.y < startLoc.y) {
					if (soundActive) {
						beadSound.play();
					}
					clickedBead(bead);
				}
			} else {
				if (loc.y > startLoc.y) {
					if (soundActive) {
						beadSound.play();
					}
					clickedBead(bead);
				}
			}
		} else {
			if (bead.active) {
				if (loc.y > startLoc.y) {
					if (soundActive) {
						beadSound.play();
					}
					clickedBead(bead);
				}
			} else {
				if (loc.y < startLoc.y) {
					if (soundActive) {
						beadSound.play();
					}
					clickedBead(bead);
				}
			}
		}
		console.timeEnd('3');
		console.time('4');
		context.clearRect(0, 0, canvas.width, canvas.height);
		console.timeEnd('4');
		console.time('4');
		drawAbacus();
		console.timeEnd('4');
		// test if we are still over a bead, then reregister
		//ongoingTouches.splice(idx, 1, changedTouches[i]	);
		showTouchIds(ongoingTouches);
	} 
}

canvas.onclick = click;
canvas.addEventListener('touchstart', touchStart, false);
canvas.addEventListener('touchmove', touchMove, false);
canvas.addEventListener('touchend', touchEnd, false);


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
		canvas.style.cursor='pointer';
		fieldSetNormal.disabled=false;
		fieldSetGTN.disabled=true;
	} else {
		canvas.style.cursor='auto';
		fieldSetNormal.disabled=true;
		fieldSetGTN.disabled=false;
		showButton.disabled=true;
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
	//debugLabel.innerHTML = 'Click';
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

