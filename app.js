// originates from a stack overflow question

var app = angular.module("app", []);

app.directive("drawing", function(){
  return {
    restrict: "A",
    link: function(scope, element){
      var ctx = element[0].getContext('2d');
      
      // variable that decides if something should be drawn on mousemove
      var drawing = false;
      
      // the last coordinates before the current move
      var centerX;
      var centerY;
      
      element.bind('mousedown', function(event){
        
        centerX = event.offsetX;
        centerY = event.offsetY;
        
        // begins new line
        ctx.beginPath();
        
        drawing = true;
      });

      element.bind('mousemove', function(event){
        if(drawing){
          // get current mouse position
          currentX = event.offsetX;
          currentY = event.offsetY;
          
          draw(centerX, centerY, currentX, currentY);
        }
        
      });

      element.bind('mouseup', function(event){
        // stop drawing
        drawing = false;
      });
        
      // canvas reset
      function reset(){
       element[0].width = element[0].width; 
      }
      
      function draw(startX, startY, currentX, currentY){
        reset();
        var sizeX = currentX - startX;
        var sizeY = currentY - startY;
        
        ctx.rect(startX, startY, sizeX, sizeY);
        ctx.lineWidth = 3;
        // color
        ctx.strokeStyle = '#fff';
        // draw it
        ctx.stroke();
      }
    }
  };
});

