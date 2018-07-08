var fs = require("fs");

// create data structures (dictionaries and enums)
/* 3 dictionaries:
Dict[1] - food
Dict[2] - recipes > ingredients > food
Dict[3] - menus > meals > recipes > ingredients > food
Dict[4] - enum of enums */

const Dict = []

Dict[1] = {
    addFood(thing, unit, shop, foodType, allergens) //add a food to t1
    {
        if (typeof thing != "string") { console.log(`invalid input: ${thing} not a string`) }
        else if (typeof unit != "string" && unit != null) { console.log(`invalid input: ${unit} not a string or null`) }
        else if (Dict[4].shopEnum.indexOf(shop) < 0) { console.log(`invalid input: ${shop} not in the shop enum`) }
        else {
            this[thing] = { unit: unit, shop: shop, foodType: foodType }; 
            this.addAllergens(thing,allergens);
        }
    },
    addAllergens(thing,allergens){
        this[thing].allergens = allergens.sort();
        allergens.forEach(allergen => {
            if (Dict[4].allergenEnum.indexOf(allergen) < 0 && allergen !== "") {
                Dict[4].addItem(allergen, "allergenEnum")
            }
        })
        Dict[4].allergenEnum = Dict[4].allergenEnum.sort();
    },
    getFood(x) {
        return this[x]
    },
    deleteFood(x) {
        delete this[x]
    },
    importJSON() {
        let input = JSON.parse(fs.readFileSync("./resources/Dict[1].json", { encoding: "utf8" }))
        for (var thing in input) {
            if (input.hasOwnProperty(thing)) {
                this[thing] = input[thing]
            }
        }
    },
};
Dict[2] = {
    addRecipe(recipeTitle, mealType, morv, serves, method, recipeType) {
        if (typeof recipeTitle != "string") { console.log(`invalid input: ${recipeTitle} not a string`) }
        else if (Dict[4].mealTypeEnum.indexOf(mealType) < 0) { console.log(`invalid input: ${mealType} not in the mealType enum`) }
        else if (Dict[4].recipeTypeEnum.indexOf(recipeType) < 0) { console.log(`invalid input: ${recipeType} not in the recipeType enum`) }
        else if (typeof morv != "object") { console.log(`invalid input: ${morv} not an object`) }
        else if (typeof method != "string") { console.log(`invalid input: ${method} not a string`) }
        else if (typeof serves != "number") { console.log(`invalid input: ${serves} not a number`) }
        else { this[recipeTitle] = { mealType: mealType, morv: morv, serves: serves, method: method, recipeType: recipeType, ingredients: {} }; }
    },
    addIngredient(recipeTitle, foodName, quantitySmall, morv) {
        if (typeof foodName != "string") { console.log(`invalid input: ${foodName} not a string`) }
        //    else if (!(foodName in obj)) {console.log(`invalid input: ${foodName} isn't in Dict[1]`)}
        else if (typeof quantitySmall != "number") { console.log(`invalid input: ${quantitySmall} not a number`) }
        else if (Dict[4].morvEnum.indexOf(morv) < 0) { console.log(`invalid input: ${morv} not in the morv enum`) }
        else {
            let t1Food = Dict[1][foodName]
            this[recipeTitle].ingredients[foodName] = { food: [], morv: morv, quantitySmall: quantitySmall, quantityLarge: null };
            this[recipeTitle].ingredients[foodName].food = { thing: t1Food.thing, unit: t1Food.unit, shop: t1Food.shop };
        }
    },
    getRecipe(x) {
        return this[x]
    },
    getIngredient(x, y) {
        return this[x].ingredients[y]
    },
    getFood(x, y) {
        return this[x].ingredients[y].food
    },
    deleteRecipe(x) {
        delete this[x]
    },
    importJSON() {
        let input = JSON.parse(fs.readFileSync("./resources/Dict[2].json", { encoding: "utf8" }))
        for (var recipeTitle in input) {
            if (input.hasOwnProperty(recipeTitle)) {
                this[recipeTitle] = input[recipeTitle]
            }
        }
    },
};
Dict[3] = {
    addMenu(menuTitle, startDate, endDate) {
        if (typeof menuTitle != "string") { console.log(`invalid input: ${menuTitle} not a string`) }
        else {
            this[menuTitle] = { startDate: startDate, endDate: endDate, meateaters: null, vegetarians: null, meals: [] };
        }
    },
    addMeal(menuTitle, mealType, date) {
        if (typeof menuTitle != "string") { console.log(`invalid input: ${menuTitle} not a string`) }
        else if (Dict[4].mealTypeEnum.indexOf(mealType) < 0) { console.log(`invalid input: ${mealType} not in the mealType enum`) }
        else if (typeof date != "object") { console.log(`invalid input: ${date} not an object`) }
        else {
            let newMeal = { mealType: mealType, date: date, recipes: [] };
            if (this[menuTitle].meals.length === 0) {
                this[menuTitle].meals[0] = newMeal
            }
            else {
                for (let i = 0; i < this[menuTitle].meals.length; i++) {
                    let u = require("./UtilityFunctions")
                    let compare = u.CompareMeal(newMeal, this[menuTitle].meals[i])
                    if (compare === 0) {
                        console.log("tried to add repeated meal. Meal not added.")
                        break
                    }
                    else if (compare === 1 && i === this[menuTitle].meals.length - 1) { // check if the meal needs to go at the end of the array
                        this[menuTitle].meals[i + 1] = newMeal; break
                    }
                    else if (compare === -1) {
                        this[menuTitle].meals.splice(i, 0, newMeal); break
                    }
                }
            }
        }
    },
    addRecipe(menuTitle, mealID, recipeTitle, morv) {
        let t2Recipe = Dict[2][recipeTitle]
        if (typeof menuTitle != "string") { console.log(`invalid input: ${menuTitle} not a string`) }
        else if (typeof mealID != "number") { console.log(`invalid input: ${mealID} not a number`) }
        else if (typeof recipeTitle != "string") { console.log(`invalid input: ${recipeTitle} not a string`) }
        else if (Dict[4].morvEnum.indexOf(morv) < 0) { console.log(`invalid input: ${morv} not in the morv enum`) }
        else {
            let newRecipeid
            let meal = this[menuTitle].meals[mealID]
            let newRecipe =
                {
                    recipeTitle: recipeTitle,
                    mealType: t2Recipe.mealType,
                    morv: morv, // inherits morv from input (user chooses morv for this instance of the recipe)
                    serves: t2Recipe.serves,
                    method: t2Recipe.method,
                    recipeType: t2Recipe.recipeType,
                    ingredients: {}
                }
            if (meal.recipes.length === 0) { // if there are no existing recipes. newRecipe is recipe[0]
                meal.recipes[0] = newRecipe
                newRecipeid = 0
            }
            else {
                for (let i = 0; i < meal.recipes.length; i++) {
                    let u = require("./UtilityFunctions")
                    let compare = u.CompareRecipe(newRecipe, meal.recipes[i])
                    if (compare === 0) {
                        console.log("tried to add repeated recipe. Recipe not added.")
                        return "error"
                    }
                    else if (compare === 1 && i === meal.recipes.length - 1) { // check if the recipe needs to go at the end of the array
                        meal.recipes[i + 1] = newRecipe; newRecipeid = i + 1; break
                    }
                    else if (compare === -1) {
                        meal.recipes.splice(i, 0, newRecipe); newRecipeid = i; break
                    }
                }
            }
            if (morv === "v" && t2Recipe.morv.indexOf("b") === 0) {
                let ingredientsKey = Object.keys(t2Recipe.ingredients)
                for (let j = 0; j < ingredientsKey.length - 1; j++) {
                    let ingredientName = ingredientsKey[j]
                    let ingredient = t2Recipe.ingredients[ingredientName]
                    if (ingredient.morv === "m") { continue }
                    this[menuTitle].meals[mealID].recipes[newRecipeid].ingredients[ingredientName] = ingredient
                }
            }
            else if (morv === "m" && t2Recipe.morv.indexOf("b") === 0) {
                let ingredientsKey = Object.keys(t2Recipe.ingredients)
                for (let j = 0; j < ingredientsKey.length - 1; j++) {
                    let ingredientName = ingredientsKey[j]
                    let ingredient = t2Recipe.ingredients[ingredientName]
                    if (ingredient.morv === "v") { continue }
                    this[menuTitle].meals[mealID].recipes[newRecipeid].ingredients[ingredientName] = ingredient
                }
            }
            else { this[menuTitle].meals[mealID].recipes[newRecipeid].ingredients = t2Recipe.ingredients }
        }
        if (typeof this[menuTitle].meateaters === "number") {
            this.multiplyUp(menuTitle, this[menuTitle].meateaters, this[menuTitle].vegetarians)
        }
    },
    changeAllergyType(menuTitle, personName, allergens, foods, morv){
        if (!this[menuTitle].specials) this[menuTitle].specials = {};
        this[menuTitle].specials[personName] = {
            allergens:allergens ? allergens : [],
            foods:foods ? foods : [],
            morv:morv 
        }
        Dict[4].specialsEnum[personName] = this[menuTitle].specials[personName]
    },
    multiplyUp(menuTitle, meateaters, vegetarians) {
        this[menuTitle].meateaters = meateaters
        this[menuTitle].vegetarians = vegetarians
        for (var mealKey in Dict[3][menuTitle].meals) {
            if (this[menuTitle].meals.hasOwnProperty(mealKey)) {
                for (var recipeKey in this[menuTitle].meals[mealKey].recipes) {
                    if (this.getMeal(menuTitle, mealKey).recipes.hasOwnProperty(recipeKey)) {
                        let recipe = this.getRecipe(menuTitle, mealKey, recipeKey)
                        for (var ingredientKey in recipe.ingredients) {
                            if (recipe.ingredients.hasOwnProperty(ingredientKey)) {
                                let ingredient = this.getIngredient(menuTitle, mealKey, recipeKey, ingredientKey)
                                if (recipe.morv === "m") {
                                    ingredient.quantityLarge = (ingredient.quantitySmall / recipe.serves) * this[menuTitle].meateaters
                                }
                                else if (recipe.morv === "v") {
                                    ingredient.quantityLarge = (ingredient.quantitySmall / recipe.serves) * this[menuTitle].vegetarians
                                }
                                else if (recipe.morv === "b") {
                                    ingredient.quantityLarge = (ingredient.quantitySmall / recipe.serves) * (this[menuTitle].vegetarians + this[menuTitle].meateaters)
                                }
                                else if (recipe.morv === null) {
                                    if (ingredient.morv === "v") {
                                        ingredient.quantityLarge = (ingredient.quantitySmall / recipe.serves) * this[menuTitle].vegetarians
                                    }
                                    else if (ingredient.morv === "m") {
                                        ingredient.quantityLarge = (ingredient.quantitySmall / recipe.serves) * this[menuTitle].meateaters
                                    }
                                    else if (ingredient.morv === "b") {
                                        ingredient.quantityLarge = (ingredient.quantitySmall / recipe.serves) * (this[menuTitle].vegetarians + this[menuTitle].meateaters)
                                    }
                                    else { console.log(`invalid ingredient morv: ${ingredient.morv}`) }
                                }
                                else { console.log(`invalid recipe morv: ${recipe.morv}`) }

                            }
                        }
                    }
                }
            }
        }
    },
    getMenu(x) {
        return this[x]
    },
    getMeal(x, y) {
        return this[x].meals[y]
    },
    getRecipe(x, y, z) {
        return this[x].meals[y].recipes[z]
    },
    getIngredient(x, y, z, a) {
        return this[x].meals[y].recipes[z].ingredients[a]
    },
    getFood(x, y, z, a) {
        return this[x].meals[y].recipes[z].ingredients[a].food
    },
    deleteMenu(x) {
        delete this[x]
    },
    // need to add deleteMeal function
    deleteMeal(menuTitle, mealID) {
        this[menuTitle].meals.splice(mealID, 1)
    },
    deleteRecipe(menuTitle, mealID, recipeID) {
        this[menuTitle].meals[mealID].recipes.splice(recipeID, 1)
    },
    importJSON() {
        var input = null;
        try { input = JSON.parse(fs.readFileSync("./resources/Dict[3].json", { encoding: "utf8" })) }
        catch (e) {
            if (e) { console.log("Exception captured during json parsing " + e) }
        }

        if (input) //checks if input has been initialised
        {
            for (var menuTitle in input) {
                if (input.hasOwnProperty(menuTitle)) {
                    this[menuTitle] = input[menuTitle]
                }
            }
        }
    },
};
Dict[4] = {
    addItem(itemName,enumName) //add an item to an enum
    {
        let enumEnum = Object.keys(Dict[4])
        if (typeof itemName != "string") { console.log(`invalid input: ${itemName} not a string`) }
        else if (enumEnum.indexOf(enumName) < 0) { console.log(`invalid input: ${enumName} not in the enum enum`) }
        else{
            this[enumName].push(itemName)
        }
    },
    deleteItem(itemName,enumName) {
        delete this[enumName][itemName]
    },
    importJSON() {
        let input = JSON.parse(fs.readFileSync("./resources/Dict[4].json", { encoding: "utf8" }))
        for (var thing in input) {
            if (input.hasOwnProperty(thing)) {
                this[thing] = input[thing]
            }
        }
    },
};
Dict[5] = {};

module.exports = {
    Dict: Dict,
}