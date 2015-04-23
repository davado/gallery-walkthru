$(document).ready( function() {
  canvas.initialize();
  //var ctx = canvas.getContext;
  //var can = canvas.imageCanvas;
  
  canvas.imageCanvas.addEventListener('click',
    function(event) {
      canvas.getPos(event);
  });
  
//  console.log("can is: "); console.log(can); 
  //console.log("ctx is: "); console.log(ctx); 
  

/*
  console.log("global: ",imageWidth, " - object:", 
    canvas.imageWidth, " - window:", window.imageWidth);
*/
  
});

/* *
 * TODO: On window resize, recalculate the factor using .calcCanvasScale();
 *  Then .reset() and .redraw() the canvas
 */

/* *
 * TODO: Add scaleIn and scaleOut for coords going in and out of .register
 */  

// $(window).resize(event, ); //https://api.jquery.com/resize/


var canvas = {
  
  //properties
  iWidth: 1024, // actual width of images
  iHeight: 683,
  imageWidth: 0, // calculated display width of images in viewport
  imageHeight: 0,
  factorWidth: 1, // calculate scaling factor for each axis.
  factorHeight: 1, 
  image: {}, 
  imageCanvas: {}, // canvas object
  context: {}, // context of imageCanvas
  rect: {}, // helper to calculate position of click in window, rel to imageCanvas
  step: 0, // vertice count for each shape.
  shapeCount: 0, // number of shapes completed on this imageId.
  pid: "p", // page id.
  previousId: 0,
  tempReg:{},
  register: {}
  
};

canvas.initialize = function() {
    this.setCanvasDimensions();
    this.calcCanvasScale();
    this.setContext(this.imageCanvas);
    this.rect = this.setRect(this.imageCanvas);
    this.checkForNewImage( this.getId );
    
    //console.log(this.imageCanvas);
};

canvas.checkForNewImage = function(id){
  // check for page change. If previousId is not Id, then reset canvas.
    
  console.log( "previous: ", canvas.previousId );


  if ( canvas.previousId === 0 ) { // === 0 || canvas.previousId === "") {
    canvas.previousId = id;
  }

  if(id !== canvas.previousId ) {
    canvas.reset(canvas.context);
  }
  for (var key in this.register ) {
    if( this.register.hasOwnProperty(key)){
      canvas.restorePrevious(id);
    }
  }

  canvas.previousId = id;

};
canvas.restorePrevious = function(id) {
  
  var imageMaps = this.register["p"+id];
  if (! imageMaps ) {
    console.log( "image ", id ," not in register");
    return;
  }
  
  
  // console.log("imageMaps: ", JSON.stringify(imageMaps) );

  // imageMaps[key] refers to [[],[],[],[]]
  for( var key in imageMaps ) {
    if( imageMaps.hasOwnProperty(key) ) {
      
      // console.log("key: " , key, JSON.stringify(imageMaps[key]) );
      
      
      // restore the shapeCount.
      this.shapeCount++;
      canvas.redraw( this.context, imageMaps[key] );
    }
  }
}

canvas.onResize = function() {
  this.calcCanvasScale;
}

canvas.redraw = function( context, mArray ) {
  // just redraw the shapes.
  var arrLength = mArray.length; // should be 4, could be more
  console.log('redrawing ', mArray);
  
  for( var i = 0; i < arrLength; i++ ) {
    
    // start
    if (i === 0){
      context.fillStyle = "rgba(0,255,0,0.2)";
      context.beginPath();
      
    } 
    // draw
      context.lineTo(mArray[i][0], mArray[i][1] );

    // finish
    if (i === arrLength-1 ) {
      context.closePath();
      context.fill();
    } 
  }
  
  //console.log("image: ", JSON.stringify(image));
}

canvas.reset = function(context) {
  context.clearRect(0,0, this.imageCanvas.width, this.imageCanvas.height);
  
  this.step = 0;
  this.shapeCount = 0;
  // this.redraw();
};

canvas.getId = function() {
  return displayObject.getURLHash();
}


canvas.setCanvasDimensions = function() {

    //set canvas dimensions to same as responsively sized image dimensions
    this.image = document.getElementById('imageArea');
    this.imageCanvas = document.getElementById('imgCanvas');
        
    this.imageWidth = this.image.offsetWidth;    
    this.imageHeight = this.image.offsetHeight;
    
    console.log("image area dimensions: ", this.imageWidth,"/",this.imageHeight);
    
    this.imageCanvas.height = this.imageHeight;
    this.imageCanvas.width = this.imageWidth;
    
};

