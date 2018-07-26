var d = require("./Dicts.js")
var fs = require("fs")
var e = d.Dict[4]
var tagsInput = require('tags-input')

/** function to clear table, leaving a given number of header rows
 * @param {string} tableID html ID of the table to clear
 * @param {number} numberOfRowsToKeep how many rows should be left untouched (can be 0 to clear whole table)*/
function ClearTable(tableID, numberOfRowsToKeep) {
    let table = ID(tableID)
    for (let i = table.rows.length; i > numberOfRowsToKeep; i--) {
        table.deleteRow(i - 1);
    }
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
        return CreateEl('button').parent(cell).id(`save_${cell.id}`).className('insideCellBtn').innerHTML('✔').end();
    }

    function CreateInput(cell, inputType, oldValue, dropdownSource, dropdownKeys) {
        let elType = inputType === 'select' ? 'select' : 'input'
        if(inputType = 'tags') console.log(oldValue)
        let el = CreateEl(elType).type(inputType).parent(cell).id(`input_${cell.id}`).value(oldValue).end();

        switch (inputType) {
            case 'select':
                CreateDropdown(el.id, dropdownSource, dropdownKeys,undefined,oldValue)
                break;
            case 'tags':
                tagsInput(el, dropdownSource, "populate", ",", oldValue)
                break;
        }
        return el;
    }

    function getProp(item,property){
        if (typeof property === 'string') return item[property]
        var ret = item
        property.forEach( prop =>{
            ret = ret[prop]
        })
        return ret;
    }

    let cell = ID(cellID)
    cell.addEventListener("click", function editCell() {
        cell.innerHTML = ""
        let key = ID(keyID).innerText
        let item =  d.Dict[dictID][key]
        let oldValue = getProp(item,property)

        let input = CreateInput(cell, inputType, oldValue, dropdownSource, dropdownKeys)
        let button = CreateButton(cell, inputType)

        cell.className = "tableInput"
        cell.removeEventListener("click", editCell)

        if (inputType === "tags") {

            button.addEventListener("click", function saveNewCell() {
                let newValue = input.value.split(",")
                d.Dict[dictID].addAllergens(key, newValue)
                WriteDict(dictID, 4)
            })

        }
        else {
            button.addEventListener("click", function saveNewCell() {
                let newValue = input.value
                if(typeof property === 'string'){item[property] = newValue;}
                else if(property.length === 2){item[property[0][property[1]]] = newValue;}
                else if(property.length === 3){item[property[0][property[1][property[2]]]] = newValue;}
                WriteDict(dictID)
            })
        }

    })
}


/** function to create a dropdown from a given object. Note that if keys=true, the items will be sorted.
 * @param {string} elementID the ID of the element you want to add the dropdown to (this should already be of type "select")
 * @param {object} source the object which is the source of the required dropdown. Do not include unless inputType = "select"
 * @param {boolean} keys 'true' means the dropdown should be the keys of the source object, 'false' means the dropdown should just print the contents of the object
 * @param {array} valueOpts an array containing strings which should be assigned as values to the corresponding item in the source
 * @param {array} _default a string which is the value and display name of the default option if nothing is currently selected.
 */
function CreateDropdown(elementID, source, keys, valueOpts,_default) {
    var select = ID(elementID);
    var populated = false
    if(select != null){
        if(select.value != "") populated = true
    }
    var defaultValueOpt = populated ? select.value : _default

    var defaultDisplayOpt = populated ? Array.prototype.filter.call(select.children,x => x.value === defaultValueOpt)[0].text : _default

    if (select != null) select.innerHTML = ""
    var options = keys ? GetKeysExFns(source).sort() : source;
    if (!valueOpts) {
        valueOpts = options;
    }
    if(_default) {
        CreateEl('option').parent(select).textContent(defaultDisplayOpt).value(defaultValueOpt).end();
    }
    options.forEach((option, i) => {
        let displayOpt = option;
        let valueOpt = valueOpts[i];
        let el = CreateEl('option').parent(select).textContent(displayOpt).value(valueOpt).end();
    });
}
/**Create element with dot notation: CreateEl().id('id').type('text').end() */
function CreateEl(elType) {
    var props = ['type','textContent', 'parent', 'id', 'className', 'innerText', 'innerHTML', 'display', 'value', 'style']
    var ret = {
        end: function () {
            var v = this.vals //access this.vals object
            var el = document.createElement(elType);
            if (v.parent) v.parent.appendChild(el);
            props.forEach(pr => {
                if (v[pr]) el[pr] = v[pr]
            });
            return el;
        },
        vals: {}
    };
    props.forEach(pr => {
        ret[pr] = function (val) { this.vals[pr] = val; return this; }
    })
    return ret;
}
/** creates an element of type [elementType] and attaches it to element [parent]
 * @param {string} elementType the type of element you want to create (e.g. "div")
 * @param {object} parent the element you want to attach the new element to (i.e. parent.appendChild)
 */
