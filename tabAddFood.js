var u = require("./UtilityFunctions.js")    
var d = require("./Dicts.js") 
var Dict = d.Dict 



// onLoad
u.ID("addfood_btn").addEventListener("click", AddFoodBtn)

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
        if(u.ID(`selectIngredientFood${i}`).value==="Food"){
        u.ClearDropdown(`selectIngredientFood${i}`,"Food")
        u.CreateDropdown(`selectIngredientFood${i}`,Dict[1],true) // recipe > add ingredients
        }
    }
}