var d = require("./Dicts.js")
var u = require("./UtilityFunctions.js")
var Dict = d.Dict
var e = d.Dict[4]
var tagsInput = require('tags-input')


module.exports = {
    onLoad: onLoad
}

function onLoad() {
    //event listener to load people list page when menu is selected
    u.ID("selectPeopleMenu").addEventListener("change", CreatePeopleList);
    u.CreateElement("table", u.ID('viewPeopleDiv'), 'allergensTable');
}

function CreatePeopleList(event) {
    RefreshAllergenTable(event.target.value);
}

function RefreshAllergenTable(menuTitle) {
    u.ID('allergensTable').innerHTML = "";
    u.CreateRow("allergensTable", "th", ["Name", "Allergens", "Foods", "People", "-", "+"], ["", "", "", "", "", "addIngRowHeader"], [60, 150, 150, 150, 15, 15], "px");
    var allergies = Dict[3][menuTitle].allergies;
    if (allergies) {
        Object.keys(allergies).forEach((key, i) => {
            addAllergenRow(key, allergies, i)
        });
    }
    else {
        addEmptyAllergenRow()
    }

}

function addAllergenRow(key, allergies, i) {
    var rowItem = allergies[key]
    var cellContents = [key, rowItem.allergens.join(", "), rowItem.foods.join(", "), rowItem.people.join(" ,"), "-", "+"]
    var cellIDs = [`agnName${i}`, `agnAllergen${i}`, `agnFoods${i}`, `agnPeople${i}`, `agn-${i}`, `agn+${i}`]
    u.CreateRow("allergensTable", "td", cellContents, cellIDs, [60, 150, 150, 150, 15, 15], "px");

    u.ID(`agn+${i}`).addEventListener('click',addEmptyAllergenRow);
    u.ID(`agn-${i}`).addEventListener('click',deleteAllergenRow);

    //redo this function (prob with a tags sub function) to get this working
    u.CreateEditCellListeners(`agnAllergen${i}`, "tags", `agnName${i}`, 3, "allergens")

}

function addEmptyAllergenRow(){
    console.log('adding empty row')
    var i = u.ID('allergensTable').rows.length;
    var cellContents = ["","", "", "", "-", "+"]
    var cellIDs = ["", `agnAllergen${i}`, `agnFoods${i}`, `agnPeople${i}`, `agn-${i}`, `agn+${i}`]
    var newRow = u.CreateRow("allergensTable", "td", cellContents, cellIDs, [60, 150, 150, 150, 15, 15], "px");
    
    var inputConfig = [
        {
            type:'text',
            id:'agnName',
        },
        {
            type:'tags',
            id:'agnAllergen',
            dropdownSource:'allergenList'
        },        
        {
            type:'tags',
            id:'agnFoods',
            dropdownSource:'food'
        },        
        {
            type:'tags',
            id:'agnPeople'
        },
    ]

    inputConfig.forEach((obj,ind) => {
        var el = u.CreateEl('input').type(obj.type).id(`${obj.id}${i}`).parent(newRow.children[ind]).end();
        if(obj.type === 'tags'){
            tagsInput(el,obj.dropdownSource,'create',' ')
        }
    })


    u.ID(`agn+${i}`).addEventListener('click',addEmptyAllergenRow);
    u.ID(`agn-${i}`).addEventListener('click',deleteAllergenRow);

}

function deleteAllergenRow(){
    let table = u.ID('allergensTable')
    let i = u.GetNumber(event.target.id)
    table.deleteRow(i);
    // renumber the ids of all the rows below the deleted row
    let len = table.rows.length
    function replaceIndexes(parent,from,to){
        Array.prototype.forEach.call(parent.children, cell => {
            cell.id = cell.id.replace(from,to);
            replaceIndexes(cell,from,to)
        })
    }
    for (i; i<len; i++){
        replaceIndexes(table.rows[i],i+1,i)
     }
}
// menu.allergies = {
//     DF: {
//         people: ["Fuzz", "mike D"],
//         allergens: ["dairy"],
//         foods: []
//     },
//     Nuts: {
//         people: [],
//         allergens: [],
//         foods: []
//     }
// }


/** creates the ingredient table in the add recipe tab */
function CreateIngredientTable() {
    u.CreateRow("ingredientTable", "th", ["Food", "Quantity", "", "Morv", "-", "+"], ["", "", "", "", "", "addIngRowHeader"], [210, 90, 60, 60, 15, 15], "px")
    AddIngredientsRow()
    u.ID("addIngRowHeader").addEventListener("click", AddIngredientsRow)
}
