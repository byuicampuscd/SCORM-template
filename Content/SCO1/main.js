/*jslint plusplus: true, browser: true, devel: true */
/*global scormSuspendData*/

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

function makeInterface() {
   //find their home
   "use strict";
   var home = document.getElementById('boxes');
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

function updateItems() {
   "use strict";
   items.forEach(function (item, counter) {
      item.checked = document.getElementById(item.id).checked;
   });
}

function calcScore() {
   "use strict";
   var correctCount = items.reduce(function (sum, item) {
      return item.checked ? sum + 1 : sum;
   });

   return correctCount / items.length;
}

function onUnload() {
   "use strict";
   updateItems();
   scormSuspendData.setScore(calcScore(), 2);
   scormSuspendData.setData(items);

   debugger;
}

function doOnload() {
   "use strict";
   //get data
   var dataIn = scormSuspendData.getData();

   //check if we got any
   if (dataIn !== '') {
      items = dataIn;
   }

   //set up the place
   makeInterface();

   window.onbeforeunload = onUnload;
}
