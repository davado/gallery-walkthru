/*
  Model - save to localStorage.
  OR
  Write to File [DONE]
  OR
  Print to results screen.
*/

/*
  Register will be populated with pid->imageId shapes,
  -> Save the register to file [DONE - php file on server]
    -> Match shapes to image-IDs [DONE]
      -> Edit the register 'pids' [DONE]
      -> Delete register entries.[DONE]
      -> RETRIEVE saved register json at canvas.initialize [DONE]
      -> On path close, redraw the canvas. [DONE]
      -> I REALLY NEED A MODEL
          ->localStorage
          -> or php. [DONE]
      -> JSON data -

canvas.register {
p04 {
  name: "topofstairs",
  map: {
    "p04-1" : {
      area: [[coordsArray]],
      targetname: "coneyislandgirls"
    },
    "p04-2" : {
      area:  [[coordsArray]] ,
      targetname: "summernatstent"
    },
  }
}

click on area, find targetname, find name, find id, goto URL+#id.

  GENERATE MAP->AREAS
  -> toggle canvas and map views
  -> mapreader js to convert JSON to areas
  -> Manually add and then rename all the shapes.

*/

$(document).ready( function() {
  setEditButton();
});

var somethingChanged = false;

var editNames = function() {
  return "<button id='btn_edit_image_refs'>Edit Image Names</button>";
};

var setEditButton = function() {
  $('#exitLink').after( editNames );
  addButton( $('#btn_edit_image_refs'), buildChangeTable, displayObject.getURLHash );
};

var addButton = function( obj, func, func2 ) {

  var btn = obj;
  btn.click(
    function() {
      if (!func2) {
        bool = func();
      } else {
        bool = func(func2());
      }
      if (bool) {
        this.remove();
        // "Edit" button
        $("#Edit").remove();
      }
    }
  );
};

var addEditButton = function( btnName, onClickFunc, elemToAppendTo ){

  var button  = '<button id="'+btnName+'">'+btnName+'</button>';
  if(elemToAppendTo) {

  } else {
    elemToAppendTo = "change_table";
  }
  $('#'+elemToAppendTo).after( button );

  if(document.getElementById(btnName)) {
    $('#'+btnName).click( function(){
      onClickFunc();
    } );
  } else {
    console.log("no button by id: ", btnName);
  }
};

var onSaveClick = function() {

  var pid = 'p'+ canvas.getId();
  // changeRegValues
  $('input').each(
    function() {
      var changedVal = false;
      var areaId = $(this).attr('id');
      var newTargetName = this.value;
      // changeRegValues returns true if register was changed
      changedVal = changeRegValues(pid, areaId , newTargetName);
      if(changedVal){
        somethingChanged = true;
      }
    }
  );

  if(somethingChanged) {
    saveData(canvas.register);
    canvas.rebuildCanvas();
  }

  onCancelClick();
};

var onCancelClick = function() {

  // remove the buttons
  $("#save").remove();
  $("#cancel").remove();
  $("#change_table").remove();

  // restore the click to edit button.
  addEditButton("Edit", mapbuild.toggleCanvas, "exitLink");
  setEditButton();
};

var saveData = function(obj) {
  somethingChange = false;
  $.ajax({
      type: "POST",
      url: "./filesave.php",
      data: {regData: JSON.stringify(obj)},
      success: function(data){
          console.log('Register saved to server file.');
          console.log(JSON.stringify(obj));
      },
      error: function(e){
          console.log(e.message);
      }
  });

};

var retrieveData = function() {
  $.ajax({
    dataType: "json",
    type: "GET",
    url: "./filesave.php",
    success: function(data, obj){
      obj = data;
      // return val is async
      // returning the jsXHR obj fails, returns undefined.
      canvas.setRegister(obj);
    },
    error: function(e) {
      console.log(e.message);
    }
  });
};


//source: http://stackoverflow.com/questions/4647817/javascript-object-rename-key
var changeRegValues = function(pid, areaId, newTargetName) {
/*
  TODO: need to check if newTargetName is unique amongst all names.
*/
  var somethingChanged = true;
  if( newTargetName.trim() !== "" ){
    var a = canvas.register[pid];

    if (newTargetName === 'delete') {
      delete a.map[areaId];
      console.log(areaId, "->", newTargetName);
      // change the regPidName
    } else if(areaId === "pidName" ) {
      if( newTargetName !== a.name ) {
        a.name = newTargetName;
      } else {
        return false;
      }

      // don't copy, just rename the areaId.targetName
    } else if( newTargetName !== a.map[areaId].targetName ){
      a.map[areaId].targetName = newTargetName;
      console.log(areaId, "->" , newTargetName);

    } else {
      console.log("\"" + newTargetName + "\" already in register.");
      somethingChanged = false;
    }

    return somethingChanged;
  }
};

var buildChangeTable = function(id) {

  var rows = buildRows( id );
  if( rows === "" || rows === undefined || rows === null) {
    return false;
  } else {
    // build table skeleton.
    $('#imgCanvas').after( '<table id="change_table"></table>');
    $('#change_table').append('<thead><tr><td>Old Ref</td><td>New Ref</td></tr></thead><tbody id="change_body"></tbody>');

    // insert the cells for table body.
    if(document.getElementById('change_body') ) {
      $('#change_body').append( rows );
    } else {
      console.log('table>tbody#change_body not ready');
    }
    addEditButton('save', onSaveClick, "change_table");
    addEditButton('cancel', onCancelClick, "change_table");

    $('input').each( function(index, element) {
      $(element).keyup(function(event) {
        if( event.keyCode == 13){
          onSaveClick();
          console.log("Enter pressed");
        }
      });
    });
    return true;
  }
};



var buildRows = function(id) {
  console.log("buildRows: id", id);
  var pid = "p"+id;
  var oldName = "";
  var inputText = "";
  var rows = "";
  var registerPidMap;
  var pageNameValue;
  if(canvas.register[pid]) {
    registerPidMap = canvas.register["p"+id].map;
    pageNameValue = canvas.register["p"+id].name;
  }
  if ( registerPidMap === undefined ) {
    return;

  } else {
    //name-row :: value='"+pageNameValue+"'
    rows = "<tr><td>Name | "+pageNameValue+"</td><td>";
    rows += "<input type='text' name='pidName' id='pidName' >";
    rows += "</td></tr>";

    for(var imageId in registerPidMap) {
      oldName = "<td>" + imageId + " | <span class=\"emphasis\">" + registerPidMap[imageId].targetName + "</span></td>";
      inputText = "<td>" + "<input type='text' name='"+imageId+"' id='"+imageId+"'>"+"</td>";
      rows += "<tr>"+oldName+inputText+"</tr>";
    }
    return rows;
  }
};
