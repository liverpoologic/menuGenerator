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
var dropdowns = require('./createDropdowns.js')
const ipc = require('electron').ipcRenderer

exports.OnLoad = function () {
    // Import the dictionary
    u.ReadDict('Dict.json')

    dropdowns.RefreshDropdowns(d.Dict)
    dropdowns.RefreshDataLists(d.Dict)

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

    //create event listener for 'save_backup' and 'restore_from_backup' button
    u.ID("save_backup").addEventListener("click",u.SaveBackup)
    u.ID("restore_from_backup").addEventListener("click",u.RestoreFromBackup)

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