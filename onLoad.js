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
var people = require("./tabPeople.js")
const ipc = require('electron').ipcRenderer

exports.OnLoad = function () {
    // Import the 3 dictionaries
    u.ReadDict()
    var e = d.Dict[4]

    // Create array of menu names
    var menuValList = u.GetKeysExFns(d.Dict[3]).sort((a,b) => {
        return u.Compare(d.Dict[3][a].startDate,d.Dict[3][b].startDate)
    });

    var menuNameList = menuValList.map(menuTitle => {
        var menu = d.Dict[3].getMenu(menuTitle);
        return menu.startDate ? `${menuTitle} (${u.GetMMMyy(new Date(menu.startDate))})` : menuTitle;
    });

    // Create dropdowns
    u.CreateDropdown("selectFoodShop", e.shopEnum, false) // add food > select shop    
    u.CreateDropdown("selectFoodType", e.foodTypeEnum, false) // add food > select food type    
    u.CreateDropdown("selectRecipeMealType", e.mealTypeEnum, false) // add recipe > select meal type
    u.CreateDropdown("selectRecipeType", e.recipeTypeEnum, false) // add recipe > select recipe type
    u.CreateDropdown("recipeMorv", e.morvOpts, false) // add recipe > select morv    
    u.CreateDropdown("selectViewMenu", menuNameList, false, menuValList) // view menu > select menu
    u.CreateDropdown("selectEditMenu", menuNameList, false, menuValList) // edit menu > select menu
    u.CreateDropdown("selectMenuForNewRecipe", menuNameList, false, menuValList) // edit menu > add recipe > select menu
    u.CreateDropdown("selectRecipeForMenu", d.Dict[2], true) // edit menu > add recipe > select recipe
    u.CreateDropdown("selectMorvForMenu", e.morvEnum, false) // edit menu > add recipe > select morv
    u.CreateDropdown("selectMenuForMultiplyUp", menuNameList, false, menuValList) // edit menu > multiply up > select menu    
    u.CreateDropdown("selectMenuForShopping", menuNameList, false, menuValList) // shopping > select menu
    u.CreateDropdown("selectMealTypeForAddMeals", e.mealTypeEnum, false) // add menu > add meals > select meal type 
    u.CreateDropdown("selectPeopleMenu", menuNameList, false, menuValList) // edit menu > select menu   
    u.CreateDropdown("selectAdminEnum", e, true) // enum of enums for the admin > other screen

    // onLoad for other tabs
    addFood.onLoad()
    addRecipe.onLoad()
    addMenu.onLoad()
    viewMenu.onLoad()
    editMenu.onLoad()
    shopping.onLoad()
    people.onLoad()
    admin.onLoad()

    // when user clicks elsewhere, modals close
    window.onclick = function (click) {
        let t = click.target;
        if (t === u.ID("multiplyUp") || t === u.ID("addRecipeToMenu") || t === u.ID("addMealsToMenu")) {
            t.style = "display:none"
            editMenu.RefreshEditMenu()
            shopping.RefreshLists()
        }
        else if (t === u.ID("settingsModal")) t.style = "display:none"
    }
    // create listeners for each tab button
    var HtabList = document.getElementsByClassName("htablinks");
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
    u.ID("filepath").addEventListener("change", function () {
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
    let key = event.keyCode;
    if(key === 191){
        var TEST = u.ID('testing2');
        console.log(TEST)
    }

    var vTabNums = [105,102,99,110];
    switch (key) {
        case 191: //forward slash key
            let j = u.ID("ingredientTable").rows.length - 2
            if (u.ID("AddRecipe").style.display === "block" && u.ID(`selectIngredientFood${j}`).value !== "Food") {
                event.preventDefault()
                addRecipe.AddIngredientsRow()
            }
            break;
        case 13: //enter key
            if (u.ID("AddFood").style.display === "block") {
                event.preventDefault()
                addFood.btn()
            }
            if (u.ID("AddMenu").style.display === "block") {
                event.preventDefault()
                addFood.btn()
            }
            break;
        default:
            if (key > 111 && key < 119) {// f1-f7 keys for h tabs
                let HtabList = document.getElementsByClassName("htabcontent")
                let x = key - 112
                u.OpenHTab(HtabList[x].id)
            }
            else if (vTabNums.indexOf(key)>=0 && u.ID("Admin").style.display === "block") {// . , 3 , 6 , 9 on numpad for v tabs
                event.preventDefault()
                let VtabList = document.getElementsByClassName("vtabcontent")
                let x = vTabNums.indexOf(key)
                console.log(x);
                u.OpenVTab(VtabList[x].id)
            }
            else if (key > 48 && key < 58 && u.ID("Shopping").style.display === "block") {// 1-7 for shopping tables
                event.preventDefault()
                let x = key - 49
                shopping.ShowShoppingDiv(x)
            }
            break;
    }
}