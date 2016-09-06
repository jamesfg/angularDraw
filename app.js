// originates from a stack overflow question

var app = angular.module("app", []);
var socket = io();

app.controller('controller', ['$scope', function($scope) {
  $scope.drawType = "free";

  // sets tool type
  $('#freeDrawType').button('toggle');
  $scope.setDrawtype = function(type){
    toggleToolbar();
    $scope.drawType = type;
  }

  // gets current users object
  $scope.currentUsers = [];
  socket.on('userEvent', function(msg){
    $scope.currentUsers = msg;
    $scope.$apply();
  });

  // toggles bootstrap toolbar buttons
  function toggleToolbar() {
    var options = [
      '#circleDrawType',
      '#triangleDrawType',
      '#rectDrawType',
      '#lineDrawType',
      '#freeDrawType',
      '#eraserDrawType',
    ]; 
    options.map(function(option){ 
      if($(option)[0].className.includes('active')){
        $(option).button('toggle');
      }
    });
    
  }
}])
.directive("drawing", function(){
  return {
    restrict: "A",
    link: function(scope, element, attrs){

      var ctx = element[0].getContext('2d');
      // At least Safari 3+: "[object HTMLElementConstructor]"
      var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;


      // keeps last image to allow drawing without resetting cavnas
      var lastImage = new Image();

      // deals with loading image
      var imageLoader = document.getElementById('imageLoader');
      imageLoader.addEventListener('change', handleImage, false);
      
      // variable that decides if something should be drawn on mousemove
      var drawing = false;
      
      // the last coordinates before the current move
      var lastX;
      var lastY;

      // draws latest socket message
      socket.on('drawing', function(msg){
        var img = new Image();
        img.src = msg;

        // fix for safari since it can't access image until loaded
        if(isSafari){
          img.onload = function(){
            element[0].width = this.width;
            element[0].height = this.height;
            ctx.drawImage(img,0,0);
          }
        } else {
            element[0].width = img.width;
            element[0].height = img.height;
            ctx.drawImage(img,0,0);
        }



      });
      

      //MOUSE DOWN
      element.bind('mousedown', function(event){
        
        lastX = event.offsetX;
        lastY = event.offsetY;

        saveLastDrawing();
        
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
              lastX = currentX;
              lastY = currentY;
          }

          var dt = canvas.toDataURL('image/png');
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
        ctx.drawImage(lastImage,0,0);
      }

      function drawFree(startX, startY, currentX, currentY){
        ctx.moveTo(startX,startY);
        ctx.lineTo(currentX,currentY);
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
      }

      function drawCircle(startX, startY, currentX, currentY) {
        reset();
        var centerX = lastX;
        var centerY = lastY;
        var radius = currentX - startX / 2;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }

      function drawTriangle(startX, startY, currentX, currentY) {
        reset();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.lineTo(currentY, currentY);
        ctx.closePath();
        ctx.lineWidth = 10;
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

      function drawEraser(startX, startY, currentX, currentY){
        ctx.moveTo(startX,startY);
        ctx.lineTo(currentX,currentY);
        ctx.lineWidth = 3;
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1.0)";
        ctx.stroke();
      }

      //IMAGE HANDLERS
      function download() {
        var dt = canvas.toDataURL('image/jpg');
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

      // saves last image to allow drawing without resetting canvas
      function saveLastDrawing() {
        lastImage.src = canvas.toDataURL('image/png');
      }
    }
  };
});