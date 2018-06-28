var u = require("./UtilityFunctions.js")    
var d = require("./Dicts.js") 
var Dict = d.Dict 

// onLoad
function onLoad(){
    u.ID("addfood_btn").addEventListener("click", AddFoodBtn)
} 

/** adds a food to Dict[1] based on the info in the add food tab */
function AddFoodBtn ()
{
    let thing = u.ID("foodThing").value.toLowerCase()
    let shop = u.ID("selectFoodShop").value
    let foodType = u.ID("selectFoodType").value
    
    if (u.ID("foodUnit").value === ""){ //set unit as null when blank
        Dict[1].addFood(thing,null,shop,foodType)
    }
    else {         
        let unit = u.ID("foodUnit").value
        Dict[1].addFood(thing,unit,shop,foodType)
    }
    u.WriteDict(1)
    u.SetValues([["foodThing",""],["foodUnit",""],["selectFoodShop","Shop"],["selectFoodType","Food Type"]])

    for (let i=0; i+1 < u.ID("ingredientTable").rows.length; i++){

        u.ClearDropdown(`selectIngredientFood${i}`, u.ID(`selectIngredientFood${i}`).value)
        u.CreateDropdown(`selectIngredientFood${i}`, Dict[1], true)
    }
}

module.exports = {
    btn:AddFoodBtn,
    onLoad:onLoad
}