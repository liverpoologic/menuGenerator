// just required in onLoad, not called anywhere else.

var d = require("./Dicts.js")
var u = require("./UtilityFunctions.js")
const ipc = require('electron').ipcRenderer
var Dict = d.Dict
var e = Dict[4]

function onLoad() {
    u.ID("selectViewMenu").addEventListener("change", RefreshViewMenu)
    u.ID("printMenubtn").addEventListener("click", PrintMenu)
}

/** Refresh view menu (triggered when menu is selected) */
function RefreshViewMenu() {
    let menuDiv = u.ID("viewMenuDiv")
    menuDiv.innerHTML = "" //clear the div
    let menuTitle = u.ID("selectViewMenu").value
    let menu = Dict[3].getMenu(menuTitle)
    if (menuTitle === "Menu") { return "no action required" }

    let morvCountTable = u.CreateElement("table", menuDiv, "morvCountTable");
    if (menu.meateaters) u.CreateRow("morvCountTable", "td", ["meateaters: " + menu.meateaters + "   vegetarians: " + menu.vegetarians]);

    menu.meals.forEach((meal, i) => {
        let day = e.weekday[new Date(meal.date).getDay()]
        let mealTitle = u.CreateElement("h3", menuDiv, `mealTitle${i}`, "", `${day} ${meal.mealType}`, "inline-block")

        if (Object.keys(meal.recipes).length > 0) { // if there is a recipe in the meal, print the recipes and hide/show buttons

            let showMealBtn = u.CreateElement("button", menuDiv, `showMealBtn${i}`, "mealbtn", "+", "inline")
            let hideMealBtn = u.CreateElement("button", menuDiv, `hideMealBtn${i}`, "mealbtn", "-", "none")

            showMealBtn.addEventListener("click", function () {
                u.ShowElements(`mealDiv${i}`, "block")
                u.ShowElements(`hideMealBtn${i}`, "inline")
                u.HideElements(`showMealBtn${i}`)
            })
            hideMealBtn.addEventListener("click", function () {
                u.HideElements([`mealDiv${i}`, `hideMealBtn${i}`])
                u.ShowElements(`showMealBtn${i}`, "inline")
            })
        }
        u.CreateElement("br", menuDiv);
        let mealDiv = u.CreateElement("div", menuDiv, `mealDiv${i}`, "mealDiv", "", "none");
        let mCount = meal.modifier ? Number(menu.meateaters) + Number(meal.modifier.meateaters) : menu.meateaters;
        let vCount = meal.modifier ? Number(menu.vegetarians) + Number(meal.modifier.vegetarians) : menu.vegetarians;
        let mealNumbersText = `M: ${mCount} V: ${vCount}`;
        let mealNumbers = u.CreateEl('specials').innerText(mealNumbersText).parent(mealDiv).end();

        // adds recipe 
        meal.recipes.forEach((recipe, j) => {
            let recipeTitle = u.CreateElement("h4", mealDiv, `recipeTitle${i}${j}`, "", `${recipe.recipeTitle} (${recipe.serves}) - ${recipe.morv}`, "inline-block");
            if (recipe.morv === "b") {
                recipeTitle.innerText = `${recipe.recipeTitle} (${recipe.serves})`
            }
            // adds + and - buttons
            var showRecipeBtn = u.CreateElement("button", mealDiv, `showRecipeBtn${i}${j}`, "recipebtn", "+", "inline")
            var hideRecipeBtn = u.CreateElement("button", mealDiv, `hideRecipeBtn${i}${j}`, "recipebtn", "-", "none")

            showRecipeBtn.addEventListener("click", function () {
                u.ShowElements(`recipeDiv${i}${j}`, "block")
                u.ShowElements(`hideRecipeBtn${i}${j}`, "inline")
                u.HideElements(`showRecipeBtn${i}${j}`)
            })

            hideRecipeBtn.addEventListener("click", function () {
                u.HideElements([`recipeDiv${i}${j}`, `hideRecipeBtn${i}${j}`])
                u.ShowElements(`showRecipeBtn${i}${j}`, "inline")
            })

            let recipeDiv = u.CreateElement("div", mealDiv, `recipeDiv${i}${j}`, "recipeDiv")
            u.CreateElement("br", mealDiv)

            let specials = u.CreateElement("specials", recipeDiv, `specials${i}${j}`)
            u.CreateElement("br", recipeDiv)

            let specialsArr = [];

            let ingredientTable = u.CreateElement("table", recipeDiv, `ingredientTable${i}${j}`);

            // get rid of special people who won't eat this meal
            if (menu.specials && recipe.morv !== 'b') {
                var specialPeople = {};
                Object.keys(menu.specials).forEach(personName => {
                    var data = menu.specials[personName];
                    if (data.morv === recipe.morv) {
                        specialPeople[personName] = data
                    }
                })

            }
            else var specialPeople = menu.specials;

            Object.keys(recipe.ingredients).forEach((foodName, k) => {
                let ingredient = Dict[3].getIngredient(menuTitle, i, j, foodName)
                let html = []
                let ids = []
                var allergens = Dict[1].getFood(foodName).allergens;
                if (menu.specials) {
                    Object.keys(specialPeople).forEach(personName => {

                        var dietaryReq = menu.specials[personName];
                        let allergenList = [];
                        if (allergens && dietaryReq.allergens) {
                            allergens.forEach(allergen => {
                                if (dietaryReq.allergens.indexOf(allergen) >= 0) allergenList.push(foodName);
                            });
                        }
                        if (dietaryReq.foods) {
                            if (dietaryReq.foods.indexOf(foodName) >= 0) allergenList.push(foodName);
                        }

                        if (allergenList.length > 0) {
                            specialsArr.push({ personName: personName, foodName: foodName })
                        }
                    })
                }

                if (ingredient.quantityLarge === null) {
                    html = [`(${ingredient.quantitySmall})`, null, ingredient.food.unit]
                }
                else {
                    html = u.DisplayIngredient(ingredient.quantitySmall, ingredient.quantityLarge, ingredient.food.unit)
                }
                html.unshift(foodName)
                for (let x = 0; x < 4; x++) {
                    ids.push(`${i}${j}${k}${x}`)
                }
                u.CreateRow(`ingredientTable${i}${j}`, "td", html, ids, [50, 10, 10, 30], "%")
                u.ID(`${i}${j}${k}1`).style.fontSize = "11px"
            });
            let method = u.CreateElement("p", recipeDiv);
            var methodHTML = recipe.method.replace(/(?:\r\n|\r|\n)/g, '<br><br>');
            method.innerHTML = methodHTML;

            if (specialsArr.length > 0) {

                var specialsObj1 = {}

                specialsArr.forEach(obj => {
                    if (!specialsObj1[obj.personName]) {
                        specialsObj1[obj.personName] = []
                    }
                    specialsObj1[obj.personName].push(obj.foodName)

                })

                var specialsObj2 = {}

                Object.keys(specialsObj1).forEach(person => {
                    var foodJoined = specialsObj1[person].sort().join(", ");
                    if (!specialsObj2[foodJoined]) {
                        specialsObj2[foodJoined] = []
                    }
                    specialsObj2[foodJoined].push(person)
                })


                specialsText = Object.keys(specialsObj2).map(problemFoods => {
                    var people = specialsObj2[problemFoods]
                    return `${people.length} - ${problemFoods} (${people.join(", ")})`
                });
                specialsText.splice(0, 0, 'Specials:');


                specials.innerHTML = specialsText.join('<br>');

                recipeTitle.innerText = `${recipeTitle.innerText} *`
            }
        });
    });
}

