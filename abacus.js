var canvas = document.getElementById('canvas'), 
	context = canvas.getContext('2d'), 
	frameColor = 'black', 
	inactiveBeadColor = 'ivory',
	activeBeadColor = 'red',
	numberOfRods = 13,
	resetButton = document.getElementById('reset'),
	valueElement = document.getElementById('value'),
	number0Button = document.getElementById('number0'),
	number1Button = document.getElementById('number1'),
	number2Button = document.getElementById('number2'),
	number3Button = document.getElementById('number3'),
	number4Button = document.getElementById('number4'),
	number5Button = document.getElementById('number5'),
	number6Button = document.getElementById('number6'),
	number7Button = document.getElementById('number7'),
	number8Button = document.getElementById('number8'),
	number9Button = document.getElementById('number9'),
	additionButton = document.getElementById('additionKey'),
	substractionButton = document.getElementById('substractionKey'),
	timesButton = document.getElementById('timesKey'),
	divisionButton = document.getElementById('divisionKey'),
	pointButton = document.getElementById('pointKey'),
	equalsButton = document.getElementById('equalsKey'),
	infoElement = document.getElementById('info'),
	DISTANCE_RODS = 60, 
	width = DISTANCE_RODS * (numberOfRods + 1 ), 
	MARGIN_TOP = 50,
	MARGIN_LEFT = 300,
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
	beads = [],
	currentValue = 0,
	firstOperand = null,
	secondOperand = null,
	currentOperation = null;

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
		var x = MARGIN_LEFT + this.rod * DISTANCE_RODS, y = undefined;

		if (this.heaven) {
			if (this.active) {
				y = MARGIN_TOP + HEAVEN - BEAD_HEIGHT / 2 - FRAME_LINE_WIDTH / 2;
			} else {
				y = MARGIN_TOP + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			}
		} else {//earth
			if (this.active) {
				y = MARGIN_TOP + HEAVEN + (this.order - 1) * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			} else {
				y = MARGIN_TOP + HEAVEN + this.order * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
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
		context.fillStyle = this.active ? activeBeadColor : inactiveBeadColor;
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
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawRods();
	drawBeads();
	drawFrame();
	drawHeavenLine();
	drawDots();
	//valueElement.value	 = ' ' + getAbacusValue();
}

function drawFrame() {
	context.save();
	context.strokeStyle = frameColor;
	context.lineWidth = FRAME_LINE_WIDTH;
	context.beginPath();
	context.rect(MARGIN_LEFT, MARGIN_TOP, width, HEIGHT);
	context.stroke();
	context.restore();
}

function drawHeavenLine() {
	context.save();
	context.strokeStyle = frameColor;
	context.lineWidth = FRAME_LINE_WIDTH;
	context.beginPath();
	context.moveTo(MARGIN_LEFT + FRAME_LINE_WIDTH / 2, MARGIN_TOP + HEAVEN);
	context.lineTo(MARGIN_LEFT + width - FRAME_LINE_WIDTH / 2, MARGIN_TOP + HEAVEN);
	context.stroke();
	context.restore();
}

function drawRods() {
	context.save();
	context.strokeStyle = ROD_STROKE_STYLE;
	context.lineWidth = ROD_LINE_WIDTH;
	for (var i = 0, x = MARGIN_LEFT + DISTANCE_RODS; i < numberOfRods; ++i, x += DISTANCE_RODS) {
		context.beginPath();
		context.moveTo(x, MARGIN_TOP);
		context.lineTo(x, MARGIN_TOP + HEIGHT);
		context.stroke();
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
	for (var i = 0, x = MARGIN_LEFT + DISTANCE_RODS; i < numberOfRods; ++i, x += DISTANCE_RODS) {
		// Dot in this and this +- 3
		if ((i - middle) % 3 === 0) {
			context.beginPath();
			context.arc(x, MARGIN_TOP + HEAVEN, DOT_SIZE, 0, Math.PI * 2, false);
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
	currentValue = 0;
	valueElement.value = 0;
}

function getBead(rod, heaven, order) {
	for (var i = 0; i < beads[rod].length; i++) {
		if (beads[rod][i].heaven === heaven 
		 && beads[rod][i].order === order) {
		 	return beads[rod][i];
		 }	
	}
}

// Calculations...............................................................

function writeNumberInAbacus(number, unitsRod) {
	
	// Convert the number to string to make calculations easier
	var toWrite = number.toString();
	for (var i = 0; i < toWrite.length; i++) {
		if (unitsRod - toWrite.length + i + 1 <= 0) {
			alert ("Number too big");
			infoElement.value = '';
			currentValue = 0;
			return;
		} else {
			putNumberInRod(toWrite.substring(i,i+1), unitsRod - toWrite.length + i + 1);
		}
	}
	
}

function evalUnitsRod() {
	// Units is middle row + 3
	return Math.floor(numberOfRods / 2) + 4; 
}

function evalRodMultiplier(rod) {
	return Math.pow(10, evalUnitsRod() - rod);
}

function getAbacusValue() {
	var value = 0;
	for (var rod = 1; rod <= numberOfRods; rod++) {
		value += evalRodValue(rod) * evalRodMultiplier();
	};
	return value.toFixed(numberOfRods - evalUnitsRod());
}


function evalRodValue(rod) {
	var value = 0;
	for (var j = 0; j < beads[rod].length; j++) {
		if (beads[rod][j].heaven) {
			value += beads[rod][j].active ? 5 : 0;
		} else {
			value += beads[rod][j].active ? 1 : 0;
		}
	}
	return value;
}

function resetRod(rod) {
	for (var i = 0; i < beads[rod].length; i++) {
		beads[rod][i].active = false;
	}
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


function clickedNumber(number) {
	window['number' + number + 'Button'].style.border = '1px inset #bdbdbd';
	infoElement.value += number;
	currentValue = Number(infoElement.value).toFixed(0);
	
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

// Event handlers.................................................................
//canvas.onclick = function (e) {
//	var loc = windowToCanvas(e.clientX, e.clientY);
//	e.preventDefault();
//	
//	for (var i = 1; i <= numberOfRods; i++) {
//		for(var j = 0; j < beads[i].length; j++) {
//			beads[i][j].createPath(context);
//			if (context.isPointInPath(loc.x, loc.y)) {
//				clickedBead(beads[i][j]);	
//			}
//		}
//	}
//	context.clearRect(0, 0, canvas.width, canvas.height);
//	drawAbacus();
//};


resetButton.onclick = function(e) {
	resetAbacus();
	drawAbacus();
	infoElement.value = '';
	currentOperation = null;
};

window.onkeydown = function(e) {
	var charPressed = String.fromCharCode(e.keyCode);
	if (charPressed >= 0 &&
	    charPressed <= 9) {
		clickedNumber(charPressed);		
	}
}

number1Button.onmousedown = function() {clickedNumber(1)};
number1Button.onmouseup = function() {
	number1Button.style.border = '1px outset #bdbdbd';
};
number1Button.onclick = function() {clickedNumber(1)};
number2Button.onclick = function() {clickedNumber(2)};
number3Button.onclick = function() {clickedNumber(3)};
number4Button.onclick = function() {clickedNumber(4)};
number5Button.onclick = function() {clickedNumber(5)};
number6Button.onclick = function() {clickedNumber(6)};
number7Button.onclick = function() {clickedNumber(7)};
number8Button.onclick = function() {clickedNumber(8)};
number9Button.onclick = function() {clickedNumber(9)};
number0Button.onclick = function() {clickedNumber(0)};

pointButton.onclick = function() {
	alert('Not implemented yet');
};

additionButton.onclick = function() {
	if (currentOperation === null) {
		writeNumberInAbacus(currentValue, evalUnitsRod());
		currentOperation = 'addition';
		infoElement.value += ' + ';
		firstOperand = currentValue;
		valueElement.value = currentValue;
	} else {
		alert('Error: operation already defined');
	}	
};

substractionButton.onclick = function() {
	alert('Not implemented yet');
};

timesButton.onclick = function() {
	alert('Not implemented yet');
};

divisionButton.onclick = function() {
	alert('Not implemented yet');
};

equalsButton.onclick = function() {
//	writeNumberInAbacus(currentValue, evalUnitsRod());
}

// Initialization..................................................................

context.shadowColor = 'rgba(0,0,0,1)';
context.shadowOffsetX = 3;
context.shadowOffsetY = 3;
context.shadowBlur = 6;

resetAbacus();
infoElement.value = '';
drawAbacus();
valueElement.value = 0;


