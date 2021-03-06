// preamble
// This file is required by the index.id file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

/*
a NOTE ON MORV
MORV - morv is an array in t2Recipes, but a value in t2 ingredients and t3.
When multiplying up, the multiplier looks at the recipe morv. Only if that morv is 'null' will the multiplier look any further.
If recipe morv = b, all ingredients will be 'b'
*/
window.onerror = function(message, source, lineno, colno, error) {
    u.ID('errors').innerText = message;
};

var fs = require("fs");
var u = require("./UtilityFunctions.js");
var d = require("./Dicts.js");
var OnLoad = require("./onLoad.js");
var addFood = require("./tabs/addFood.js");
var addRecipe = require("./tabs/addRecipe.js");
var addMenu = require("./tabs/addMenu.js");
var editMenu = require("./tabs/editMenu.js");
var shopping = require("./tabs/shopping.js");

OnLoad.OnLoad();

