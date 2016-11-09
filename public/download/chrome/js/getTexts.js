
  var intervalId = null;
  var projectId = null;
  var metrics = new Metrics("replace_this_text_with_you_API_key");
  var timeInterval = 0.2;  //number of minutes between readings. 0.2 is about 12 seconds
  var projectName;
  
chrome.runtime.onMessage.addListener( function (request, sender, callback) {
  //main program, that will be executed every time a button is pressed
  if(request.request === "start") {
    startMeasuring();
    projectId = request.project;
  } else if (request.request === "stop") {
    stopMeasuring();
    projectId = null;
    readText();
  } else if (request.request === "getId") {
    callback(projectId);
  } else if (request.request === "isMeasuring") {
    callback(intervalId !== null);
  }
  return true;
});

//methods inserted in the page!

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

  function startMeasuring(){
    if(!intervalId) {
      intervalId = setInterval(readText, timeInterval * 60 * 1000);
      window.onunload=function() {
        return "are you sure you want to leave? The system will stop recording.";
      };
    }
  };

  function stopMeasuring() {
    if(intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      window.onunload=null;
    }
  };
    
  function readText() {  
    if(!document.getElementById('myReallyFakeTextArea')) {
      injectScript( chrome.extension.getURL('/js/catchData.js'), 'body');
    }
    
    var texts = document.getElementsByTagName('textarea');
    var contentEditable = document.querySelectorAll('[contenteditable=true]');
    var docAutomaticText = document.getElementsByClassName('kix-lineview-content');
    var Tlen = texts.length;
    var CElen = contentEditable.length;    
    var DATlen = docAutomaticText.length;
    var i;
    var data = "";

    if (DATlen == 0) {
      docAutomaticText = document.getElementsByClassName('doc-container');
      DATlen = docAutomaticText.length;
    }

    for(i=0; i < Tlen; i++) {
      data += (texts[i].value.trim() + "\n");
    } 

    for (i=0; i < CElen; i++) {
      data += (contentEditable[i].innerText.trim() + "\n");
    }

    for (i=0; i < DATlen; i++) {
      data += (docAutomaticText[i].innerText.trim() + "\n");
    }
//used only for wordpress
    sleep(800).then(() => {
      var createdTA = document.getElementById('myReallyFakeTextArea');
      data += createdTA.value.trim();
      data = data.trim();
      if (data !== "") {
        metrics.analyze(data, projectId);
      }
    });
    
  }
