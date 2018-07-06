var u = require("./UtilityFunctions.js")
var d = require("./Dicts.js")
var Dict = d.Dict
var tagsInput = require('tags-input')

// onLoad
function onLoad() {
    u.ID("addfood_btn").addEventListener("click", AddFoodBtn);

    var allergenInput = u.CreateElement("input", u.ID("allergenDiv"), "allergenInput") //this is actually hidden by the tags-input library - but stores the resultant value
    tagsInput(allergenInput, "allergenList","create"," ");
    allergenInput.setAttribute('type', 'tags');

}

/** adds a food to Dict[1] based on the info in the add food tab */
function AddFoodBtn() {

    tagsInput(u.ID('allergenInput'),"","clear"," ");
    
    let thing = u.ID("foodThing").value.toLowerCase()
    let shop = u.ID("selectFoodShop").value;
    let foodType = u.ID("selectFoodType").value;
    let foodUnitVal = u.ID("foodUnit").value;
    let foodUnit = foodUnitVal === "" ? null : foodUnitVal;
    let allergens = u.ID("allergenInput").value.split(" ");

    Dict[1].addFood(thing, foodUnit, shop, foodType, allergens)

    u.WriteDict(1)
    u.WriteDict(4)    
    u.SetValues([["foodThing", ""], ["foodUnit", ""], ["selectFoodShop", "Shop"], ["selectFoodType", "Food Type"]]);

    for (let i = 0; i + 1 < u.ID("ingredientTable").rows.length; i++) {
        var select = u.ID(`selectIngredientFood${i}`);

        u.CreateDropdown(select.id, Dict[1], true,undefined,select.value)

    }
}

module.exports = {
    btn: AddFoodBtn,
    onLoad: onLoad
}