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
        func();
      } else {
        func(func2());
      }
      this.remove();
    }
  );
};

var addEditButton = function( btnName, onClickFunc ){
  
  var button  = '<button id="'+btnName+'">'+btnName+'</button>';

  $('#change_table').after( button );  

  if(document.getElementById(btnName)) {
    $('#'+btnName).click( function(){
      onClickFunc();
    } );    
  } else {
    console.log("no button by id: ", btnName);
  }
};

var onSaveClick = function() {
  
  var id = 'p'+ displayObject.getURLHash();
  var somethingChanged = false;
  // changeKeys
  $('input').each(
    function() {
      var changedVal = false;
      var oldkey = $(this).attr('id');
      var newkey = this.value;
      // changeKeys returns true if register was changed
      changedVal = changeKeys(id, oldkey , newkey);
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
  $('button').each(function(){
    this.remove();
  });
  $("#change_table").remove();

  // restore the click to edit button.
  setEditButton();
};

var saveData = function(obj) {
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
    url: "http://lkw.com.au/filesave.php",
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
var changeKeys = function(id, oldkey, newkey) {

  var somethingChanged = true;
  if( oldkey !== newkey && newkey !== "" ){
    var a = canvas.register[id];
    
    if (newkey === 'delete') {
      delete a[oldkey]; 
    
    } else if( !a[newkey] ){
      a[newkey] = a[oldkey];
      delete a[oldkey];
      
    } else {
      console.log("error: Newkey already in register.");
      somethingChanged = false;
    } 
    return somethingChanged;
    
  }
};

var buildChangeTable = function(id) {

  // build table skeleton. 
  $('#imgCanvas').after( '<table id="change_table"></table>');
  $('#change_table').append('<thead><tr><td>Old Ref</td><td>New Ref</td></tr></thead><tbody id="change_body"></tbody>');

  // insert the cells for table body.
  if(document.getElementById('change_body') ) {
    $('#change_body').append( buildRows( id ));    
  } else {
    console.log('table>tbody#change_body not ready');
  }
  addEditButton('save', onSaveClick);
  addEditButton('cancel', onCancelClick);
  
  $('input').each( function(index, element) {
    $(element).keyup(function(event) {
      if( event.keyCode == 13){
        onSaveClick();
        console.log("Enter pressed");
      }
    });
  });

};



var buildRows = function(pageId) {
  console.log("buildRows: pageId", pageId);
  var oldName = "";
  var inputText = "";  
  var rows = "";
  
  var shapeReg = canvas.register["p"+pageId];
  console.log(JSON.stringify(shapeReg));
  
  for(var key in shapeReg) {
    console.log("oldName:", key);
    //make plain <td>
    oldName = "<td>" + key + "</td>";
    
    // make input <td>
    inputText = "<td>" + "<input type='text' name='"+key+"' id='"+key+"'>"+"</td>";
    
    //wrap in <tr> and append to rows
    rows += "<tr>"+oldName+inputText+"</tr>";
  }
  return rows;
};
