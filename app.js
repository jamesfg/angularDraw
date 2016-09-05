// originates from a stack overflow question

var app = angular.module("app", []);
var socket = io();

app.controller('controller', ['$scope', function($scope) {
  $scope.drawType = "";
  $scope.setDrawtype = function(type){
    console.log(type);
    $scope.drawType = type;
  }
  $scope.currentUsers = [];
  socket.on('currentUsers', function(msg){
    console.log(msg);
    $scope.currentUsers.push(msg);
    $scope.$apply();
  });
  socket.on('disconnectedUser', function(msg){
    var index = $scope.currentUsers.indexOf(msg);
    console.log(index);
    if (index > -1) {
      $scope.currentUsers.splice(index, 1);
      $scope.$apply();
    }
  });
}])
.directive("drawing", function(){
  return {
    restrict: "A",
    link: function(scope, element, attrs){

      var ctx = element[0].getContext('2d');

      socket.on('drawing', function(msg){
        var img = new Image();
        img.src = msg;
        element[0].width = img.width;
        element[0].height = img.height;
        ctx.drawImage(img,0,0);
      });

      // deals with loading image
      var imageLoader = document.getElementById('imageLoader');
      imageLoader.addEventListener('change', handleImage, false);
      
      // variable that decides if something should be drawn on mousemove
      var drawing = false;
      
      // the last coordinates before the current move
      var lastX;
      var lastY;
      

      //MOUSE DOWN
      element.bind('mousedown', function(event){
        
        lastX = event.offsetX;
        lastY = event.offsetY;
        
        // begins new line
        ctx.beginPath();
        
        drawing = true;
      });

      //MOUSE MOVE
      element.bind('mousemove', function(event){
        if(drawing){

          // get current mouse position
          if(event.offsetX!==undefined){
            currentX = event.offsetX;
            currentY = event.offsetY;
          } else {
            currentX = event.layerX - event.currentTarget.offsetLeft;
            currentY = event.layerY - event.currentTarget.offsetTop;
          }

          if(attrs.drawtype === "free") {
            drawFree(lastX, lastY, currentX, currentY);

            // set current coordinates to last one
            lastX = currentX;
            lastY = currentY;
          } else if(attrs.drawtype === "rect") {
              drawRect(lastX, lastY, currentX, currentY);
          } else if(attrs.drawtype === "circle") {
              drawCircle(lastX, lastY, currentX, currentY);
          } else if(attrs.drawtype === "triangle") {
              drawTriangle(lastX, lastY, currentX, currentY);
          } else if(attrs.drawtype === "line") {
              drawLine(lastX, lastY, currentX, currentY);
          } else if(attrs.drawtype === "eraser") {
              drawEraser(lastX, lastY, currentX, currentY);
          }

          var dt = canvas.toDataURL('image/jpeg');
          socket.emit('drawing', dt);

        }
        
      });

      //MOUSE UP
      element.bind('mouseup', function(event){
        // stop drawing
        drawing = false;
      });
      
      //DRAW FUNCTIONS

      // canvas reset
      function reset(){
       element[0].width = element[0].width; 
      }

      function drawFree(lX, lY, cX, cY){
        ctx.moveTo(lX,lY);
        ctx.lineTo(cX,cY);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
      }
      
      function drawRect(startX, startY, currentX, currentY){
        reset();
        ctx.beginPath();
        var sizeX = currentX - startX;
        var sizeY = currentY - startY;
        ctx.rect(startX, startY, sizeX, sizeY);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      }

      function drawCircle(startX, startY, currentX, currentY) {
        reset();
        var centerX = lastX;
        var centerY = lastY;
        var radius = currentX - startX / 2;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      }

      function drawTriangle(startX, startY, currentX, currentY) {
        reset();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.lineTo(currentY, currentY);
        ctx.closePath();
         
        // the outline
        ctx.lineWidth = 10;
        // the fill color
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      }

      function drawLine(startX, startY, currentX, currentY){
        reset();
        ctx.moveTo(startX,startY);
        ctx.lineTo(currentX,currentY);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
      }

      function drawEraser(lX, lY, cX, cY){
        ctx.moveTo(lX,lY);
        ctx.lineTo(cX,cY);
        ctx.lineWidth = 3;
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      }

      //IMAGE HANDLERS
      function download() {
        var dt = canvas.toDataURL('image/jpeg');
        this.href = dt;
      };
      downloadLnk.addEventListener('click', download, false);

      function handleImage(e){
        var reader = new FileReader();
        reader.onload = function(event){
          var img = new Image();
          img.onload = function(){
            element[0].width = img.width;
            element[0].height = img.height;
            ctx.drawImage(img,0,0);
          }
          img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);     
      }
    }
  };
});