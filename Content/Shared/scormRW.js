/*jslint plusplus: true, browser: true, devel: true */
/*global doSetValue, doGetValue*/
//this module assumes that the SCORM APIwrapper has been loaded.
var scormRW = (function () {
   "use strict";
   var debug = false;

   function log(words) {
      if (debug) {
         console.log(words);
      }
   }

   function getVal(command, text) {
      var val = doGetValue(command);
      log(command + ": " + val);

      return val;
   }

   function setVal(command, text) {
      var val = doSetValue(command, text);
      log(command + ": " + val);
   }

   /**
    * Takes a number between 0 and 1 inclusive and saves the score to the LMS
    */
   function setScore(score, digits) {
      digits = Math.floor(Number(digits));
      if (isNaN(digits) || digits > 4 || digits < 0) {
         digits = 0;
      }

      if (score > 1 || score < 0) {
         throw "Score is less than 0 or greater than 1";
      }

      //in range set score
      setVal("cmi.score.raw", (100 * score).toFixed(digits));
      setVal("cmi.score.max", "100");
      setVal("cmi.score.min", "0");
      setVal("cmi.score.scaled", score);
   }

   /**
    * It gets the data from the lms and parses it from JSON back to a JS object if it can.
    */
   function getData() {
      var val = getVal("cmi.suspend_data");
      try {
         val = JSON.parse(val);
      } catch (e) {
         log(e.message);
      }

      return val;
   }

   /**
    * Takes a string or an js obj to be JSON stringified and then saves it to the LMS.
    * checks length of string before it is sent
    */
   function setData(data) {
      var dataType = typeof data;

      if (data === null || dataType === 'undefined' || dataType !== 'string' || dataType !== 'object') {
         throw "Data to save is not a string or a JavaScript object.";
      }

      //convert if necessary
      if (dataType === 'object') {
         data = JSON.stringify(data);
      }

      //check length
      if (data.length > 64000) {
         throw "Data to save length is greater than 64000.";
      }

      //save it
      setVal("cmi.suspend_data", data);
   }

   function setDebug(debugIsOn) {
      debug = debugIsOn;
   }

   return {
      setScore: setScore,
      getData: getData,
      setData: setData,
      setDebug: setDebug
   };
}());
