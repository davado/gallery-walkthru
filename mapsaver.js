/*
  Model - save to localStorage.
  OR
  Write to File
  OR
  Print to results screen.
*/

/*
  Register will be populated with pid->imageId shapes, 
  -> Save the register to file
    -> Match shapes to image-IDs
      -> Edit the register 'pids' [DONE]
        ->
      -> Delete register entries.
*/
$(document).ready( function() {
  setEditButton();
});

var editNames = function() {
  return "<button id='btn_edit_image_refs'>Edit Image Names</button>";
};

var setEditButton = function() {
  $('#exitLink').after( editNames ); 
  console.log("add EDIT button");
  addButton( $('#btn_edit_image_refs'), buildChangeTable, displayObject.getURLHash ); 
};

var addButton = function( obj, func, func2 ) {
  console.log("addButton called!");
  var btn = obj;
  
  btn.click( 
    function() {
      if (!func2) {
        func();        
      } else {
        func(func2());
      }
      console.log("addButton(button) clicked!");
      
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
  
  // changeKeys
  $('input').each(
    function() {
      var oldkey = $(this).attr('id');
      var newkey = this.value;

      changeKeys(id, oldkey , newkey);
    }
  );
  // save table.
  $.ajax({
      type: "POST",
      url: "./filesave.php",
      data: {regData: JSON.stringify(canvas.register)},
      success: function(data){
          alert('Register saved to file.');
          console.log(JSON.stringify(canvas.register));
      },
      error: function(e){
          console.log(e.message);
      }
  });
  
  
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

//source: http://stackoverflow.com/questions/4647817/javascript-object-rename-key
var changeKeys = function(id, oldkey, newkey) {
  console.log("changeKeys!", id, oldkey, newkey);
  
  if( oldkey !== newkey && newkey !== "" ){
    var a = canvas.register[id];
    
    if (newkey === 'delete') {
      delete a[oldkey]; 
    
    } else if( !a[newkey] ){
      a[newkey] = a[oldkey];
      delete a[oldkey];
      
    } else {
      console.log("error: Newkey already in register.");
    } 
    
    // TODO: redraw the canvas after changeKeys.
    // TODO: call up the table again with new values, maybe via refresh()
    // I REALLY NEED A MODEL->localStorage or php.
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
