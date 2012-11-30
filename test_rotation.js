var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    strokeStyle = 'black',
    fillStyle = 'rgba(255,0,0,0.3)';
    
    
// Initialization.................................
context.strokeStyle = strokeStyle;
context.fillStyle = fillStyle;
context.arc(200, 200, 50, 0, Math.PI*2, false);
context.stroke();
context.fill();

context.save();
context.translate(100, 100);
context.arc(200, 200, 50, 0, Math.PI*2, false);
context.stroke();
context.fill();
context.restore();