function CreateElement(elementType, parent, id, className, innerText, display) {
    let newElement = document.createElement(elementType)
    if (parent !== "") parent.appendChild(newElement)
    Html(newElement, id, className, undefined, undefined, innerText)
    if (display !== undefined && display !== "") { newElement.style.display = display };
    return newElement
}
/** creates a row with given innerhtmls - use arrays for cell width, cell type etc.
 * @param {string} tableID 
 * @param {string} cellType type of cell (th or td)
 * @param {array} cellInnerHtml array with strings to put in the inner html of each cell from left to right 
 * @param {array} cellIDs  array of strings to assign as IDs for each cell from left to right
 * @param {array} cellWidth array of numbers to assign as the cellWidth for each cell from left to right
 * @param {string} widthUnit can be either "%" or "px" . Cannot be blank if cellWidth is populated.
 */
function CreateRow(tableID, cellType, cellInnerHtml, cellIDs, cellWidth, widthUnit,index) {
    // EXAMPLE u.CreateRow("t1table","th",["cell1text","cell2text],["id1","id2"],[40,60],"%")
    if (typeof cellWidth === "undefined") { cellWidth = "", widthUnit = "" }
    let Table = ID(tableID)
    let newRow = index ? Table.insertRow(index) : Table.insertRow()
    for (var i = 0; i < cellInnerHtml.length; i++) {
        let newCell = document.createElement(cellType);
        Html(newCell, "", "", `width:${cellWidth[i]}${widthUnit}`, cellInnerHtml[i])
        if (typeof cellIDs === "object") { newCell.id = cellIDs[i] }
        newRow.appendChild(newCell);
    }
    return newRow
}
/**compares food type to identify if food[a].type is before or after food[b].type. If types are the same, identifies if food[a] is before or after food[b] in the alphabet. Returns 1 if a is after b, and -1 if a is before b. Returns 0 if a=b.
 * @param {string} a the key for food a e.g. oranges
 * @param {string} b the key for food b
 */
function CompareFoodType(a, b) {

    if (typeof d.Dict[1][a] === "undefined") { console.log(`${a} needs to be added to the food dictionary`); return "error, view console" }
    if (typeof d.Dict[1][b] === "undefined") { console.log(`${b} needs to be added to the food dictionary`); return "error, view console" }
    let foodtypea = d.Dict[1][a].foodType
    let foodtypeb = d.Dict[1][b].foodType

    let comparison = 0;
    if (foodtypea > foodtypeb) {
        comparison = 1;
    } else if (foodtypea < foodtypeb) {
        comparison = -1;
    }
    else if (a > b) {
        comparison = 1
    }
    else if (a < b) {
        comparison = -1
    }
    return comparison; // 1 means a is after b, -1 means a should be before b
}
function Compare(a, b) {
    if (a > b) return 1
    else if (b > a) return -1
    else return 0
}
/**compares meal type to identify if meal[a] is before or after meal[b] (including date and meal type). Returns 1 if a is after b, and -1 if a is before b. Returns 0 if a=b.
 * @param {string} a the key for meal a 
 * @param {string} b the key for meal b
 */
function CompareMeal(a, b) {
    let aDate = new Date(a.date)
    let bDate = new Date(b.date)
    let comparison = 0;
    if (aDate > bDate) {
        comparison = 1;
    } else if (aDate < bDate) {
        comparison = -1;
    }
    else if (e.mealTypeEnum.indexOf(a.mealType) > e.mealTypeEnum.indexOf(b.mealType)) {
        comparison = 1
    }
    else if (e.mealTypeEnum.indexOf(a.mealType) < e.mealTypeEnum.indexOf(b.mealType)) {
        comparison = -1
    }
    return comparison; // 1 means a is after b, -1 means a should be before b
}
/**compares recipe to identify if recipe[a] should be displayed before or after recipe[b] (depending on recipe type and the morv). Returns 1 if a should be after b, and -1 if a should be before b. Returns 0 if a=b.
 * @param {string} a the key for meal a 
 * @param {string} b the key for meal b
 */
