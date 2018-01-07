var d = require("./Dicts.js")
var admin = require("./tabAdmin.js")
var u = require("./UtilityFunctions.js")     
var addRecipe = require("./tabAddRecipe.js")

exports.OnLoad = function () {
    // Import the 3 dictionaries
    d.Dict[1].importJSON()
    d.Dict[2].importJSON()
    d.Dict[3].importJSON()
    //
    // Create dropdowns
    u.CreateDropdown("selectFoodShop", d.shopEnum, false) // add food > select shop    
    u.CreateDropdown("selectFoodType", d.foodTypeEnum, false) // add food > select food type    
    u.CreateDropdown("selectRecipeMealType", d.mealTypeEnum, false) // add recipe > select meal type
    u.CreateDropdown("selectRecipeType", d.recipeTypeEnum, false) // add recipe > select recipe type
    u.CreateDropdown("recipeMorv", d.morvOpts, false) // add recipe > select morv    
    u.CreateDropdown("selectViewMenu", d.Dict[3], true) // view menu > select menu
    u.CreateDropdown("selectEditMenu", d.Dict[3], true) // edit menu > select menu
    u.CreateDropdown("selectMenuForNewRecipe", d.Dict[3], true) // edit menu > add recipe > select menu
    u.CreateDropdown("selectRecipeForMenu", d.Dict[2], true) // edit menu > add recipe > select recipe
    u.CreateDropdown("selectMorvForMenu", d.morvEnum, false) // edit menu > add recipe > select morv
    u.CreateDropdown("selectMenuForMultiplyUp", d.Dict[3], true) // edit menu > multiply up > select menu    
    u.CreateDropdown("selectMenuForShopping", d.Dict[3], true) // shopping > select menu
    u.CreateDropdown("selectMealTypeForAddMeals", d.mealTypeEnum, false) // add menu > add meals > select meal type    
    //
    // functions to create tables on load
    admin.CreateTable(1)
    admin.CreateTable(2)
    admin.CreateTable(3)
    addRecipe.CreateIngredientTable()    
}