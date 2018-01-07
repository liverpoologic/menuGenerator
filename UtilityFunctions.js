var d = require("./Dicts.js")
var fs = require("fs")

/** permits drop on a given div */
function AllowDrop(ev) {
    ev.preventDefault();
}
/** function to clear drop down and put in default option
 * @param {string} elementID ID of the dropdown to clear
 * @param {string} option string that should be used as default value after it is cleared*/ 
function ClearDropdown(elementID, option) {   
    ID(elementID).innerHTML = "";
    let opt = document.createElement("option");
    opt.textContent = option
    opt.value = option
    ID(elementID).appendChild(opt)
}
/** function to clear table, leaving a given number of header rows
 * @param {string} tableID html ID of the table to clear
 * @param {number} numberOfRowsToKeep how many rows should be left untouched (can be 0 to clear whole table)*/ 
function ClearTable(tableID, numberOfRowsToKeep){
    let table = ID(tableID)
    for (let i = table.rows.length; i > numberOfRowsToKeep; i--) {
        table.deleteRow(i - 1);
    }
}
function CreateEditCellListeners(cellID, inputType, keyID, dictID, property, dropdownSource, dropdownKeys) { // creates listener to enable 'edit cell' (currently used in admin tables)
    // inputType = text, number or select.
    // KeyID is the cell ID which contains the key for that object. (e.g. cell ID for 'allspice')
    // dictID should be 1, 2 or 3 
    // property is the property of the object being changes (e.g. shop)
    // dropdownSource and Keys as per CreateDropdown function
    ID(cellID).addEventListener("click", function editCell() {
        let cell = ID(cellID)
        let key = ID(keyID).innerText
        let oldValue = d.Dict[dictID][key][property]
        if (inputType === "text" || inputType === "number") {
            cell.innerHTML = `<input type='${inputType}' id='Input_${cellID}' value='${oldValue}' class='tableTextInput'><button id='Save_${cellID}' class='insideCellBtn'>✔</button>`
        }
        else if (inputType === "select") {
            cell.innerHTML = `<select id='Input_${cellID}'><option>${oldValue}</option></select><button id='Save_${cellID}' class='insideCellBtn'>✔</button>`
            CreateDropdown(`Input_${cellID}`, dropdownSource, dropdownKeys)
        }
        cell.className = "tableInput"
        ID(cellID).removeEventListener("click", editCell)
        ID(`Save_${cellID}`).addEventListener("click", function saveNewCell() {
            let newValue = ID(`Input_${cellID}`).value
            d.Dict[dictID][key][property] = newValue
            WriteDict(dictID)
        })
    })
}
function CreateDropdown(elementID, source, keys, valueOpts) { // creates dropdowns. If keys = true, will find object.keys of source. For an enum, use keys = false
    var select = ID(elementID);
    if (keys === true) {
        var options = Object.keys(source).sort()
    }
    else {
        var options = source
    }
    if (typeof valueOpts !== "object") {
        valueOpts = []
        for (let x = 0; x < options.length; x++) {
            valueOpts[x] = options[x]
        }
    }
    for (let i = 0; i < options.length; i++) {
        let displayOpt = options[i];
        let valueOpt = valueOpts[i]
        if (keys === true) {
            if (typeof source[displayOpt] === "function") {
                continue
            }
        }
        let el = document.createElement("option");
        el.textContent = displayOpt;
        el.value = valueOpt;
        select.appendChild(el);
    }
}
/** creates an element of type [elementType] and attaches it to element [parent]
 * @param {string} elementType the type of element you want to create (e.g. "div")
 * @param {object} parent the element you want to attach the new element to (i.e. parent.appendChild)
 */