/** onclick 'print menu' - calls 'generate print menu' */
function PrintMenu() {
    let menuTitle = u.ID("selectViewMenu").value.replace("/", "-")
    let filePath = u.ID("filepath").value
    let rand = (Math.random() * 1000).toFixed(0)
    if (menuTitle === "Menu") {
        alert("menu not selected - please select menu")
        return false
    }
    else if (filePath === "") {
        alert("file path not chosen; please enter a file path")
        u.ShowElements("settingsModal", "block")
        return false
    }
    u.ShowElements("PrintMenu", "block")
    GeneratePrintMenu()
    u.HideElements("mainApp")
    ipc.send('print-to-pdf', `${filePath}/${menuTitle}_menu_${rand}.pdf`)
}

/** Generate menu to be printed (from view menu tab) */
function GeneratePrintMenu() {
    let menuDiv = u.ID("PrintMenu")
    menuDiv.innerHTML = "" //clear the child div
    let menuTitle = u.ID("selectViewMenu").value
    let menu = Dict[3].getMenu(menuTitle)

    menu.meals.forEach((meal, i) => {
        let day = e.weekday[new Date(meal.date).getDay()]
        let mealTitle = u.CreateElement("h3", menuDiv, `printMealTitle${i}`, "printMealTitle", `${day} ${meal.mealType}`, "block");
        let mealDiv = u.CreateElement("div", menuDiv, `printMealDiv${i}`, "printMealDiv")
        let mCount = meal.modifier ? Number(menu.meateaters) + Number(meal.modifier.meateaters) : menu.meateaters;
        let vCount = meal.modifier ? Number(menu.vegetarians) + Number(meal.modifier.vegetarians) : menu.vegetarians;
        let mealNumbersText = `M: ${mCount} V: ${vCount}`;
        let mealNumbers = u.CreateEl('specials').innerText(mealNumbersText).parent(mealDiv).end();

        u.CreateElement("br", menuDiv);

        // adds recipe 
        meal.recipes.forEach((recipe, j) => {

            let recipeDiv = u.CreateElement("div", mealDiv, `printRecipeDiv${i}${j}`, "printRecipeDiv")
            u.CreateElement("br", mealDiv)

            let recipeTitle = u.CreateElement("h4", recipeDiv, `printRecipeTitle${i}${j}`, "printRecipeTitle", `${recipe.recipeTitle} (${recipe.serves}) - ${recipe.morv}`, "block");
            if (recipe.morv === "b") {
                recipeTitle.innerText = `${recipe.recipeTitle} (${recipe.serves})`
                if (recipe.recipeType === "dessert c") {
                    recipeTitle.className = "printDessertRecipeTitle"
                }
            }
            u.CreateElement("br", mealDiv)
            let specials = u.CreateElement("specials", recipeDiv, `specials${i}${j}`)
            u.CreateElement("br", recipeDiv)

            let specialsArr = [];

            let ingredientTable = u.CreateElement("table", recipeDiv, `printIngredientTable${i}${j}`, "printIngredientTable", "", "block")

            // get rid of special people who won't eat this meal
            if (menu.specials && recipe.morv !== 'b') {
                var specialPeople = {};
                Object.keys(menu.specials).forEach(personName => {
                    var data = menu.specials[personName];
                    if (data.morv === recipe.morv) {
                        specialPeople[personName] = data
                    }
                })

            }
            else var specialPeople = menu.specials;

            Object.keys(recipe.ingredients).forEach((foodName, k) => {
                let ingredient = Dict[3].getIngredient(menuTitle, i, j, foodName)
                let html = []
                let ids = []
                var allergens = Dict[1].getFood(foodName).allergens;
                if (menu.specials) {
                    Object.keys(specialPeople).forEach(personName => {

                        var dietaryReq = menu.specials[personName];
                        let allergenList = [];
                        if (allergens && dietaryReq.allergens) {
                            allergens.forEach(allergen => {
                                if (dietaryReq.allergens.indexOf(allergen) >= 0) allergenList.push(foodName);
                            });
                        }
                        if (dietaryReq.foods) {
                            if (dietaryReq.foods.indexOf(foodName) >= 0) allergenList.push(foodName);
                        }

                        if (allergenList.length > 0) {
                            specialsArr.push({ personName: personName, foodName: foodName })
                        }
                    })
                }

                if (ingredient.quantityLarge === null) {
                    html = [`(${ingredient.quantitySmall})`, null, ingredient.food.unit]
                }
                else {
                    html = u.DisplayIngredient(ingredient.quantitySmall, ingredient.quantityLarge, ingredient.food.unit)
                }
                html.unshift(foodName)
                for (let x = 0; x < 4; x++) {
                    ids.push(`print${i}${j}${k}${x}`)
                }
                u.CreateRow(`printIngredientTable${i}${j}`, "td", html, ids, [50, 10, 10, 30], "%")
                u.ID(`print${i}${j}${k}1`).style.fontSize = "11px"
            });
            let method = u.CreateElement("p", recipeDiv, `printMethod${i}${j}`, "printMethod", "", "block");
            method.innerHTML = recipe.method.replace(/(?:\r\n|\r|\n)/g, '<br><br>');

            if (specialsArr.length > 0) {

                var specialsObj1 = {}

                specialsArr.forEach(obj => {
                    if (!specialsObj1[obj.personName]) {
                        specialsObj1[obj.personName] = []
                    }
                    specialsObj1[obj.personName].push(obj.foodName)

                })

                var specialsObj2 = {}

                Object.keys(specialsObj1).forEach(person => {
                    var foodJoined = specialsObj1[person].sort().join(", ");
                    if (!specialsObj2[foodJoined]) {
                        specialsObj2[foodJoined] = []
                    }
                    specialsObj2[foodJoined].push(person)
                })


                specialsText = Object.keys(specialsObj2).map(problemFoods => {
                    var people = specialsObj2[problemFoods]
                    return `${people.length} - ${problemFoods} (${people.join(", ")})`
                });
                specialsText.splice(0, 0, 'Specials:');


                specials.innerHTML = specialsText.join('<br>');

                recipeTitle.innerText = `${recipeTitle.innerText} *`
            }
        });
    });


}

module.exports = {
    onLoad: onLoad,
    RefreshViewMenu: RefreshViewMenu,
}