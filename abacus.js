var canvas = document.getElementById('canvas'), 
	context = canvas.getContext('2d'), 
	frameColorElement = document.getElementById('frameColor'), 
	frameColor = frameColorElement.value, 
	beadColorElement = document.getElementById('beadColor'),
	beadColor = beadColorElement.value;
	numberOfRodsElement = document.getElementById('numberOfRods'), 
	numberOfRods = parseInt(numberOfRodsElement.value), 
	resetButton = document.getElementById('reset'),
	valueElement = document.getElementById('value'),
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
	beads = [];

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
		context.fillStyle = beadColor;
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
	valueElement.value	 = ' ' + getAbacusValue();
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

	beads.forEach(function(bead) {
		bead.draw(context);
	});
}

function resetAbacus() {
	beads = [];
	for (var i = 0; i < numberOfRods; i++) {
		var heaven = new Bead(i + 1, true, 0, false);
		beads.push(heaven);
		for (var j = 0; j < 4; j++) {
			var earth = new Bead(i + 1, false, j + 1, false);
			beads.push(earth);
		}
	}
	drawBeads();
}

function getBead(rod, heaven, order) {
	for (var i = 0; i < beads.length; i++) {
		if (beads[i].rod === rod 
		 && beads[i].heaven === heaven 
		 && beads[i].order === order) {
		 	return beads[i];
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
	beads.forEach(function(bead) {
		if (bead.heaven) {
			value += bead.active ? 5 * evalRodMultiplier(bead.rod) : 0;
		} else {
			value += bead.active ? evalRodMultiplier(bead.rod) : 0;
		}
	});
	return value.toFixed(numberOfRods - evalUnitsRod());
}

function putValueInAbacus(value) {
	
}

function resetRod(rod) {
	
}

function putNumberInRod(number, rod) {
	resetRod(rod);
	if (number < 5) {
		for (var i = 0; i < number; i++) {
			
		}
	}
}


// Event handlers.................................................................
canvas.onclick = function (e) {
	var loc = windowToCanvas(e.clientX, e.clientY);
	e.preventDefault();
	
	beads.forEach(function(bead) {
		bead.createPath(context);
		if (context.isPointInPath(loc.x, loc.y)) {
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
	});
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawAbacus();
};

numberOfRodsElement.onchange = function(e) {
	numberOfRods = parseInt(numberOfRodsElement.value);
	width = DISTANCE_RODS * (numberOfRods + 1 );
	localStorage.setItem("numberOfRods", numberOfRodsElement.selectedIndex);
	resetAbacus();
	drawAbacus();
};

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

resetButton.onclick = function(e) {
	resetAbacus();
	drawAbacus();
};


// Initialization..................................................................

context.shadowColor = 'rgba(0,0,0,1)';
context.shadowOffsetX = 3;
context.shadowOffsetY = 3;
context.shadowBlur = 6;

var beadColorIndex = localStorage.getItem("beadColor"),
	frameColorIndex = localStorage.getItem("frameColor"),
	numberOfRodsIndex = localStorage.getItem("numberOfRods");
beadColorElement.selectedIndex = beadColorIndex;
beadColorElement.onchange.apply();
frameColorElement.selectedIndex = frameColorIndex;
frameColorElement.onchange.apply();
numberOfRodsElement.selectedIndex = numberOfRodsIndex;
numberOfRodsElement.onchange.apply();


resetAbacus();
drawAbacus();

//drawGrid(context, 'lightgrey', 10, 10);