function CompareRecipe(a, b) {
    let comparison = 0;
    if (e.recipeTypeEnum.indexOf(a.recipeType) > e.recipeTypeEnum.indexOf(b.recipeType)) {
        comparison = 1
    }
    else if (e.recipeTypeEnum.indexOf(a.recipeType) < e.recipeTypeEnum.indexOf(b.recipeType)) {
        comparison = -1
    }
    else if (e.morvEnum.indexOf(a.morv) > e.morvEnum.indexOf(b.morv)) {
        comparison = 1
    }
    else if (e.morvEnum.indexOf(a.morv) < e.morvEnum.indexOf(b.morv)) {
        comparison = -1
    }
    else if (a.recipeTitle > b.recipeTitle) {
        comparison = 1
    }
    else if (a.recipeTitle < b.recipeTitle) {
        comparison = -1
    }
    return comparison; // 1 means a is after b, -1 means a should be before b
}
/**changes g to kg/ ml to l, and sets decimal places. Puts brackets around qsmall. Returns array ["(qsmall), qlarge, unit]
 * 
 * @param {number} quantitySmall the small quantity for this ingredient
 * @param {number} quantityLarge the multiplied up quantity for this ingredient
 * @param {string} unit the unit for this ingredient
 */
function DisplayIngredient(quantitySmall, quantityLarge, unit) {
    let x = `(${quantitySmall})`;
    let y = quantityLarge
    let z = unit
    if (quantitySmall === null) { let x = 1 }

    if (unit === "g" && quantityLarge > 1000) {
        x = `(${quantitySmall / 1000})`;
        y = parseFloat((quantityLarge / 1000).toFixed(2))
        z = "kg"
    }
    else if (unit === "ml" && quantityLarge > 1000) {
        x = `(${quantitySmall / 1000})`;
        y = parseFloat((quantityLarge / 1000).toFixed(2))
        z = "l"
    }
    else if (unit === "null" || unit === "tsp" || unit === "loaves" || unit === "bunches") {
        y = quantityLarge.toFixed(0);
    }
    else if (quantityLarge > 100) {
        y = Math.round(quantityLarge / 5) * 5
    }
    else if (Number.isInteger(quantityLarge)) {
        y = quantityLarge.toFixed(0);
    }
    else {
        y = parseFloat(quantityLarge.toPrecision(2))
    }
    return [x, y, z]
}

/**convert date into 'formal' - e.g 1st, 2nd, 3rd
 * @param {number} date the number you need to convert (from 1 to 31)  */
function GetFormalDate(date) {
    let x = date.getDate()
    let st = [1, 21, 31]
    let nd = [2, 22]
    let rd = [3, 23]
    if (st.indexOf(x) > -1) { return `${x}st` }
    else if (nd.indexOf(x) > -1) { return `${x}nd` }
    else if (rd.indexOf(x) > -1) { return `${x}rd` }
    else { return `${x}th` }
}
/** get number from end of a cell ID
 * @param {string} input the id which you want to extract the number from
 */
function GetNumber(input) {
    return parseInt(input.match(/\d+$/)[0]);
}
/** hide element with given ID(s)
 * @param {object} ids either a single ID or an array ["id1","id2"] of the html DOM objects you want to hide
 */
function HideElements(ids) {
    ShowElements(ids, "none")
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
        console.log("variable was blank")
    }
    else {
        if (id !== undefined && id !== "") { variable.id = id } else { };
        if (className !== undefined && className !== "") { variable.className = className };
        if (style !== undefined && style !== "") { variable.style = style };
        if (innerHTML !== undefined && innerHTML !== "") { variable.innerHTML = innerHTML };
        if (innerText !== undefined && innerText !== "") { variable.innerText = innerText };
        if (value !== undefined && value !== "") { variable.value = value };
    }
}

/** shortens 'document.getElementById' to just ID
 * @param {string} elementID the ID to be located
 */
function ID(elementID) {
    return document.getElementById(elementID)
}
/** opens a horizontal tab (i.e. main navigation)
 * @param {string} tabName the name of the tab you want to open */
