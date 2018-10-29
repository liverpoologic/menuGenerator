var fs = require("fs");
var tagsInput = require('tags-input');
var remote = require('electron').remote;

module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config;

   function Icon(iconName, parent) {
      return CreateEl('i').className(`fas fa-${iconName}`).parent(parent).end();
   }

   /** function to clear table, leaving a given number of header rows
    * @param {string} tableID html ID of the table to clear
    * @param {number} numberOfRowsToKeep how many rows should be left untouched (can be 0 to clear whole table)*/
   function ClearTable(tableID, numberOfRowsToKeep) {
      let table = ID(tableID);
      for (let i = table.rows.length; i > numberOfRowsToKeep; i--) {
         table.deleteRow(i - 1);
      }
   }

   function ClearVals(els) {
      Object.values(els).forEach(el => {
         switch (el.type) {
            case 'text':
            case 'textarea':
            case 'date':
            case 'number':
               el.value = "";
               break;
            case 'select-one':
               el.value = '_default';
               break;
            default:
               console.log('not clearing for type:');
               console.log(el.type);
               console.log(el);
               break;
         }
      });
      return;
   }
   /** function to create listeners which allow user to edit cells (currently used in the admin tables)
    * @param {string} cellID the ID of the cell you want to create a listener on
    * @param {string} inputType this can be "text", "number" or "select" and indicates the kind of input field required
    * @param {string} keyID the ID of the cell that contains the key for that object (e.g. cellID for 'allspice')
    * @param {number} dictID the ID of the dictionary being changed
    * @param {string} property the property of the dictionary object being changed (e.g. shop). Use array with multiple properties for nested props
    * @param {object} dropdownSource the object which is the source of the required dropdown. Do not include unless inputType = "select" or 'tags'.
    * @param {boolean} dropdownKeys 'true' means the dropdown should be the keys of the source object, 'false' means the dropdown should just print the contents of the object
    */
   function CreateEditCellListeners(cellID, inputType, keyID, dictID, property, dropdownSource, dropdownKeys) {

      function CreateButton(cell, inputType) {
         let btn = CreateEl('button').parent(cell).id(`save_${cell.id}`).className('insideCellBtn').end();
         Icon('check', btn);
         return btn;
      }

      function CreateInput(cell, inputType, oldValue, dropdownSource, dropdownKeys) {
         let elType = inputType === 'select' ? 'select' : 'input';
         let el = CreateEl(elType).type(inputType).parent(cell).id(`input_${cell.id}`).style('width:75%').value(oldValue).className('insideCellElement').end();

         switch (inputType) {
            case 'select':
               CreateDropdown(el.id, dropdownSource, dropdownKeys, undefined, undefined, oldValue);
               break;
            case 'tags':
               tagsInput(el, dropdownSource, "populate", ",", oldValue);
               break;
         }
         return el;
      }

      function getProp(item, property) {
         if (typeof property === 'string') return item[property];
         var ret = item;
         property.forEach(prop => {
            ret = ret[prop];
         });
         return ret;
      }

      let cell = ID(cellID);
      cell.addEventListener("click", function editCell() {
         cell.innerHTML = "";
         let key = ID(keyID).innerText;
         let item = d.getDict(dictID)[key];
         let oldValue = getProp(item, property);

         let input = CreateInput(cell, inputType, oldValue, dropdownSource, dropdownKeys);
         let button = CreateButton(cell, inputType);

         cell.className = "tableInput";
         cell.removeEventListener("click", editCell);

         if (inputType === "tags") {

            button.addEventListener("click", function saveNewCell() {
               let newValue = input.value.split(",");
               d.getDict(dictID).addAllergens(key, newValue);
               d.write();
               c.write();
            });

         } else {
            button.addEventListener("click", function saveNewCell() {
               let newValue = input.value;
               if (typeof property === 'string') {
                  item[property] = newValue;
               } else if (property.length === 2) {
                  item[property[0][property[1]]] = newValue;
               } else if (property.length === 3) {
                  item[property[0][property[1][property[2]]]] = newValue;
               }
               d.write();
            });
         }

      });
   }


   /** function to create a dropdown from a given object. Note that if keys=true, the items will be sorted.
    * @param {string} elementID the ID of the element you want to add the dropdown to (this should already be of type "select")
    * @param {object} source the object which is the source of the required dropdown. Do not include unless inputType = "select"
    * @param {boolean} keys 'true' means the dropdown should be the keys of the source object, 'false' means the dropdown should just print the contents of the object
    * @param {array} valueOpts an array containing strings which should be assigned as values to the corresponding item in the source
    * @param {array} _default a string which is the value and display name of the default option if nothing is currently selected.
    */
   function CreateDropdown(elementID, source, keys, valueOpts, _default, currentVal) {
      var select = ID(elementID);
      var populated = false;
      if (select != null) {
         if (select.value != "") {
            populated = true;
            var selectValue = select.value;
         }
      }

      //if currentVal is specified then have that as the value
      if (currentVal) {
         populated = true;
         var selectValue = currentVal
      }

      if (select != null) select.innerHTML = "";
      var options = keys ? GetKeysExFns(source).sort() : source;
      if (!valueOpts) {
         valueOpts = options;
      }
      if (_default) {
         CreateEl('option').parent(select).textContent(_default).value('_default').end();
      }
      options.forEach((option, i) => {
         let displayOpt = option;
         let valueOpt = valueOpts[i];
         let el = CreateEl('option').parent(select).textContent(displayOpt).value(valueOpt).end();
         if (populated) {
            if (selectValue === valueOpt) {
               el.selected = true;
            }
         }
      });
   }
   /**Create element with dot notation: CreateEl().id('id').type('text').end() */
   function CreateEl(elType) {
      var props = ['type', 'textContent', 'parent', 'id', 'className', 'innerText', 'innerHTML', 'display', 'value', 'style', 'placeholder'];
      var ret = {
         end: function() {
            var v = this.vals; //access this.vals object
            var el = document.createElement(elType);
            if (v.parent) v.parent.appendChild(el);
            props.forEach(pr => {
               if (typeof v[pr] !== 'undefined') el[pr] = v[pr];
            });
            return el;
         },
         vals: {}
      };
      props.forEach(pr => {
         ret[pr] = function(val) {
            this.vals[pr] = val;
            return this;
         };
      });
      return ret;
   }
   /** creates an element of type [elementType] and attaches it to element [parent]
    * @param {string} elementType the type of element you want to create (e.g. "div")
    * @param {object} parent the element you want to attach the new element to (i.e. parent.appendChild)
    */
   function CreateElement(elementType, parent, id, className, innerText, display) {
      let newElement = document.createElement(elementType);
      if (parent !== "") parent.appendChild(newElement);
      Html(newElement, id, className, undefined, undefined, innerText);
      if (display !== undefined && display !== "") {
         newElement.style.display = display;
      }
      return newElement;
   }

   /** creates a row with given innerhtmls - use arrays for cell width, cell type etc.
    * @param {string} tableID
    * @param {string} cellType type of cell (th or td)
    * @param {array} cellInnerHtml array with strings to put in the inner html of each cell from left to right
    * @param {array} cellIDs  array of strings to assign as IDs for each cell from left to right
    * @param {array} cellWidth array of numbers to assign as the cellWidth for each cell from left to right
    * @param {string} widthUnit can be either "%" or "px" . Cannot be blank if cellWidth is populated.
    */
   function CreateRow(tableID, cellType, cellInnerHtml, cellIDs, cellWidth, widthUnit, index, classes) {
      // EXAMPLE u.CreateRow("t1table","th",["cell1text","cell2text],["id1","id2"],[40,60],"%")
      if (typeof cellWidth === "undefined") {
         cellWidth = "";
         widthUnit = "";
      }
      let Table = ID(tableID);
      let newRow = index ? Table.insertRow(index) : Table.insertRow();
      for (var i = 0; i < cellInnerHtml.length; i++) {
         let newCell = document.createElement(cellType);
         Html(newCell, "", "", `width:${cellWidth[i]}${widthUnit}`, cellInnerHtml[i]);
         if (typeof cellIDs === "object") {
            newCell.id = cellIDs[i];
         }
         if (typeof classes === 'object') {
            newCell.className = classes[i]
         }
         newRow.appendChild(newCell);
      }
      return newRow;
   }

   /**compares food type to identify if food[a].type is before or after food[b].type. If types are the same, identifies if food[a] is before or after food[b] in the alphabet. Returns 1 if a is after b, and -1 if a is before b. Returns 0 if a=b.
    * @param {string} a the key for food a e.g. oranges
    * @param {string} b the key for food b
    */
   function CompareFoodType(a, b) {

      if (typeof d.foods[a] === "undefined") {
         console.log(`${a} needs to be added to the food dictionary`);
         return "error, view console";
      }
      if (typeof d.foods[b] === "undefined") {
         console.log(`${b} needs to be added to the food dictionary`);
         return "error, view console";
      }
      let foodtypea = d.foods[a].foodType;
      let foodtypeb = d.foods[b].foodType;

      let comparison = 0;
      if (foodtypea > foodtypeb) {
         comparison = 1;
      } else if (foodtypea < foodtypeb) {
         comparison = -1;
      } else if (a > b) {
         comparison = 1;
      } else if (a < b) {
         comparison = -1;
      }
      return comparison; // 1 means a is after b, -1 means a should be before b
   }

   function Compare(a, b) {
      if (a > b) return 1;
      else if (b > a) return -1;
      else return 0;
   }

   /**changes g to kg/ ml to l, and sets decimal places. Puts brackets around qsmall. Returns array ["(qsmall), qlarge, unit]
    *
    * @param {number} quantitySmall the small quantity for this ingredient
    * @param {number} quantityLarge the multiplied up quantity for this ingredient
    * @param {string} unit the unit for this ingredient
    */
   function DisplayIngredient(quantitySmall, quantityLarge, unit) {
      let x = `(${quantitySmall})`;
      let y = quantityLarge;
      let z = unit;
      if (quantitySmall === null) {
         let x = 1;
      }

      if (unit === "g" && quantityLarge > 1000) {
         x = `(${quantitySmall / 1000})`;
         y = parseFloat((quantityLarge / 1000).toFixed(2));
         z = "kg";
      } else if (unit === "ml" && quantityLarge > 1000) {
         x = `(${quantitySmall / 1000})`;
         y = parseFloat((quantityLarge / 1000).toFixed(2));
         z = "l";
      } else if (unit === "null" || unit === "tsp" || unit === "loaves" || unit === "bunches") {
         y = quantityLarge.toFixed(0);
      } else if (quantityLarge > 100) {
         y = Math.round(quantityLarge / 5) * 5;
      } else if (Number.isInteger(quantityLarge)) {
         y = quantityLarge.toFixed(0);
      } else {
         y = parseFloat(quantityLarge.toPrecision(2));
      }
      return [x, y, z];
   }

   /**convert date into 'formal' - e.g 1st, 2nd, 3rd
    * @param {number} date the number you need to convert (from 1 to 31)  */
   function GetFormalDate(date) {
      let x = date.getDate();
      let st = [1, 21, 31];
      let nd = [2, 22];
      let rd = [3, 23];
      if (st.indexOf(x) > -1) {
         return `${x}st`;
      } else if (nd.indexOf(x) > -1) {
         return `${x}nd`;
      } else if (rd.indexOf(x) > -1) {
         return `${x}rd`;
      } else {
         return `${x}th`;
      }
   }
   /** get number from end of a cell ID
    * @param {string} input the id which you want to extract the number from
    */
   function GetNumber(input) {
      console.log(input);
      return parseInt(input.match(/\d+$/)[0]);
   }
   /** hide element with given ID(s)
    * @param {object} ids either a single ID or an array ["id1","id2"] of the html DOM objects you want to hide
    */
   function HideElements(ids) {
      ShowElements(ids, "none");
   }
   /** set attributes of a given html object: id, classname, style, innerHTML and innerText. Any empty strings "" or 'undefined' values will be ignored
    * @param {object} variable this is the variable name of the htmlDOM object
    * @param {string} id the ID you want the object to have
    * @param {string} className the className for the object
    * @param {string} style text that will go in the html 'style' tag (e.g. font-size:10px)
    * @param {string} innerHTML the innerHTML for the object
    * @param {string} innerText the innerText of the object
    * @param {string} value the value of the object (just for 'inputs')
    */
   function Html(variable, id, className, style, innerHTML, innerText, value) {
      if (variable === "") {
         console.log("variable was blank");
      } else {
         if (id !== undefined && id !== "") {
            variable.id = id;
         }
         if (className !== undefined && className !== "") {
            variable.className = className;
         }
         if (style !== undefined && style !== "") {
            variable.style = style;
         }
         if (innerHTML !== undefined && innerHTML !== "") {
            variable.innerHTML = innerHTML;
         }
         if (innerText !== undefined && innerText !== "") {
            variable.innerText = innerText;
         }
         if (value !== undefined && value !== "") {
            variable.value = value;
         }
      }
   }

   /** shortens 'document.getElementById' to just ID
    * @param {string} elementID the ID to be located
    */
   function ID(elementID) {
      return document.getElementById(elementID);
   }
   /** opens a horizontal tab (i.e. main navigation)
    * @param {string} tabName the name of the tab you want to open */
   function OpenHTab(tabid) {
      let tabcontent = document.getElementsByClassName("htabcontent");
      for (let i = 0; i < tabcontent.length; i++) {
         tabcontent[i].style.display = "none";
      }
      let tablinks = document.getElementsByClassName("htab_btns");
      for (let i = 0; i < tablinks.length; i++) {
         tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      ID(`${tabid}_tab_content`).style.display = "inline-block";
      ID(`${tabid}_tab_btn`).className += " active";
   }
   /** opens a vertical tab (i.e. admin table tabs)
    * @param {string} tabName the id of the tab you want to open */
   function OpenVTab(vTabId) {
      let tabcontent = document.getElementsByClassName("vtabcontent");
      for (let i = 0; i < tabcontent.length; i++) {
         tabcontent[i].style.display = "none";
      }
      let tablinks = document.getElementsByClassName("vtab_btns");
      for (let i = 0; i < tablinks.length; i++) {
         tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      ID(`${vTabId}_tab_content`).style.display = "inline-block";
      ID(`${vTabId}_tab_btn`).className += " active";
   }

   /**renames the 'key' of a dictionary object (e.g. change food name)
    * @param {*} oldKeyName the old key name
    * @param {*} newKeyName the new key name
    * @param {*} location the location of the key (e.g. d.foods)
    */
   function RenameKey(oldKeyName, newKeyName, location) {
      if (oldKeyName !== newKeyName) {
         Object.defineProperty(location, newKeyName, Object.getOwnPropertyDescriptor(location, oldKeyName));
         delete location[oldKeyName];
      }
   }
   /**sets values for an array of html elements, with the form: ([[id,newValue],[id,newValue]...]) */
   function SetValues(input) {
      for (let i = 0; i < input.length; i++) {
         // console.log(`setting value of ${input[i][0]} as ${input[i][1]}`)
         ID(input[i][0]).value = input[i][1];
      }
   }
   /** show multiple elements wih the form ([id1,id2,id3],display) */
   function ShowElements(ids, display) {
      if (typeof ids === "string") {
         ID(ids).style.display = display;
      } else {
         for (let i = 0; i < ids.length; i++) {
            ID(ids[i]).style.display = display;
         }
      }
   }
   /**
    * returns the keys of an object excluding any methods
    * @param {object} obj
    */
   function GetKeysExFns(obj) {
      return Object.keys(obj).filter(x => typeof obj[x] !== "function");
   }

   /** swap two elements of an array
    * @param {object} array the array in questions
    * @param {number} value1 the id of the first value
    * @param {number} value2 the if of the second value
    */
   function Swap(array, value1, value2) {
      let temp = array[value1];
      array[value1] = array[value2];
      array[value2] = temp;
   }

   /**
    * get the date in the form MMM yy (e.g. Jun 18)
    * @param {date} date
    */
   function GetMMMyy(date) {
      var ret = date.toLocaleString("en-uk", {
         month: "short",
         year: "2-digit"
      });
      return ret;
   }

   function SaveBackup() {
      console.log('savebackup');
      console.log(remote.getGlobal('sharedObject').fileNames);
      var dictFileName = remote.getGlobal('sharedObject').fileNames.backup.d;
      fs.writeFileSync(`./resources/${dictFileName}`, JSON.stringify(d), {
         encoding: "utf8"
      });

      var configFileName = remote.getGlobal('sharedObject').fileNames.backup.config;
      fs.writeFileSync(`./resources/${configFileName}`, JSON.stringify(c), {
         encoding: "utf8"
      });

      alert('saved');
   }

   function RestoreFromBackup() {
      d.clear();
      d.read('backup');
      d.write();

      c.clear();
      c.read('backup');
      c.write();

      alert('restored');
   }

   function CalculateQLarge(menuTitle, mealID, recipe, ingredient) {
      var menu = d.menus[menuTitle];
      var meal = menu.meals[mealID];
      var morv = recipe.morv !== 'b' ? recipe.morv : ingredient.morv;
      var multiplier;
      switch (morv) {
         case 'sp':
            multiplier = recipe.specialCount ? recipe.specialCount : 0
            break;
         case 'v':
            multiplier = menu.vegetarians + (meal.modifier ? meal.modifier.vegetarians : 0);
            break;
         case 'b':
            multiplier = menu.vegetarians + menu.meateaters + (meal.modifier ? (meal.modifier.vegetarians + meal.modifier.meateaters) : 0);
            break;
         case 'm':
            multiplier = menu.meateaters + (meal.modifier ? meal.modifier.meateaters : 0);
            break;
         default:
            console.log('error in CalculateQLarge function');
            break;
      }

      var serves = d.recipes[recipe.recipeTitle].serves;

      return (ingredient.quantity / serves) * multiplier;

   }

   function Br(parent) {
      CreateEl('br').parent(parent).end();
   }

   return {
      Icon: Icon,
      Br: Br,
      CalculateQLarge: CalculateQLarge,
      ClearTable: ClearTable, // function to clear table, leaving a given number of header rows
      ClearVals: ClearVals,
      CreateDropdown: CreateDropdown, // create dropdown options
      CreateEditCellListeners: CreateEditCellListeners, // creates listener to enable 'edit cell' (currently used in admin tables)
      CreateEl: CreateEl, // creates an element using dot notation
      CreateElement: CreateElement, // creates an element and attaches it to a given parent and gives it an id
      CreateRow: CreateRow, // creates a row with given properties
      Compare: Compare, //compares two numeric values
      CompareFoodType: CompareFoodType, // compares food type to identify if fooda.type is before or after foodb.type
      DisplayIngredient: DisplayIngredient, // changes g to kg when relevant, sets decimal places
      GetFormalDate: GetFormalDate, // convert date into 'formal' - e.g 1st, 2nd, 3rd
      GetKeysExFns: GetKeysExFns, //gets keys excluding any functions of a given object
      GetMMMyy: GetMMMyy, // convert date into MMM yy (Jun 18)
      GetNumber: GetNumber, // returns the number in a string (ignores letters)
      HideElements: HideElements, // hide element with given ID
      Html: Html, // set attributes of an html object: id, classname, style, innerHTML and innerText
      ID: ID, // changes 'document.getElementById' to just ID
      OpenHTab: OpenHTab, // opens a horizontal tab (i.e. main navigation)
      OpenVTab: OpenVTab, // opens a vertical tab (i.e. admin table tabs
      RenameKey: RenameKey, // renames the 'key' of a dictionary object (e.g. change food name)
      RestoreFromBackup: RestoreFromBackup, //restores Dicts from backup
      SaveBackup: SaveBackup, //saves a backup of Dicts
      SetValues: SetValues, // sets values for an array of html elements
      ShowElements: ShowElements, // show multiple elements with a given display
      Swap: Swap, // swaps two elements of an array
   };
}