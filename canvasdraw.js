$(document).ready( function() {
  canvas.initialize();
  
  canvas.imageCanvas.addEventListener('click',
    function(event) {
      canvas.getPos(event);
  });
    
});
$(window).resize( function() {
  canvas.onResize( displayObject.getURLHash() );
});


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
  register: {},
  imageID: ""
  
};

canvas.initialize = function() {
    this.setCanvasDimensions();
    this.calcCanvasScale();
    this.setContext(this.imageCanvas);
    this.rect = this.setRect(this.imageCanvas);
    this.checkForNewImage( this.getId() );
    
    canvas.imageCanvas.addEventListener('mouseover', 
      function(event) {
        if(event.region) {
          //console.log('mouseover region', event.region);
        }
    });

    retrieveData();
};

canvas.setRegister = function( savedRegister ) {

  if(savedRegister !== undefined){

    canvas.register = savedRegister;
    canvas.reset(this.context);
    canvas.restorePrevious(this.getId());
    mapbuild.initialize();
  } else {
    //console.log("obj is undefined. setreg.");
  }

};

canvas.checkForNewImage = function(id){
  // check for page change. If previousId is not Id, then reset canvas.
  var pid ="p"+id;
  if ( canvas.previousId === 0 ) {
    canvas.previousId = id;
  }

  if(id !== canvas.previousId ) {
    canvas.reset(canvas.context);
  }
  for (var key in this.register ) {
    if( this.register.hasOwnProperty(key)){
      if(key === pid) {
        //console.log("key,pid",key, pid);
        canvas.restorePrevious(id);
      } else { console.log("key !== pid"); }
    }
  }

  if( ! this.register[pid] ){
    this.register[pid] = {"map":{}, "name":""};
    //console.log("newPid", this.register[pid]);
  } 

  canvas.previousId = id;

};

/*
  Clone the register object.
  search: "js object clone".
  alt: http://jsperf.com/cloning-an-object/2
*/
  
canvas.getRegisterPid = function(id){
  var pid = "p"+id;
  var regCopy = this.register[pid];
  return regCopy;
};

function clone( obj ) {
  var target = {};
  for(var i in obj) {
    if ( obj.hasOwnProperty(i) ) {
      target[i] = obj[i];
    }
  }
  return target;
}

Object.defineProperties(Object, {
  'extend': {
   'configurable': true,
   'enumerable': false,
   'value': function extend(what, wit) {
    var extObj, witKeys = Object.keys(wit);
 
    extObj = Object.keys(what).length ? Object.clone(what) : {};
 
    witKeys.forEach(function(key) {
     Object.defineProperty(extObj, key, Object.getOwnPropertyDescriptor(wit, key));
    });
 
    return extObj;
   },
   'writable': true
  },
  'clone': {
   'configurable': true,
   'enumerable': false,
   'value': function clone(obj) {
    return Object.extend({}, obj);
   },
   'writable': true
  }
 });

// END CLONE: 

canvas.restorePrevious = function(id) {
  var imageMaps = canvas.getRegisterPid(id);
  var keyCounts = new Array();
  if(imageMaps){
    //console.log("restore:id:", imageMaps);    
  }
  
  if (! imageMaps ) {
    //console.log( "image ", id ," has no shapes in the register.");
    return;
  }

  for( var key in imageMaps.map ) {
    if( imageMaps.map.hasOwnProperty(key) ) {
      //console.log("redraw: ", imageMaps.map[key].area.toString() );
      canvas.redraw( this.context, imageMaps.map[key].area, key );

      // restore the shapeCount.
      keysplit = key.split("-");
      if ( parseInt(keysplit[1]) > 0 ) {
        keyCounts.push(parseInt(keysplit[1]));
      }
    }
  }
  if(keyCounts.length > 0) {
    console.log(keyCounts);
    this.shapeCount = getMaxOfArray(keyCounts)+1;    
  } else {
    this.shapeCount = 1;
  }
};


canvas.rebuildCanvas = function(){
  canvas.reset(canvas.context);
  canvas.restorePrevious(this.getId());
};

canvas.onResize = function(id) {
  canvas.initialize();
  canvas.reset(this.context);
  canvas.restorePrevious(id);
  //console.log("resize:reg:", JSON.stringify(this.register));
};

canvas.redraw = function( context, mArray, imageId ) {
  var textX = 0, textY = 0;
  var arrLength = mArray.length; // should be 4, could be more
  
  //var reg = this.getRegisterPid(this.getId()); 
  var targetName = this.register[imageId.split("-")[0]].map[imageId].targetName;
  //console.log('targetName: ', targetName);
  var imageName = (targetName.trim() !== "") ? targetName : imageId ;
  for( var i = 0; i < arrLength; i++ ) {

    // copy coords to a new array, preserving the register array.
    coord = new Array(mArray[i][0],mArray[i][1]);
    coord = this.scaleCoordToView( coord );

    if (i === 0){
      context.fillStyle = "rgba(0,255,0,0.2)";
      context.beginPath();

    } 
      // draw
      context.lineTo(coord[0], coord[1] );

      // calc text position
      if( i === 0 || i === 2 ) {
        textX += coord[0]/2;
        textY += coord[1]/2;
      }

    // finish
    if (i === arrLength-1 ) {
      context.closePath();
      context.fill();
      // required: enable flag in chrome://flags for .addHitRegion 
      context.addHitRegion({'id': imageId, 'cursor': 'pointer'});

      // add name to shape
      context.font="14px Arial";
      context.fillStyle = "black";
      context.textAlign = 'center';
      context.fillText(imageName, textX, textY );
    } 
  }
};

