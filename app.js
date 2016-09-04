// originates from a stack overflow question

var app = angular.module("app", []);
var socket = io();

app.controller('controller', ['$scope', function($scope) {
  $scope.drawType = "";
  $scope.setDrawtype = function(type){
    console.log(type)
    $scope.drawType = type;
  }
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
        ctx.drawImage(img,0,0);``
      });

      var imageLoader = document.getElementById('imageLoader');
      imageLoader.addEventListener('change', handleImage, false);
      
      // variable that decides if something should be drawn on mousemove
      var drawing = false;
      
      // the last coordinates before the current move
      var lastX;
      var lastY;
      
      element.bind('mousedown', function(event){
        
        lastX = event.offsetX;
        lastY = event.offsetY;
        
        // begins new line
        ctx.beginPath();
        
        drawing = true;
      });

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
          }


          var dt = canvas.toDataURL('image/jpeg');
          socket.emit('drawing', dt);

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

      function drawFree(lX, lY, cX, cY){
        // line from
        ctx.moveTo(lX,lY);
        // to
        ctx.lineTo(cX,cY);
        // color
        ctx.strokeStyle = "#fff";
        // draw it
        ctx.stroke();
      }
      
      function drawRect(startX, startY, currentX, currentY){
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


// app.directive("drawing", function(){
//   return {
//     restrict: "A",
//     link: function(scope, element){
//       var ctx = element[0].getContext('2d');

//       // variable that decides if something should be drawn on mousemove
//       var drawing = false;

//       // the last coordinates before the current move
//       var lastX;
//       var lastY;

//       element.bind('mousedown', function(event){
//         if(event.offsetX!==undefined){
//           lastX = event.offsetX;
//           lastY = event.offsetY;
//         } else { // Firefox compatibility
//           lastX = event.layerX - event.currentTarget.offsetLeft;
//           lastY = event.layerY - event.currentTarget.offsetTop;
//         }

//         // begins new line
//         ctx.beginPath();

//         drawing = true;
//       });
//       element.bind('mousemove', function(event){
//         if(drawing){
//           // get current mouse position
//           if(event.offsetX!==undefined){
//             currentX = event.offsetX;
//             currentY = event.offsetY;
//           } else {
//             currentX = event.layerX - event.currentTarget.offsetLeft;
//             currentY = event.layerY - event.currentTarget.offsetTop;
//           }

//           draw(lastX, lastY, currentX, currentY);

//           // set current coordinates to last one
//           lastX = currentX;
//           lastY = currentY;
//         }

//       });
//       element.bind('mouseup', function(event){
//         // stop drawing
//         drawing = false;
//       });

//       // canvas reset
//       function reset(){
//        element[0].width = element[0].width; 
//       }


//     }
//   };
// });






