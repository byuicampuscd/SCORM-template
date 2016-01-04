/*jslint plusplus: true, browser: true, devel: true*/
/*global doSetValue, doGetValue, doCommit, doTerminate */

/**
 * Author: Joshua McKinney 1/4/2016
 * Scorm Suspend Data
 * Copyright: Brigham Young University - Idaho 2016
 * 
 * This module assumes that the SCORM APIwrapper has been loaded. Its designed to allow for an easy three function call interface 
 * that allows for data to persist from attempt to attempt but still allow for a score to be set each time. 
 * The completion_status or success_status is not set.
 * 
 * FUNCTIONS
 * getData() 
 *    return: string or object, if no data then an empty string
 *       Call this to get started. The data from the last session will be returned as string or object. 
 * setScore(score [, decimalPlaces]) 
 *    score: number between 0 and 1 inclusive, 
 *    decimalPlaces: optional integer 0 through 4, number of decimal places to keep when saving score DEAULT: 0
 *       Call this to set a score.
 * setData(data)
 *    data: a string or object to be saved to the lms.
 *       Call this in an unload function. It saves the data as SCORM suspendData and one SCORM Interaction then closes the SCORM connection.
 *       If the object has a custom toString function it will be used when saving the object as an interaction for the teacher to read eaiser. 
 *       Otherwise it will just use JSON.stringify
 *      
 * Options:
 *    setDebugIsOn: 
 *       DEFAULT: false
 *          pass a bool to console.log() the lms calls and errors or not. 
 *    setSaveInteractionIsOn: 
 *       DEFAULT: TRUE   
 *          pass a bool to turn on or off saving the same data as a SCORM interaction for the teacher to see. 
 */

var scormSuspendData = (function () {
   "use strict";
   var debugIsOn = false,
      saveInteractionIsOn = true;

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
    * Takes a number between 0 and 1 inclusive and saves the score to the LMS.
    */
   function setScore(score, digits) {
      digits = parseInt(digits, 10);
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
      //getVal calls doGetValue which starts SCORM if it hasent been;
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
    * This calls the toString on the object to be saved as a SCORM Interaction. 
    * The purpose is to convert the data from a JavaScript object to a format eaiser to read for non-techs (teachers).
    * If the function has not been changed or does not return a string it just uses the JSON string passed in made from JSON.stringify earlier.
    */
   function callToString(objIn, JSONIn) {
      var funGut = objIn.toString.toString(),
         standardToString = 'function toString() { [native code] }',
         stringOut = objIn.toString();

      //if no good then just use the json
      if (funGut === standardToString || typeof stringOut !== 'string') {
         stringOut = JSONIn;
      }

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
         throw "Data length to save to suspend data is greater than 64000.";
      }

      //save it
      setVal("cmi.suspend_data", dataString);

      //save it as an interaction as well
      if (saveInteractionIsOn) {
         if (dataType === 'object') {
            callToString(data, dataString);
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

   return {
      setScore: setScore,
      getData: getData,
      setData: setData,
      setDebugIsOn: setDebugIsOn,
      setSaveInteractionIsOn: setSaveInteractionIsOn
   };
}());
