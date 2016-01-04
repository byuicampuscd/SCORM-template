/*jslint plusplus: true, browser: true, devel: true */
/*global doSetValue, doGetValue, doCommit, doTerminate */

//this module assumes that the SCORM APIwrapper has been loaded.
//EXPLAIN what the required things are to do

var scormSuspendData = (function () {
   "use strict";
   var debugIsOn = false,
      saveInteractionIsOn = true,
      exturnalSimplifyJSON = JSON.stringify;

   function log(words) {
      if (debugIsOn) {
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
    * Saves data to interaction for teacher report
    */
   function saveInteraction(stringIn) {
      //Check length
      if (stringIn.length > 4000) {
         throw "Data to be saved in interaction is too long.";
      }

      //set type 
      setVal("cmi.interactions.0.id", "allData");
      setVal("cmi.interactions.0.type", "other");

      //set response
      setVal("cmi.interactions.0.learner_response", stringIn);
   }

   /**
    * This calls the user provided simplifyJSON function for less letters and to be eaiser to read for non-techs.
    * The default above is just JSON.stringify
    */
   function callSimplifyJSON(objIn) {
      var stringOut = exturnalSimplifyJSON(objIn);

      //save it
      saveInteraction(stringOut);
   }

   /**
    * Runs all the required SCORM functions to close
    */
   function close() {
      setVal("cmi.exit", "suspend");
      doCommit();
      doTerminate();
   }

   /**
    * Takes a string or an js obj to be JSON stringified and then saves it to the LMS.
    * Errors if the length of string is too long.
    */
   function setData(data) {
      var dataType = typeof data,
         dataString;

      if (data === null || dataType === 'undefined' || dataType !== 'string' || dataType !== 'object') {
         throw "Data to save is not a string or a JavaScript object.";
      }

      //convert if necessary
      if (dataType === 'object') {
         dataString = JSON.stringify(data);
      } else {
         dataString = data;
      }

      //check length
      if (dataString.length > 64000) {
         throw "Data to save length is greater than 64000.";
      }

      //save it
      setVal("cmi.suspend_data", dataString);

      if (saveInteractionIsOn) {
         if (dataType === 'object') {
            callSimplifyJSON(data);
         } else {
            saveInteraction(dataString);
         }
      }

      //close
      close();
   }

   function setDebugIsOn(debugIn) {
      debugIsOn = debugIn;
   }

   function setSaveInteractionIsOn(saveInteractionIn) {
      saveInteractionIsOn = saveInteractionIn;
   }

   /**
    * Sometimes JSON is not easy to read and is too long so this allows to set the function that is called to simplify it
    */
   function setSimplifyJSON(funIn) {
      var checkReturn;
      //check if they gave us a function
      if (typeof funIn !== 'function') {
         throw "SimplifyJSON function provided is not a function.";
      }

      //check if it returns a string
      checkReturn = funIn({
         cool: true
      });

      if (typeof checkReturn !== 'string') {
         throw "SimplifyJSON function does not return a string when a JavaScript object is passed in.";
      }

      //ok save it
      exturnalSimplifyJSON = funIn;
   }

   return {
      setScore: setScore,
      getData: getData,
      setData: setData,
      setDebugIsOn: setDebugIsOn,
      setSaveInteractionIsOn: setSaveInteractionIsOn,
      setSimplifyJSON: setSimplifyJSON
   };
}());
