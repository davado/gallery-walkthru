/*
Generate the image maps
*/


var mapbuild = {
  reg: {},

};

mapbuild.initialize = function() {

  mapbuild.pageMap = document.getElementById("pageMap");
  mapbuild.addmap(displayObject.getURLHash());
  addEditButton("Edit", mapbuild.toggleCanvas, "exitLink");
};

mapbuild.toggleCanvas = function() {
  if (canvas.imageCanvas.style.display === "none") {
    canvas.imageCanvas.style.display = "block";
    document.getElementById("Edit").innerHTML = "Hide";
  } else {
    canvas.imageCanvas.style.display = "none";
    document.getElementById("Edit").innerHTML = "Edit";
  }
};



mapbuild.getReg = function() {
  this.reg = canvas.register;
};

mapbuild.buildTag = function(elementId, targetId, coordsStr ) {

  var element  = 'id="'+elementId+'" ';
  element     += 'shape="poly" ';
  element     += 'coords="'+coordsStr+'" ';
  element     += 'href="#'+targetId+'" ';
  element     += 'alt="image-'+ targetId +'" ';
  return '<area ' + element + "/>";

};

mapbuild.getKeyByValue = function(obj, value) {
  for (var prop in obj) {
    if( obj.hasOwnProperty(prop) ) {
      if(obj[prop].name === value.toString() ) {
        // console.log("o.p.name:", prop, obj[prop].name, value.toString());
        return prop;
      }
    }
  }
};
mapbuild.rebuildMap = function(id) {
  $("area").remove();
  mapbuild.addmap(id);
};

mapbuild.addmap = function(id) {
  this.getReg();
  var pid = "p" + id;
  if (this.reg[pid].hasOwnProperty('map')) {

    //disable the canvas for this page.
    canvas.imageCanvas.style.display = "none";
    console.log("map available");
    for(var areaId in this.reg[pid].map) {

      if( this.reg[pid].map[areaId].targetName !== undefined ) {
        coords = this.reg[pid].map[areaId].area;
        coordsScaled = [];
        for (var i = 0; i < coords.length; i++) {
          coord = new Array(coords[i][0], coords[i][1]);
          coord = canvas.scaleCoordToView(coord);
          coordsScaled.push(coord);
        }
        coordsScaled.toString();

        newTargetName = this.reg[pid].map[areaId].targetName;
        console.log("ntn:", newTargetName, "areaId:", areaId, "pid:", pid);
        if(newTargetName === undefined) {
          alert("Problem, no targetName, see; ntn:", newTargetName, "areaId:", areaId, "pid:", pid);
        }
        targetId = this.getKeyByValue(this.reg, newTargetName );

        if( targetId !== undefined ) {
          targetId = targetId.replace("p", "");
          $("#pageMap").append( this.buildTag(areaId, targetId, coordsScaled.toString() ) );
          displayObject.activateButton("#"+areaId, targetId );
        }

      } else {
        console.log("this reg undefined", this.reg[pid]);
      }
      // get the newTargetName, if newTargetName,
      // for each this.reg[pid] get this.reg[pid][newTargetName],

        /*
      create area tag,
      add #areaId,
      create coord.toString(),
      displayObject.activateButton
      */
    }
  } else { console.log( this.reg[pid], "Empty");}

};