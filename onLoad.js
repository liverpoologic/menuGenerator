var d = require("./Dicts.js")
var admin = require("./tabAdmin.js")
require("./tabViewMenu.js")
var u = require("./UtilityFunctions.js")
var addFood = require("./tabAddFood.js")
var addRecipe = require("./tabAddRecipe.js")
var addMenu = require("./tabAddMenu.js")
var viewMenu = require("./tabViewMenu.js")
var editMenu = require("./tabEditMenu.js")
var shopping = require("./tabShopping.js")
const ipc = require('electron').ipcRenderer

exports.OnLoad = function () {
    // Import the 3 dictionaries
    u.ReadDict()
    var e = d.Dict[4]

    // Create dropdowns
    u.CreateDropdown("selectFoodShop", e.shopEnum, false) // add food > select shop    
    u.CreateDropdown("selectFoodType", e.foodTypeEnum, false) // add food > select food type    
    u.CreateDropdown("selectRecipeMealType", e.mealTypeEnum, false) // add recipe > select meal type
    u.CreateDropdown("selectRecipeType", e.recipeTypeEnum, false) // add recipe > select recipe type
    u.CreateDropdown("recipeMorv", e.morvOpts, false) // add recipe > select morv    
    u.CreateDropdown("selectViewMenu", d.Dict[3], true) // view menu > select menu
    u.CreateDropdown("selectEditMenu", d.Dict[3], true) // edit menu > select menu
    u.CreateDropdown("selectMenuForNewRecipe", d.Dict[3], true) // edit menu > add recipe > select menu
    u.CreateDropdown("selectRecipeForMenu", d.Dict[2], true) // edit menu > add recipe > select recipe
    u.CreateDropdown("selectMorvForMenu", e.morvEnum, false) // edit menu > add recipe > select morv
    u.CreateDropdown("selectMenuForMultiplyUp", d.Dict[3], true) // edit menu > multiply up > select menu    
    u.CreateDropdown("selectMenuForShopping", d.Dict[3], true) // shopping > select menu
    u.CreateDropdown("selectMealTypeForAddMeals", e.mealTypeEnum, false) // add menu > add meals > select meal type 

    u.CreateDropdown("selectAdminEnum",e,true) // enum of enums for the admin > other screen

    // onLoad for other tabs
    addFood.onLoad()
    addRecipe.onLoad()
    addMenu.onLoad()
    viewMenu.onLoad()
    editMenu.onLoad()
    shopping.onLoad()
    admin.onLoad()

    // when user clicks elsewhere, modals close
    window.onclick = function (click) {
        var multiplyModal = u.ID("multiplyUp");
        var addRecipeModal = u.ID("addRecipeToMenu");
        var addMealModal = u.ID("addMealsToMenu")
        var settingsModal = u.ID("settingsModal")
        if (click.target == addRecipeModal) {
            addRecipeModal.style = "display none";
            editMenu.RefreshEditMenu()
            shopping.RefreshLists()
        }
        else if (click.target == multiplyModal) {
            multiplyModal.style = "display: none"
            editMenu.RefreshEditMenu()
            shopping.RefreshLists()
        }
        else if (click.target == addMealModal) {
            addMealModal.style = "display: none"
            editMenu.RefreshEditMenu()
            shopping.RefreshLists()
        }
        else if (click.target == settingsModal) {
            settingsModal.style = "display: none"
        }
    }
    // create listeners for each tab button
    var HtabList = document.getElementsByClassName("htablinks")
    for (let i = 0; i < HtabList.length; i++) {
        let btnID = HtabList[i].id
        let tabIDlength = btnID.length - 6
        let tabID = btnID.slice(0, tabIDlength)
        u.ID(btnID).addEventListener("click", function () {
            u.OpenHTab(tabID)
        })
    }
    var VtabList = document.getElementsByClassName("vtablinks")
    for (let i = 0; i < VtabList.length; i++) {
        let btnID = VtabList[i].id
        let tabIDlength = btnID.length - 6
        let tabID = btnID.slice(0, tabIDlength)
        u.ID(btnID).addEventListener("click", function () {
            u.OpenVTab(tabID)
        })
    }

    // create event listener for 'settings' button
    u.ID("settings_btn").addEventListener("click", function () {
        u.ID("filepath").value = d.Dict[5].filepath
        u.ShowElements("settingsModal", "block")
    })
    // when you change the filepath, write to e
    u.ID("filepath").addEventListener("change",function(){
        d.Dict[5].filepath = u.ID("filepath").value
        u.WriteDict(4)
    })

    // function to return to normal once pdf has printed
    ipc.on('wrote-pdf', function (event, path) {
        u.HideElements("PrintMenu")
        u.HideElements("PrintShopping")
        u.ShowElements("mainApp", "block")
        console.log(`Wrote PDF to: ${path}`)
    })

    // listener to support keyboard shortcuts
    document.addEventListener("keydown", KeyPress)
}

/** executes an action depending on the key pressed */
function KeyPress() {
    let key = event.keyCode
    if (key === 16) {// shift key
        let j = u.ID("ingredientTable").rows.length - 2
        if (u.ID("AddRecipe").style.display === "block" && u.ID(`selectIngredientFood${j}`).value !== "Food") {
            event.preventDefault()
            addRecipe.AddIngredientsRow()
        }
    }
    else if (key === 13) {// enter key
        if (u.ID("AddFood").style.display === "block") {
            event.preventDefault()
            addFood.btn()
        }
        if (u.ID("AddMenu").style.display === "block") {
            event.preventDefault()
            addFood.btn()
        }
    }
    else if (key > 111 && key < 119) {// f1-f7 keys for h tabs
        let HtabList = document.getElementsByClassName("htabcontent")
        let x = key - 112
        u.OpenHTab(HtabList[x].id)
    }
    else if(key===36){ // edge case for 'home' as home key has an unhelpful keycode
        event.preventDefault()
        let VtabList = document.getElementsByClassName("vtabcontent")
        u.OpenVTab(VtabList[0].id)
        }
    else if (key > 32 && key < 36 && u.ID("Admin").style.display === "block") {// pg up, pg dn and end keys for v tabs
        event.preventDefault()
        let VtabList = document.getElementsByClassName("vtabcontent")
        let x = key - 32
        u.OpenVTab(VtabList[x].id)
    }
    else if (key > 48 && key < 58 && u.ID("Shopping").style.display === "block") {// 1-7 for shopping tables
        event.preventDefault()
        let x = key - 49
        shopping.ShowShoppingDiv(x)
    }
}