var imagePath = "images/walk-thru-";
var singleImages = [10,11,13,14,15,20,21,22,26,27,28,29,40,41,42,44,46,48,49,51,54,55];
var circuitImages = ["01","02","04","07","09",12,19,24,25,35,36,38,44,47,50,52,53,"08","09",64];

var moveMap = {
  "p01":{"a1":"02"},
  "p02":{"a1":"04"},
  "p04":{"a2": 58, "a7":"05", "a9":"07"},
  "p05":{"a5": "06","a8":"04"},
  "p06":{"a8": "05"},
  "p07":{"a4":"09","a2":12,"a7":"04","a6":19},
  "p08":{"a4":10,"a2":"09","a6":63},
  "p09":{"a1":10,"a3":11,"a8":"07"},
  "p10":{"a6":11,"a8":"09"},
  "p11":{"a4":10,"a8":"09","a6":13},
  "p12":{"a1":13,"a2":14,"a3":15,"a6":19,"a7":"09"},
  "p13":{"a8":12,"a4":11,"a6":14},
  "p14":{"a8":12,"a4":13,"a6":15},
  "p15":{"a8":12,"a4":14,"a6":20},
  "p19":{"a8":"07","a4":20,"a1":21,"a2":24,"a7":20,"a5":23},
  "p20":{"a8":23,"a4":15,"a6":21},
  "p21":{"a8":23,"a4":20,"a6":22},
  "p22":{"a8":23,"a4":21,"a6":26},
  "p23":{"a4":"07","a6":25, "a1":20,"a2":22,"a3":23},
  "p24":{"a2":25,"a8":19},
  "p25":{"a1":27,"a2":28,"a3":29,"a4":26,"a6":35,"a7":22,"a8":24},
  "p26":{"a8":25,"a4":22,"a6":27},
  "p27":{"a8":25,"a4":26,"a6":28},
  "p28":{"a8":25,"a4":27,"a6":29},
  "p29":{"a8":25,"a4":28,"a6":40},
  "p35":{"a8":25,"a4":36,"a6":57, "a1":47,"a3":53},
  "p36":{"a4":38,"a8":58, "a2":44,"a3":47},
  "p38":{"a1":40,"a2":41,"a3":42, "a4":35,"a6":44},
  "p40":{"a4":29,"a6":41,"a8":38},
  "p41":{"a4":40,"a6":42,"a8":38},
  "p42":{"a4":41,"a6":44,"a8":38},
  "p44":{"a4":42,"a6":47},
  "p46":{"a8":47,"a4":44,"a6":48},
  "p47":{"a8":35,"a1":46,"a2":48,"a3":49,"a6":50,"a4":44},  
  "p48":{"a8":47,"a4":46,"a6":49},
  "p49":{"a8":47,"a4":48,"a6":51},
  "p50":{"a7":47,"a4":49,"a2":51,"a6":53},
  "p51":{"a4":49,"a6":54,"a8":50},
  "p52":{"a6":53,"a4":51,"a1":54,"a3":55},
  "p53":{"a6":"08","a1":54,"a3":55, "a8":35},
  "p54":{"a8":53,"a4":51,"a6":55},
  "p55":{"a8":53,"a4":54,"a6":"08"},
  "p57":{"a8":58,"a1":47,"a3":53, "a4":35},
  "p58":{"a8":"04","a2":57, "a4":36,"a1":47,"a3":53},
  "p63":{"a8":"04","a2":64}
  
  
}
// end moveMap

var imgInitialOpacity = "style=\"visibility:none\" ";


$(document).ready(function(){
  
  displayObject.loadFirstImage();
  
});


//
var displayObject = {
  
  // properties
  currentTrack: "circuit",
  imageClass: "class-00",
  currentImageID: "imgA",
  nextImageID: "imgB",
  previousImage: "",
  
  
  onImageLoad: function(){
    this.show({effect:"fade",easing:"swing",duration:"500"})

  },
  
  // toggle and return the nextImageID
  getNextImageID: function() {
    if(this.currentImageID === "imgA") {
      this.nextImageID = "imgB";
    }
    else {
      this.nextImageID = "imgA";
    }
    return this.nextImageID;
  },
  
  loadFirstImage: function() {
    
    if ( this.getURLHash() !== "" )
    {
      console.log(this.getURLHash());
      this.loadImage(this.getURLHash());
    } else {
    
      if ( $( "#imageArea" ).length ) {
    
        $("#imageArea").html( this.getImage("01") );
      
        // temporary testing
        this.showImageA();
      
      };
      
    }
  },
  
  getURLHash:function() {
    var pageURL = window.location.href;
    var imageIDarr = pageURL.split("#");
    var imageID;
    if (imageIDarr.length === 2) {
      imageID = imageIDarr[1];
      console.log(imageID);
             
    } else {
      console.log("image hash invalid, discard");
      imageID = "";
    }
    return imageID;
  },
  
  loadImage: function(imageNumber) {
    console.log("loadImage, imgNum: " + imageNumber);
    $("#imageArea").html( this.getImage(imageNumber) );
   // this.getURLHash();
    this.getNext();
    
  },
  
  // temporary testing  
  showImageA: function() {
    // console.log("c: " + this.currentImageID + ". iClass: " + this.imageClass);
    $("#" + this.currentImageID ).show({effect:"fade",easing:"swing",duration:"500" });
    this.getNext();
  },

  // this might be temporary, not essential
  getTrackChoice: function(num) {
    if( this.currentTrack === "circuit" ) {
      return circuitImages[num];
    }
    else {
      return singleImages[num];
    };
  },
  
  getImage: function(num) {  
    
    imgID = this.getNextImageID();
    newElement = "<img id=\""+imgID+"\" width=\"100%\" height=\"100%\" " +
                  
                  "class=\"" + this.getImageClass(num) + "\" src=\"" +
                  imagePath + num + ".jpg\" />";
    return newElement;
  },
  
  getImageClass: function(num){
    this.imageClass = "image-" + num; 
    return this.imageClass;
  },
  
  getNext: function() {
    // first clear all activated Buttons
    this.deactivateAllButtons();
    
    // get currentImage and parse info
    imageNum = this.imageClass.split("-");
    imageName = "p" + imageNum[1].toString();
    //console.log("Image Name is " + imageName.toString());
    
       
    // get map of options for currentImage
    moveOptions = moveMap[imageName];
    
    //console.log(moveOptions);
    
    //add .onClick on <a> to get the next imageURL
    for (var key in moveOptions) {
      if (moveOptions.hasOwnProperty(key)) {
        
        button = key.replace("a","#arrow-");
        nextImage = moveOptions[key];
        //nextImage = this.getImage(moveOptions[key]);
        this.activateButton(button,nextImage);
        // console.log("button: " + button, "nextImage: "+ nextImage);
      }
    }
    // activate buttons to options
    
  },

  
  activateButton: function (arrowID, image) {
    $(arrowID).addClass("activated");
    
    // add triggers/on statement, callback?
    $(arrowID).click( function() {
      // load the image, as triggered by click event...
       displayObject.loadImage(image);
       
       // temporary fix, need to set href after other elements are loaded.
       $(arrowID).attr("href","#"+image);
    });
    
    
  },
  
  deactivateAllButtons: function () {
   
     if ( $(".activated").length ) {
    
      for( var i=0;i<10;i++ ){
        var arrowID = "#arrow-"+i.toString();
       // $(arrowID).attr("href","#");
        $(arrowID).removeClass("activated");
        $(arrowID).off('click');
        
        
      };
      
    };
    
  },
  //end deactivate
  
};
