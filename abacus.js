var canvas = document.getElementById('canvas'), context = canvas.getContext('2d'), frameColorElement = document.getElementById('frameColor'), frameColor = frameColorElement.value, numberOfRodsElement = document.getElementById('numberOfRods'), numberOfRods = parseInt(numberOfRodsElement.value), DISTANCE_RODS = 60, width = DISTANCE_RODS * (numberOfRods + 1 ), MARGIN = 40,
//HEIGHT = 240,
FRAME_LINE_WIDTH = 10, ROD_STROKE_STYLE = 'rgba(212,85,0,0.5)', ROD_LINE_WIDTH = 6, DOT_STROKE_STYLE = 'rgba(0, 0, 0, 1)', DOT_FILL_STYLE = 'rgba(255, 255, 255, 1)', DOT_SIZE = 3, BEAD_WIDTH = 48, BEAD_HEIGHT = 30, BEAD_COLOR = 'rgba(255,250,245,1)', BEAD_STROKE = 'rgba(245,240,235,1)', BEAD_STROKE = 'black', HEAVEN = BEAD_HEIGHT * 2 + FRAME_LINE_WIDTH, EARTH = BEAD_HEIGHT * 5, HEIGHT = HEAVEN + EARTH + FRAME_LINE_WIDTH;

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

		points.push(new Point(center.x + BEAD_WIDTH / 4, center.y - BEAD_HEIGHT / 2));
		// ____\

		//  __
		points.push(new Point(center.x - BEAD_WIDTH / 4, center.y - BEAD_HEIGHT / 2));
		// ____\

		//   __
		points.push(new Point(center.x - BEAD_WIDTH / 2, center.y));
		// /____\

		//   __
		points.push(new Point(center.x - BEAD_WIDTH / 4, center.y + BEAD_HEIGHT / 2));
		// /____\
		// \

		//   __
		points.push(new Point(center.x + BEAD_WIDTH / 4, center.y + BEAD_HEIGHT / 2));
		// /____\
		// \ __

		//   __
		points.push(new Point(center.x + BEAD_WIDTH / 2, center.y));
		// /____\
		// \ __ /

		return points;
	},

	evalPosition : function() {// returns the central point of the bead;
		var x = MARGIN + this.rod * DISTANCE_RODS, y = undefined;

		if (this.heaven) {
			if (this.active) {
				y = MARGIN + HEAVEN - BEAD_HEIGHT / 2 - FRAME_LINE_WIDTH / 2;
			} else {
				y = MARGIN + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			}
		} else {//earth
			if (this.active) {
				y = MARGIN + HEAVEN + (this.order - 1) * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			} else {
				y = MARGIN + HEAVEN + this.order * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
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
		context.fillStyle = BEAD_COLOR;
		context.strokeStyle = BEAD_STROKE;
		context.lineWidth = 1;
		this.createPath(context);
		context.fill();
		context.stroke();
		context.restore();
	}
};

// Functions..............................................
function drawAbacus() {
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
	context.rect(MARGIN, MARGIN, width, HEIGHT);
	context.stroke();
	context.restore();
}

function drawHeavenLine() {
	context.save();
	context.strokeStyle = frameColor;
	context.lineWidth = FRAME_LINE_WIDTH;
	context.beginPath();
	context.moveTo(MARGIN, MARGIN + HEAVEN);
	context.lineTo(MARGIN + width, MARGIN + HEAVEN);
	context.stroke();
	context.restore();
}

function drawRods() {
	context.save();
	context.strokeStyle = ROD_STROKE_STYLE;
	context.lineWidth = ROD_LINE_WIDTH;
	for (var i = 0, x = MARGIN + DISTANCE_RODS; i < numberOfRods; ++i, x += DISTANCE_RODS) {
		context.beginPath();
		context.moveTo(x, MARGIN);
		context.lineTo(x, MARGIN + HEIGHT);
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
	for (var i = 0, x = MARGIN + DISTANCE_RODS; i < numberOfRods; ++i, x += DISTANCE_RODS) {
		// Dot in this and this +- 3
		if ((i - middle) % 3 === 0) {
			context.beginPath();
			context.arc(x, MARGIN + HEAVEN, DOT_SIZE, 0, Math.PI * 2, false);
			context.fill();
			context.stroke();
		}
	}
	context.restore();
}

function drawBeads() {

	for (var i = 0; i < numberOfRods; i++) {
		var heaven = new Bead(i + 1, true, 0, false);
		heaven.draw(context);
		for (var j = 0; j < 4; j++) {
			var earth = new Bead(i + 1, false, j + 1, false);
			earth.draw(context);
		}
	}
	// var bead = new Bead(5, true, 4, false);
	// bead.draw(context);
	//
	// var bead = new Bead(5, true, 4, true);
	// bead.draw(context);
	//
	// var bead = new Bead(5, false, 4, false);
	// bead.draw(context);
	//
	// var bead = new Bead(5, false, 4, true);
	// bead.draw(context);
	//
	// var bead = new Bead(6, false, 3, false);
	// bead.draw(context);
	//
	// var bead = new Bead(6, false, 3, true);
	// bead.draw(context);
	//
	// var bead = new Bead(7, false, 2, false);
	// bead.draw(context);
	//
	// var bead = new Bead(7, false, 2, true);
	// bead.draw(context);
	//
	// var bead = new Bead(8, false, 1, false);
	// bead.draw(context);
	//
	// var bead = new Bead(8, false, 1, true);
	// bead.draw(context);
}

// Event handlers.................................................................
numberOfRodsElement.onchange = function(e) {
	numberOfRods = parseInt(numberOfRodsElement.value);
	width = DISTANCE_RODS * (numberOfRods + 1 ), drawAbacus();
};

frameColorElement.onchange = function(e) {
	frameColor = frameColorElement.value;
	drawAbacus();
};

// Initialization..................................................................

context.shadowColor = 'rgba(0,0,0,1)';
context.shadowOffsetX = 3;
context.shadowOffsetY = 3;
context.shadowBlur = 6;

drawAbacus();

//drawGrid(context, 'lightgrey', 10, 10);
