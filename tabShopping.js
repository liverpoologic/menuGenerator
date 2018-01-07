var d = require("./Dicts.js")
var u = require("./UtilityFunctions.js")
var Dict = d.Dict

var shoppingDiv = u.ID("Shopping")
// create all the buttons for each shop
for (let i = 0; i < d.shopEnum.length; i++) {
    let btn = document.createElement("button")
    u.Html(btn, `shoppingbtn${d.shopEnum[i]}`, "shoppingbtn", "", "", d.shopEnum[i])
    shoppingDiv.appendChild(btn);
}
// create div and shopping table for each shop, display:none
for (let i = 0; i < d.shopEnum.length; i++) {
    let div = document.createElement("div")
    shoppingDiv.appendChild(div);
    u.Html(div, `shoppingdiv${d.shopEnum[i]}`, "shoppingbtn", "display:none")

    let shoppingTable = document.createElement("table")
    div.appendChild(shoppingTable)
    u.Html(shoppingTable, `shoppingtable${d.shopEnum[i]}`, "shoppingTable")
}
// populate tables when menu is selected
u.ID("selectMenuForShopping").addEventListener("change", RefreshLists)

/** refresh shopping lists in response to new menu */
function RefreshLists(){
    for (let i = 0; i < d.shopEnum.length; i++) {
        let shop = d.shopEnum[i]        
        u.ClearTable(`shoppingtable${shop}`,0)
        let rowNumber = 0
        let menuTitle = u.ID("selectMenuForShopping").value
        if (menuTitle === "Menu"){return "error - no menuTitle present"}
        let menu = Dict[3].getMenu(menuTitle)
        let mealKey = Object.keys(menu.meals)
        for (let j = 0; j < mealKey.length; j++) {
            let meal = Dict[3].getMeal(menuTitle, j)
            let recipeKey = Object.keys(meal.recipes)
            for (let k = 0; k < recipeKey.length; k++) {
                let recipe = Dict[3].getRecipe(menuTitle, j, recipeKey[k])
                let ingredientKey = Object.keys(recipe.ingredients)
                for (let l = 0; l < ingredientKey.length; l++) {
                    let ingredient = Dict[3].getIngredient(menuTitle, j, recipeKey[k], ingredientKey[l])
                    if (ingredient.food.shop === shop) {
                        let numberOfRows = u.ID(`shoppingtable${shop}`).rows.length
                        if (numberOfRows === 0) {
                            let cellIDs = []
                            for (let x = 0; x < 3; x++) { // add list of ids to an array
                                cellIDs[x] = `${shop}row${rowNumber}col${x}`
                            }
                            u.CreateRow(`shoppingtable${shop}`, "td", [ingredientKey[l], ingredient.quantityLarge, ingredient.food.unit], cellIDs, [50, 30, 20], "%")
                            rowNumber++;
                        }
                        else {
                            for (let m = 0; m < numberOfRows; m++) {
                                if (u.ID(`${shop}row${m}col0`).innerText === ingredientKey[l]) {
                                    let currentValue = parseFloat(u.ID(`${shop}row${m}col1`).innerText)
                                    let newValue = currentValue + ingredient.quantityLarge
                                    u.ID(`${shop}row${m}col1`).innerText = newValue
                                    break;
                                }
                                else if (m === numberOfRows - 1) {
                                    let cellIDs = []
                                    for (let x = 0; x < 3; x++) {
                                        cellIDs[x] = `${shop}row${rowNumber}col${x}`
                                    }
                                    u.CreateRow(`shoppingtable${shop}`, "td", [ingredientKey[l], ingredient.quantityLarge, ingredient.food.unit], cellIDs, [50, 30, 20], "%")
                                    rowNumber++;
                                }
                                else { continue }
                            }
                        }
                    }
                }
            }
        }
        let numberOfRows = u.ID(`shoppingtable${shop}`).rows.length
        for (let n = 0; n < numberOfRows; n++) {
            let col = []
            col[0] = u.ID(`${shop}row${n}col0`)
            col[1] = u.ID(`${shop}row${n}col1`)
            col[2] = u.ID(`${shop}row${n}col2`)
            let unit = null
            let quantityLarge = parseFloat(col[1].innerText);
            if (col[2].innerText !== null) {
                unit = col[2].innerText
            }
            let display = u.DisplayIngredient(null, quantityLarge, unit)
            col[1].innerText = display[1]
            col[2].innerText = display[2]
        }
    }
}

// add event listeners for each shop to hide/show relevant div
for (let i = 0; i < d.shopEnum.length; i++) {
    u.ID(`shoppingbtn${d.shopEnum[i]}`).addEventListener("click", function () { ShowShoppingDiv(i) }
    )
}
/** show a given shopping div and hide the rest
 * @param {number} i the number of the shop (0=bakers, etc.) */
function ShowShoppingDiv(i) {
    for (let j = 0; j < d.shopEnum.length; j++) {
        if (i === j) {
            u.ShowElement(`shoppingdiv${d.shopEnum[j]}`, "block")
        }
        else {
            u.HideElement(`shoppingdiv${d.shopEnum[j]}`)
        }
    }
}

module.exports = {
    RefreshLists: RefreshLists, // refresh shopping lists in response to new menu
}