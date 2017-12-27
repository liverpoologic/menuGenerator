// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
"use strict"
var fs = require ("fs");


/*create dictionaries below.
3 dictionaries:
t1 - food
t2 - recipes > ingredients > food
t3 - menus > meals > recipes > ingredients > food
*/

// create t1FoodDict
const t1FoodDict =
{
  addFood (thing,unit,shop) //add a food to t1
  { 
    if (typeof thing != "string") {alert(`invalid input: ${thing} not a string`)}
    else if (typeof unit != "string" && unit != null) {alert(`invalid input: ${unit} not a string or null`)}
    else if (shopEnum.indexOf(shop)<0){alert(`invalid input: ${shop} not in the shop enum`)}
    else { this[thing] = {unit:unit,shop:shop}; }
  },
  getFood(x) {
  return this[x]
  },
  importJSON(){
    let input = JSON.parse(fs.readFileSync("t1FoodDict.json",{encoding:"utf8"}))
    for (var thing in input)
    {
      if (input.hasOwnProperty(thing))
      {
        this[thing]=input[thing]
      }
    }
  },
};

//console.log(t1FoodDict["egg"].shop)

// create t2RecipeDict
const t2RecipeDict =
{
  addRecipe (recipeTitle, mealType, morv, serves, method, recipeType)
  {
    if (typeof recipeTitle != "string") {alert(`invalid input: ${recipeTitle} not a string`)}
    else if (mealTypeEnum.indexOf(mealType)<0){alert(`invalid input: ${mealType} not in the mealType enum`)}  
    else if (recipeTypeEnum.indexOf(recipeType)<0){alert(`invalid input: ${recipeType} not in the recipeType enum`)}
    else if (typeof morv != "string") {alert(`invalid input: ${morv} not a string`)}
    else if (typeof method != "string") {alert(`invalid input: ${method} not a string`)}
    else if (typeof serves != "number") {alert(`invalid input: ${serves} not a number`)}
    else {this[recipeTitle] = {mealType:mealType,morv:morv,serves:serves,method:method,recipeType:recipeType,ingredients:{}}; }
  },
  addIngredient (recipeTitle,foodName,quantitySmall,morv) {
    if (typeof foodName != "string") {alert(`invalid input: ${foodName} not a string`)}
    else if (!(foodName in obj)) {alert(`invalid input: ${foodName} isn't in t1FoodDict`)}
    else if (typeof quantitySmall != "number") {alert(`invalid input: ${quantitySmall} not a number`)}
    else if (morvEnum.indexOf(morv)<0){alert(`invalid input: ${morv} not in the morv enum`)}
    else {
        let t1Food = t1FoodDict[foodName]
        this[recipeTitle].ingredients[foodName] = {food:[],morv:morv,quantitySmall:quantitySmall,quantityLarge:null};
        this[recipeTitle].ingredients[foodName].food = {thing:t1Food.thing, unit:t1Food.unit, shop:t1Food.shop};    
    }
  },
  getRecipe(x) {
  return this[x]
  },
  getIngredient(x,y) {
    return this[x].ingredients[y]
  },
  getFood(x,y) {
    return this[x].ingredients[y].food
  },
  importJSON(){
    let input = JSON.parse(fs.readFileSync("t2RecipeDict.json",{encoding:"utf8"}))
    for (var recipeTitle in input) {
    if (input.hasOwnProperty(recipeTitle)) {
        this[recipeTitle]=input[recipeTitle]
      }
    }
  },
};

//console.log(t2RecipeDict["scrambled eggs"].ingredients["egg"].food.unit)