function OpenHTab(tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("htabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("htablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    ID(tabName).style.display = "block";
    ID(`${tabName}TabBtn`).className += " active";
}
/** opens a vertical tab (i.e. admin table tabs)
 * @param {string} tabName the name of the tab you want to open */
function OpenVTab(tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("vtabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("vtablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    ID(tabName).style.display = "block";
    ID(`${tabName}TabBtn`).className += " active";
}
/** reads in 'Dict' from Dict.json */
function ReadDict(fileName) {
    let input = JSON.parse(fs.readFileSync("./resources/"+fileName, { encoding: "utf8" }))
    for (let i = 1; i < input.length; i++) {
        for (var thing in input[i]) {
            if (input[i].hasOwnProperty(thing)) {
                d.Dict[i][thing] = input[i][thing]
            }
        }
    }
}
/**renames the 'key' of a dictionary object (e.g. change food name)
 * @param {*} oldKeyName the old key name
 * @param {*} newKeyName the new key name
 * @param {*} location the location of the key (e.g. Dict[1])
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
        ID(input[i][0]).value = input[i][1]
    }
}
/** show multiple elements wih the form ([id1,id2,id3],display) */
function ShowElements(ids, display) {
    if (typeof ids === "string") {
        ID(ids).style.display = display
    }
    else {
        for (let i = 0; i < ids.length; i++) {
            ID(ids[i]).style.display = display
        }
    }
}
/**
 * returns the keys of an object excluding any methods
 * @param {object} obj  
 */
function GetKeysExFns(obj) {
    return Object.keys(obj).filter(x => typeof obj[x] !== "function")
}

/** swap two elements of an array
 * @param {object} array the array in questions
 * @param {number} value1 the id of the first value
 * @param {number} value2 the if of the second value
 */
function Swap(array, value1, value2) {
    let temp = array[value1]
    array[value1] = array[value2]
    array[value2] = temp
}
/**writes a selected dictionary to Dict.json. 'dictID' should be '1,2,3,4 or 0 to represent all
 * @param {*} dictID the id of the dictionary (1,2,3) or 0 to write all dictionaries */
function WriteDict(dictID) {
    if (arguments.length > 1) {
        Array.prototype.forEach.call(arguments, x => WriteDict(x));
        return true
    }
    let admin = require("./tabAdmin.js");
    let viewMenu = require("./tabViewMenu.js");

    if (dictID === 0) { WriteDict(1, 2, 3, 4); return true; }// if dictID = 0, run function for 1 2 and 3
    else if (dictID === 4) {
        let shopping = require("./tabShopping.js");
        fs.writeFileSync(`./resources/Dict.json`, JSON.stringify(d.Dict), { encoding: "utf8" })
        admin.RefreshEnumTable()
        shopping.RefreshButtons()
    }
    else {
        fs.writeFileSync(`./resources/Dict.json`, JSON.stringify(d.Dict), { encoding: "utf8" })
        admin.CreateTable(dictID)
        let editMenu = require("./tabEditMenu.js");
        editMenu.RefreshEditMenu()
        viewMenu.RefreshViewMenu()

    }
    var dropdowns = require('./createDropdowns.js')
    dropdowns.RefreshDropdowns(d.Dict)
    dropdowns.RefreshDataLists(d.Dict)

}

/**
 * get the date in the form MMM yy (e.g. Jun 18)
 * @param {date} date 
 */
function GetMMMyy(date) {
    var ret = date.toLocaleString("en-uk", { month: "short", year: "2-digit" });
    return ret;
}

function SaveBackup(){
    fs.writeFileSync(`./resources/Dict-backup.json`, JSON.stringify(d.Dict), { encoding: "utf8" });
    alert('saved')
}

function RestoreFromBackup(){
    d.ClearDict(d.Dict);
    ReadDict('Dict-backup.json');
    WriteDict(0);
    alert('restored')
}

module.exports = {
    ClearTable: ClearTable, // function to clear table, leaving a given number of header rows
    CreateDropdown: CreateDropdown, // create dropdown options
    CreateEditCellListeners: CreateEditCellListeners, // creates listener to enable 'edit cell' (currently used in admin tables)
    CreateEl: CreateEl, // creates an element using dot notation
    CreateElement: CreateElement, // creates an element and attaches it to a given parent and gives it an id
    CreateRow: CreateRow, // creates a row with given properties
    Compare: Compare, //compares two numeric values
    CompareFoodType: CompareFoodType, // compares food type to identify if fooda.type is before or after foodb.type
    CompareMeal: CompareMeal, // compares two meals and identifies whether meal a is before or after meal b
    CompareRecipe: CompareRecipe, // compares two recipes and identifies whether recipe a is before or after recipe b    
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
    ReadDict: ReadDict, // reads in 'Dict' from resources
    RenameKey: RenameKey, // renames the 'key' of a dictionary object (e.g. change food name)
    RestoreFromBackup:RestoreFromBackup, //restores Dicts from backup
    SaveBackup:SaveBackup, //saves a backup of Dicts
    SetValues: SetValues, // sets values for an array of html elements
    ShowElements: ShowElements, // show multiple elements with a given display
    Swap: Swap, // swaps two elements of an array
    WriteDict: WriteDict, // writes a selected dictionary to Dict.json
}