canvas.setContext = function (element) {
  if(element.getContext){
    this.context = element.getContext('2d');    
  }
};

canvas.getContext = function() {
  //returns an Object OR undefined.
  return this.context; 
};

canvas.calcCanvasScale = function() {
    // factor = small < 1, big = > 1
    this.factorWidth = this.imageWidth/this.iWidth;
    this.factorHeight = this.imageHeight/this.iHeight;
    console.log(this.factorWidth, ":", this.factorHeight);
};

// convert for register
canvas.scaleIn = function(value, axis) {
  var i = value;
  i = (axis = "x") ? i / this.factorWidth : i / this.factorHeight;
  i = Math.floor(i);
  return i;
}

//convert value out from register
canvas.scaleOut = function(value, axis) {
  var i = value;
  i = (axis = "x") ? i * this.factorWidth : i * this.factorHeight;
  i = Math.floor(i);
  return i;
}

canvas.setRect = function(element) {
  var rect = element.getBoundingClientRect();
  return rect; 
}

canvas.getPos = function (event){
  var rect = this.rect;
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  this.dropMarker(this.context, x, y);
};

// DROP MARKER
canvas.dropMarker = function(context, x, y){
  var ctx = context;
  var polyFinished = false;
  
  //marker, first marker is green.
  ctx.fillStyle = (this.step === 0) ? "green" : "blue";
  ctx.fillRect(x-3,y-3,5,5);
  
  if(this.step === 0){
    ctx.beginPath();
  }

   /* *
    * if the click x/y are in canvas.register{pageID:{picID:{x,y}}}, 
    * and this.step === 3, do context.stroke() and/or fill();
    */
  
  polyFinished = this.updateRegister(x, y);
  
  if(this.step === 0 ){
    ctx.moveTo( x, y );
    this.step++;
  
  } else if (! polyFinished ) {
    ctx.lineTo( x, y );
    this.step++;
    
  } else if ( polyFinished ) {
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,0,0,0.2)";
    ctx.fill();
    this.step = 0;
    this.shapeCount++;
  }
  
  //console.log("Mark: ",x,y);
  
}


// returns true if shape completed, reset shapeCount.
canvas.updateRegister = function(x,y) {
  var id        = this.getId();
  var pid       = this.pid;
  var imageId   = "";
  var coords    = [x, y];
//  console.log("id",id,", pid,", pid,", imageId,", this.imageId,", coords, ", coords);
    
  id = ( id === "" ) ? "01" : id;
  pid = this.pid = "p"+id;
  imageId = pid + "-" + this.shapeCount;
  
  if( ! this.register[pid] ){
    this.register[pid] = {};
  } 
  if( ! this.register[pid][imageId] ){
    this.register[pid][imageId] = [];
  } 
  if(this.step === 0) {
    //... or should this be a string literal?
    this.register[pid][imageId] = [coords];
  }
  
  if(this.step === 3 && "not finished" ) {
    // rebuild the canvas from register.
  }
    
  /*
    compare the first arr in imageId with coords.  
      clicks within 3px of origin will return true;
  */
  arr = this.register[pid][imageId][0];
  arr2 = this.register[pid][imageId][1];
  if( arr2 && Math.abs( coords[0] - arr[0]) < 3 && Math.abs(coords[1] - arr[1]) < 3 ) {

    console.log( imageId, JSON.stringify(this.register) );
    return true;

  } else if (this.step !== 0 ) {
      //... or should this be a string literal?
      this.register[pid][imageId].push(coords);
  }

  return false;
  
  // console.log("Image ID: ", id );
} 

/*
  a helper function.
*/
var isEmpty = function(obj){
  if (Object.getOwnPropertyNames(obj).length > 0) return false || true;
}



/*
OUTPUT WILL BE FOR HTML MAP/AREA
<area shape="poly" coord="x1,y1,x2,y2,x3,y3,x4,y4" href="#id-number"/>
shape - poly: 
coord - x1, y1, x2, y2...  
*/

/*
  OUTPUT x/y coordinates must be calc'd with Math(floor(x*factorW)) before entering in the coordinates Register.
  or else we do a before and after scaling-factor register.
*/

var dump = {};