const t3MenuDict =
{
  addMenu (menuTitle,startDate,endDate) {
    if (typeof menuTitle != "string") {alert(`invalid input: ${menuTitle} not a string`)}
    else if (typeof startDate != "object") {alert(`invalid input: ${startDate} not an object`)}
    else if (typeof endDate != "object") {alert(`invalid input: ${endDate} not an object`)}
    else {
      this[menuTitle] = {startDate:startDate,endDate:endDate,meateaters:null,vegetarians:null,meals:[]};
    }
  },
  addMeal (menuTitle,mealType,date) {
    if (typeof menuTitle != "string") {alert(`invalid input: ${menuTitle} not a string`)}
    else if (mealTypeEnum.indexOf(mealType)<0){alert(`invalid input: ${mealType} not in the mealType enum`)}
    else if (typeof date != "object") {alert(`invalid input: ${date} not an object`)}
    else {
      let i = this[menuTitle].meals.length;
      this[menuTitle].meals[i] = {mealType:mealType, date:date, recipes:{}};
      }
  },
  addRecipe (menuTitle,mealID,recipeTitle,morv) {
    let t2Recipe = t2RecipeDict[recipeTitle]
    if (typeof menuTitle != "string") {alert(`invalid input: ${menuTitle} not a string`)}
    else if (typeof mealID != "number") {alert(`invalid input: ${mealID} not a number`)}
    else if (typeof recipeTitle != "string") {alert(`invalid input: ${recipeTitle} not a string`)}    
    else if (morvEnum.indexOf(morv)<0){alert(`invalid input: ${morv} not in the morv enum`)}
    else 
    {
      this[menuTitle].meals[mealID].recipes[recipeTitle] =
      {
        mealType:t2Recipe.mealType,
        morv:morv, // inherits morv from input (user chooses morv for this instance of the recipe)
        serves:t2Recipe.serves,
        method:t2Recipe.method,
        recipeType:t2Recipe.recipeType,
        ingredients:t2Recipe.ingredients
      };     
     }
  },  
  multiplyUp (menuTitle,meateaters,vegetarians) {
    this[menuTitle].meateaters = meateaters
    this[menuTitle].vegetarians = vegetarians
    for (var mealKey in t3MenuDict[menuTitle].meals) {
      if(this[menuTitle].meals.hasOwnProperty(mealKey))
      {
        for (var recipeKey in this[menuTitle].meals[mealKey].recipes) {
          if(this.getMeal(menuTitle,mealKey).recipes.hasOwnProperty(recipeKey))
          {
            let recipe = this.getRecipe(menuTitle,mealKey,recipeKey)
            for (var ingredientKey in recipe.ingredients) {
              if(recipe.ingredients.hasOwnProperty(ingredientKey))
              {
                let ingredient = this.getIngredient(menuTitle,mealKey,recipeKey,ingredientKey)
                if (recipe.morv === "m"){
                  ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*this[menuTitle].meateaters
                }
                else if (recipe.morv === "v"){
                  ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*this[menuTitle].vegetarians
                }
                else if (recipe.morv === "b") {
                  ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*(this[menuTitle].vegetarians+this[menuTitle].meateaters)                
                }
                else if (recipe.morv === null){
                  if (ingredient.morv === "v"){
                    ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*this[menuTitle].vegetarians
                  }
                  else if (ingredient.morv === "m"){
                    ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*this[menuTitle].meateaters
                  }
                  else if (ingredient.morv === "b"){
                    ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*(this[menuTitle].vegetarians+this[menuTitle].meateaters)                                    
                  }
                  else {alert(`invalid ingredient morv: ${ingredient.morv}`)}
                }
                else {alert(`invalid recipe morv: ${recipe.morv}`)}
                
              }
            }
          }
        }
      }
    }
  },
  getMenu(x) {
  return t3MenuDict[x]
  },
  getMeal(x,y) {
    return t3MenuDict[x].meals[y]
  },
  getRecipe(x,y,z) {
    return t3MenuDict[x].meals[y].recipes[z]
  },
  getIngredient(x,y,z,a) {
    return t3MenuDict[x].meals[y].recipes[z].ingredients[a]
  },
  getFood(x,y,z,a) {
    return t3MenuDict[x].meals[y].recipes[z].ingredients[a].food
  },
  importJSON(){
    let input = JSON.parse(fs.readFileSync("t3MenuDict.json",{encoding:"utf8"}))
    for (var menuTitle in input) {
      if (input.hasOwnProperty(menuTitle)) {
        this[menuTitle]=input[menuTitle]
      }
    }
  },
};

t1FoodDict.importJSON()
t2RecipeDict.importJSON()
t3MenuDict.importJSON()