function CreateElement(elementType,parent,id,className,innerText){
    let newElement = document.createElement(elementType)
    parent.appendChild(newElement)
    Html(newElement,id,className,undefined,undefined,innerText)
    return newElement
}
function CreateRow(tableID, cellType, cellInnerHtml, cellIDs, cellWidth, widthUnit) { // creates a row with given innerhtmls - use arrays for cell width, cell type etc.
    // EXAMPLE u.CreateRow("t1table","th",["cell1text","cell2text],["id1","id2"],[40,60],"%")
    if (typeof cellWidth === "undefined"){cellWidth="", widthUnit=""}
    let Table = ID(tableID)
    let newRow = Table.insertRow()
    for (var i = 0; i < cellInnerHtml.length; i++) {
        let newCell = document.createElement(cellType);
        Html(newCell, "", "", `width:${cellWidth[i]}${widthUnit}`, cellInnerHtml[i])
        if (typeof cellIDs === "object") { newCell.id = cellIDs[i] }
        newRow.appendChild(newCell);
    }
}
function CompareFoodType(a, b) { // compares food type to identify if fooda.type is before or after foodb.type

    if(typeof d.Dict[1][a] === "undefined"){console.log(`${a} needs to be added to the food dictionary`); return "error, view console"}
    if(typeof d.Dict[1][b] === "undefined"){console.log(`${b} needs to be added to the food dictionary`); return "error, view console"}    
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
function CompareMeal(a, b) { // compares two meals and identifies whether meal a is before or after meal b
    let aDate = new Date(a.date)
    let bDate = new Date(b.date)
    let comparison = 0;
    if (aDate > bDate) {
        comparison = 1;
    } else if (aDate < bDate) {
        comparison = -1;
    }
    else if (d.mealTypeEnum.indexOf(a.mealType) > d.mealTypeEnum.indexOf(b.mealType)) {
        comparison = 1
    }
    else if (d.mealTypeEnum.indexOf(a.mealType) < d.mealTypeEnum.indexOf(b.mealType)) {
        comparison = -1
    }
    return comparison; // 1 means a is after b, -1 means a should be before b
}
function CompareRecipe(a,b){
    let comparison = 0;
    if (d.recipeTypeEnum.indexOf(a.recipeType) > d.recipeTypeEnum.indexOf(b.recipeType)) {
        comparison = 1
    }
    else if (d.recipeTypeEnum.indexOf(a.recipeType) < d.recipeTypeEnum.indexOf(b.recipeType)) {
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
function DisplayIngredient(quantitySmall, quantityLarge, unit) { // changes g to kg when relevant, sets decimal places. Returns array with qsmall qlarge and unit
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
function Drop(ev) { // preventDefault when something is dropped
    ev.preventDefault();
}
function GetFormalDate(date) { // convert date into 'formal' - e.g 1st, 2nd, 3rd
    let x = date.getDate()
    let st = [1, 21, 31]
    let nd = [2, 22]
    let rd = [3, 23]
    if (st.indexOf(x) > -1) { return `${x}st` }
    else if (nd.indexOf(x) > -1) { return `${x}nd` }
    else if (rd.indexOf(x) > -1) { return `${x}rd` }
    else { return `${x}th` }
}
function HideElements(ids) { // hide element with given ID
    ShowElements(ids,"none")
}
function Html(variable, id, className, style, innerHTML, innerText, value) { // set attributes of an html object: id, classname, style, innerHTML and innerText
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
function ID(elementID) { // changes 'document.getElementById' to just ID
    return document.getElementById(elementID)
}
function OpenHTab(tabName) { // opens a horizontal tab (i.e. main navigation)
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("htabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("htablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}
function OpenVTab(tabName) { // opens a vertical tab (i.e. admin table tabs)
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("vtabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("vtablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}
function RenameKey(oldKeyName, newKeyName, location) {// renames the 'key' of a dictionary object (e.g. change food name)
    if (oldKeyName !== newKeyName) {
        Object.defineProperty(location, newKeyName, Object.getOwnPropertyDescriptor(location, oldKeyName));
        delete location[oldKeyName];
    }
}
/**sets values for an array of html elements, with the form: ([[id,newValue],[id,newValue]...]) */
function SetValues(input) { 
    for (let i = 0; i < input.length; i++) {
        ID(input[i][0]).value = input[i][1]
    }
}
/** show multiple elements wih the form ([id1,id2,id3],display) */
function ShowElements(ids,display){
    if (typeof ids === "string"){
        ID(ids).style.display = display
    }
    else {
        for (let i=0; i<ids.length; i++){
            ID(ids[i]).style.display=display
        }    
    }
}
function WriteDict(dictID) { // writes a selected dictionary to Dict.json. 'dictID' should be '1,2,3 or 0 to represent all'
    if (dictID === 0) { // if dictID = 0, run function for 1 2 and 3
        for (let i = 1; i < 4; i++) {
            WriteDict(i)
        }
    }
    else {
        fs.writeFileSync(`Dict[${dictID}].json`, JSON.stringify(d.Dict[dictID]), { encoding: "utf8" })
        let admin = require("./tabAdmin.js");        
        admin.CreateTableContents(dictID)
        let editMenu = require("./tabEditMenu.js");                
        editMenu.RefreshEditMenu()
        // below bit of code refreshes any dropdowns that are affected by a dictionary change.
        // dropdownIDs below need to be updated when new dropdown is added. Hard coded.
        let dropdownIDs = [[], [], ["selectRecipeForMenu"], ["selectEditMenu", "selectViewMenu", "selectMenuForNewRecipe", "selectMenuForMultiplyUp", "selectMenuForShopping"]]
        for (let i = 0; i < dropdownIDs[dictID].length; i++) {
            let id = dropdownIDs[dictID][i]
            ClearDropdown(id, ID(id).value)
            CreateDropdown(id, d.Dict[dictID], true)
        }
    }
}

module.exports = {
    AllowDrop: AllowDrop, // permits drop on a given div
    ClearDropdown: ClearDropdown, // function to clear drop down and put in default option   
    ClearTable:ClearTable, // function to clear table, leaving a given number of header rows
    CreateDropdown: CreateDropdown, // create dropdown options
    CreateEditCellListeners: CreateEditCellListeners, // creates listener to enable 'edit cell' (currently used in admin tables)
    CreateElement:CreateElement, // creates an element and attaches it to a given parent and gives it an id
    CreateRow: CreateRow, // creates a row with given properties
    CompareFoodType: CompareFoodType, // compares food type to identify if fooda.type is before or after foodb.type
    CompareMeal: CompareMeal, // compares two meals and identifies whether meal a is before or after meal b
    CompareRecipe: CompareRecipe, // compares two recipes and identifies whether recipe a is before or after recipe b    
    Drop: Drop, // preventDefault when something is dropped
    DisplayIngredient: DisplayIngredient, // changes g to kg when relevant, sets decimal places
    GetFormalDate:GetFormalDate, // convert date into 'formal' - e.g 1st, 2nd, 3rd
    HideElements: HideElements, // hide element with given ID
    Html: Html, // set attributes of an html object: id, classname, style, innerHTML and innerText    
    ID: ID, // changes 'document.getElementById' to just ID
    OpenHTab: OpenHTab, // opens a horizontal tab (i.e. main navigation)
    OpenVTab: OpenVTab, // opens a vertical tab (i.e. admin table tabs
    RenameKey: RenameKey, // renames the 'key' of a dictionary object (e.g. change food name)
    SetValues: SetValues, // sets values for an array of html elements
    ShowElements:ShowElements, // show multiple elements with a given display
    WriteDict: WriteDict, // writes a selected dictionary to Dict.json
}