var d = require("./Dicts.js")
var u = require("./UtilityFunctions.js")
var Dict = d.Dict
var e = d.Dict[4]
var tagsInput = require('tags-input')

var cellWidths = [60, 150, 150, 20, 15, 15];


module.exports = {
    onLoad: onLoad
}

function onLoad() {
    //event listener to load people list page when menu is selected
    u.ID("selectPeopleMenu").addEventListener("change", CreatePeopleList);
    u.CreateElement("table", u.ID('viewPeopleDiv'), 'specialsTable');

    var saveBtn = u.CreateEl('button').id('saveAllergens').parent(u.ID('viewPeopleDiv')).innerText('Save').end();
    saveBtn.addEventListener('click', saveAllergens);

}

function CreatePeopleList(event) {
    RefreshAllergenTable(event.target.value);
}

function RefreshAllergenTable(menuTitle) {
    u.ID('specialsTable').innerHTML = "";
    var cellTitles = ["Person", "Allergens", "Foods", "Morv", "-", "+"]
    u.CreateRow("specialsTable", "th", cellTitles , ["", "", "", "", "", "addIngRowHeader"], cellWidths, "px");
    var specials = Dict[3][menuTitle].specials;
    if (specials) {
        Object.keys(specials).forEach(person => {
            addAllergenRow(person, specials[person])
        });
    }
    else {
        addAllergenRow()
    }
}

function addAllergenRow(personName, specialData,rowIndex) {
    var i = u.ID('specialsTable').rows.length;
    var cellContents = ["", "", "", "", "-", "+"]
    var cellIDs = ["", "", "", "",`agn-${i}`, `agn+${i}`]
  
    var newRow = u.CreateRow("specialsTable", "td", cellContents, cellIDs, cellWidths , "px", rowIndex);

    var inputConfig = [
        {
            elementType:'input',
            type: 'text',
            id: 'agnPerson',
            key: 'person'
        },
        {
            elementType:'input',
            type: 'tags',
            id: 'agnAllergen',
            dropdownSource: 'allergenList',
            key: 'allergens'
        },
        {
            elementType:'input',
            type: 'tags',
            id: 'agnFoods',
            dropdownSource: 'food',
            key: 'foods'
        },
        {
            elementType:'select',
            id:'agnMorv',
            key:'morv'
        }
    ]
    var els = {};
    inputConfig.forEach((obj, ind) => {
        els[obj.key] = u.CreateEl(obj.elementType).type(obj.typeType).id(`${obj.id}${i}`).parent(newRow.children[ind]).end();
        if (obj.type === 'tags') {
            var valArray = [];
            try {
                valArray = specialData[obj.key];
            }
            catch (e) {

            }
            console.log(valArray);
            tagsInput(els[obj.key], obj.dropdownSource, 'populate', ',', valArray)
        }
    })
    els.person.setAttribute('list','specialPeople')
    if(personName) els.person.setAttribute('value',personName)
    var defaultVal = 'morv';
    if(specialData){defaultVal = specialData.morv}
    u.CreateDropdown(els.morv.id,["m","v"],false,undefined,defaultVal);

    u.ID(`agnPerson${i}`).addEventListener('change',selectPersonName)

    u.ID(`agn+${i}`).addEventListener('click', function () { addAllergenRow() });
    u.ID(`agn-${i}`).addEventListener('click', deleteAllergenRow);
}

function deleteAllergenRow() {
    let table = u.ID('specialsTable')
    let i = u.GetNumber(event.target.id)

    //remove from dict obj if it exists
    var menuTitle = u.ID('selectPeopleMenu').value;
    var key = u.ID(`agnPerson${i}`).value;
    if(key){
        delete Dict[3][menuTitle].allergies[key];
        u.WriteDict(3);    
    }

    table.deleteRow(i);

    // renumber the ids of all the rows below the deleted row
    let len = table.rows.length
    function replaceIndexes(parent, from, to) {
        Array.prototype.forEach.call(parent.children, cell => {
            cell.id = cell.id.replace(from, to);
            replaceIndexes(cell, from, to)
        })
    }
    for (i; i < len; i++) {
        replaceIndexes(table.rows[i], i + 1, i)
    }
}

function saveAllergens() {
    var menuTitle = u.ID('selectPeopleMenu').value;
    var table = u.ID('specialsTable');
    var rowcount = table.rows.length;

    for (let i = 1; i < rowcount; i++) {
        var personName = u.ID(`agnPerson${i}`).value;
        var allergens = getArr(`agnAllergen${i}`);
        var foods = getArr(`agnFoods${i}`);
        var morv = u.ID(`agnMorv${i}`).value;

        if (!personName || morv === 'morv' || (!allergens && !foods)) continue;

        Dict[3].changeAllergyType(menuTitle, personName, allergens, foods, morv);
    }
    u.WriteDict(3);
    RefreshAllergenTable(menuTitle);
}

function getArr(id) {
    var thing = u.ID(id).value;
    return thing ? thing.split(",") : undefined;
}

function selectPersonName(e){
    var name = e.target.value;
    var i = u.GetNumber(e.target.id)
    var specialsEnum = Dict[4].specialsEnum;
    var specialNames = Object.keys(specialsEnum)

    if(specialNames.indexOf(name)>=0){
        var specialData = specialsEnum[name];
        u.ID('specialsTable').deleteRow(i);
        addAllergenRow(name,specialData,i);
    }
}