canvas.reset = function(context) {

  context.clearRect(0,0, this.imageCanvas.width, this.imageCanvas.height);
  this.step = 0;
  this.shapeCount = 0;
};

canvas.getId = function() {
  //console.log(displayObject.getURLHash());
  return displayObject.getURLHash();
};


canvas.setCanvasDimensions = function() {

    //set canvas dimensions to same as responsively sized image dimensions
    this.image = document.getElementById('imageArea');
    this.imageCanvas = document.getElementById('imgCanvas');

    this.imageWidth = this.image.offsetWidth;
    this.imageHeight = this.image.offsetHeight;

    //console.log("image area dimensions: ", this.imageWidth,"/",this.imageHeight);

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
    //console.log("Scale: ",this.factorWidth, ":", this.factorHeight);
    //console.log("Dimen: ", this.imageWidth, this.imageHeight );
};

// convert for register
canvas.scaleCoordToReg = function(coordArr) {
  var i = coordArr;
  i[0] = Math.floor(i[0] / this.factorWidth );
  i[1] = Math.floor(i[1] / this.factorHeight);
  return i;
};

//convert value out from register
canvas.scaleCoordToView = function(coordArr) {
  var i = coordArr;
  i[0] = Math.floor(i[0] * this.factorWidth );
  i[1] = Math.floor(i[1] * this.factorHeight);
  return i;
};

canvas.setRect = function(element) {
  var rect = element.getBoundingClientRect();
  return rect; 
};

canvas.getPos = function (event){
  var rect = this.rect;
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  this.dropMarker(this.context, x, y);
};

canvas.dropMarker = function(context, x, y){
  var ctx = context;
  var polyFinished = false;

  //marker, first marker is green.
  ctx.fillStyle = (this.step === 0) ? "yellow" : "orange";
  ctx.fillRect(x-3,y-3,5,5);

  if(this.step === 0){
    ctx.beginPath();
  }

  polyFinished = this.updateRegister( [x, y] );

  if(this.step === 0 ){
    ctx.moveTo( x, y );
    this.step++;

  } else if (! polyFinished ) {
    ctx.lineTo( x, y );
    this.step++;

  } else if ( polyFinished ) {
    // ctx.closePath();
    ctx.fillStyle = "rgba(255,0,0,0.2)";
    ctx.stroke();
    ctx.fill();

    //experimental.
    ctx.addHitRegion({"id": this.imageId });

    this.step = 0;
    this.shapeCount++;
    saveData(this.register);
    this.rebuildCanvas();
  }
};


// returns true if shape completed, reset shapeCount.
canvas.updateRegister = function(coordArr) {
  var id        = this.getId();
  var pid       = this.pid;
  var imageId   = "";
  var coords    = coordArr;

  // Normalize the coordinates for the register.
  coords = this.scaleCoordToReg(coords);

  id = ( id === "" ) ? "01" : id;
  pid = this.pid = "p"+id;
  imageId = this.imageId = pid + "-" + this.shapeCount;

  if( ! this.register[pid] ){
    this.register[pid] = {"map":{}, "name":""};
  } 
  if( ! this.register[pid].map[imageId] ){
    this.register[pid].map[imageId] = {"area":[], "targetName":""};
  } 
  if(this.step === 0) {
    this.register[pid].map[imageId].area = [coords];
  }
  arr = this.register[pid].map[imageId].area[0];
  arr2 = this.register[pid].map[imageId].area[1];

  /*
    compare the first arr in imageId with coords.  
      clicks within 5px of origin will return true;
  */
  clickRegion = 5;
  if( arr2 && Math.abs( coords[0] - arr[0]) < clickRegion && Math.abs(coords[1] - arr[1]) < clickRegion ) {

    //console.log("RegNewShape: ", pid, JSON.stringify(this.register[pid].map) );
    
    return true;

    // trap 2nd clicks too close to the starting point. 
  } else if( this.step === 1 && Math.abs(arr[0] - coords[0]) > clickRegion && Math.abs(arr[1] - coords[1]) > clickRegion ) {
      this.register[pid].map[imageId].area.push(coords);

  } else if (this.step !== 0 ) {

      this.register[pid].map[imageId].area.push(coords);

  } 

  return false;

  // console.log("Image ID: ", id );
}; 

/*
  a helper function.
*/
var isEmpty = function(obj){
  if (Object.getOwnPropertyNames(obj).length > 0) return false || true;
};

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}
