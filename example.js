var context = document.getElementById('canvas').getContext('2d'),
    selectElement = document.getElementById('compositingSelect');
    
// Functions.....................................................

function windowToCanvas(canvas, x, y) {
   var bbox = canvas.getBoundingClientRect();
   return {
      x: x - bbox.left * (canvas.width / bbox.width),
      y: y - bbox.top * (canvas.width / bbox.width)
   };
}

function drawText() {
   context.save();
   
   context.shadowColor     ='rgba(100,100,150,0.8)';
   context.shadowOffsetX   = 5;
   context.shadowOffsetY   = 5;
   context.shadowBlur      = 10;
   context.fillStyle       = 'cornflowerblue';
   context.fillText('HTML5', 20, 250);
   
   context.strokeStyle     = 'yellow';
   context.strokeText('HTML5', 20, 250);
   
   context.restore();
}

// Event handlers ...............................................

context.canvas.onmousemove = function(e) {
   var loc = windowToCanvas(context.canvas, e.clientX, e.clientY);
   context.clearRect(0,0,context.canvas.width,context.canvas.height);
   
   drawText();
   
   context.save();
   context.globalCompositeOperation = selectElement.value;
   context.beginPath();
   context.arc(loc.x, loc.y, 100, 0, Math.PI*2, false);
   context.fillStyle='orange';
   context.stroke();
   context.fill();
   
   context.restore();
}

// Initialization............................................................

selectElement.selectedIndex = 3;
context.lineWidth = 0.5;
context.font = '128pt Comic-sans';
drawText();
