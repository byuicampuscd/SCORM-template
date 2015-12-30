/*jslint plusplus: true, browser: true, devel: true */
/*global doInitialize, doGetValue, doSetValue, doCommit, doTerminate */
var items = [
   {
      id: "trueFalse0",
      text: "this is 0 true false"
   }, {
      id: "trueFalse1",
      text: "this is 1 true false"
   }, {
      id: "trueFalse2",
      text: "this is 2 true false"
   }];

function makeItems() {
   //find their home
   "use strict";
   var home = document.formIn;
   items.forEach(function (item) {
      //make it
      var box = document.createElement("input");
      box.setAttribute("id", item.id);
      box.setAttribute("name", item.id);
      box.setAttribute("type", "checkbox");
      box.checked = item.checked;

      //add it
      home.appendChild(box);
   });
}

function getPreviousAnswers() {
   "use strict";
   //get number
   var numInteractions = doGetValue("cmi.interactions._count"),
      id,
      data;
   if (numInteractions === "1") {
      id = doGetValue("cmi.interactions.0.id");
      data = doGetValue("cmi.interactions.0.learner_response");
      items = JSON.parse(data);
      /*
      for(var i = 0; i < numInteractions; ++i){
      for(var j = 0; j < items.length; ++j){
         if (items[j].id == doGetValue("cmi.interactions." + i + ".id")){
            items[j].response = doGetValue("cmi.interactions." + i + ".learner_response");
            j = items.length // don't loop anymore
         }
      }
      */

   }
   console.log("after get", items);
}

function setScore() {
   "use strict";
   var raw = 0,
      score;
   /*
   var max = 3;
   var min = 0;
   doSetValue("cmi.score.max",max);
   doSetValue("cmi.score.min",min);
   doSetValue("cmi.score.raw",raw)
   */

   items.forEach(function (item) {
      //console.log(item.response);
      if (item.checked) {
         ++raw;
      }
   });

   score = raw / items.length;
   console.log("score", doSetValue("cmi.score.scaled", score.toFixed(2)));
   console.log("progress_measure", doSetValue("cmi.progress_measure", score.toFixed(2)));
   //console.log(score);
   return score;
}

function getName() {
   "use strict";
   alert(doGetValue("cmi.learner_name"));
}

function saveIt(items) {
   "use strict";
   //get the number of interactions so far
   /*
   var numInteractions = doGetValue("cmi.interactions._count");
   console.log("num of Interactions:",numInteractions);
   */

   var valueToSet = JSON.stringify(items, null, 3);
   console.log("text length", valueToSet.length);
   console.log(valueToSet);
   //find location of old val -- could do this on set up

   //or make new one
   //make new one
   console.log("id", doSetValue("cmi.interactions.0.id", "allData"));
   //set type 
   console.log("type", doSetValue("cmi.interactions.0.type", "long-fill-in"));

   //set info
   console.log("description", doSetValue("cmi.interactions.0.description", "This is the JSON data for this SCORM package."));

   //set correct correct response
   //doSetValue("cmi.interactions." + counter + ".correct_responses.0.pattern", "true")

   //set response
   console.log("learner_response", doSetValue("cmi.interactions.0.learner_response", valueToSet));
   console.log("result", doSetValue("cmi.interactions.0.result", "correct"));

   console.log("result pull", doGetValue("cmi.interactions.0.learner_response"));
}

function saveAll() {
   "use strict";
   //save
   items.forEach(function (item, counter) {
      item.checked = document.getElementById(item.id).checked;
   });

   saveIt(items);

}

function setVal(command, text) {
   "use strict";
   console.log(command, doSetValue(command, text));
}

function onUnload() {
   "use strict";
   //saveAll();
   //setScore();
   //console.log("exit", doSetValue("cmi.exit", "normal"));

   //newStuff
   //score
   setVal("cmi.score.raw", "90");
   setVal("cmi.score.max", "100");
   setVal("cmi.score.min", "0");
   setVal("cmi.score.scaled", "0.9");

   //exit
   //setVal("cmi.completion_status", "completed");
   //setVal("cmi.suspend_data", "");
   setVal("cmi.exit", "suspend");

   doCommit();
   doTerminate();

   debugger;
}

function doOnload() {

   "use strict";
   doInitialize();
   //getPreviousAnswers();
   makeItems();

   //NEW STUFF
   //cus it might not save otherwise
   //setVal("cmi.exit", "suspend");
   //setVal("cmi.success_status", "unknown");
   //setVal("cmi.completion_status", "incomplete");
   //setVal("cmi.suspend_data", "");

   window.onbeforeunload = onUnload;

}
