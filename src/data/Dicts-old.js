var fs = require("fs");

// create data structures (dictionaries and enums)
/* 3 dictionaries:
Dict.foods - food
Dict.recipes - recipes > ingredients > food
Dict.menus - menus > meals > recipes > ingredients > food
Config -  enums and settings */

const Dict = {};
const Config = {};

Dict.foods = {
  addFood(thing, unit, shop, foodType, allergens) //add a food to t1
  {
    if (typeof thing != "string") { console.log(`invalid input: ${thing} not a string`); }
    else if (typeof unit != "string" && unit != null) { console.log(`invalid input: ${unit} not a string or null`); }
    else if (Config.enums.shopEnum.indexOf(shop) < 0) { console.log(`invalid input: ${shop} not in the shop enum`); }
    else {
      this[thing] = { unit: unit, shop: shop, foodType: foodType };
      this.addAllergens(thing, allergens);
    }
  },
  addAllergens(thing, allergens) {
    //special case for empty string
    if (allergens.length === 1 && allergens[0].length === 0) {
      this[thing].allergens = [];
    }
    else {
      this[thing].allergens = allergens.sort();
      allergens.forEach(allergen => {
        if (Config.enums.allergenEnum.indexOf(allergen) < 0 && allergen !== "") {
          Config.enums.addItem(allergen, "allergenEnum");
        }
      });
      Config.enums.allergenEnum = Config.enums.allergenEnum.sort();
    }
  },
  getFood(x) {
    return this[x];
  },
  deleteFood(x) {
    delete this[x];
  },
};
Dict.recipes = {
  addRecipe(recipeTitle, mealType, morv, serves, method, recipeType) {
    if (typeof recipeTitle != "string") { console.log(`invalid input: ${recipeTitle} not a string`); }
    else if (Config.enums.mealTypeEnum.indexOf(mealType) < 0) { console.log(`invalid input: ${mealType} not in the mealType enum`); }
    else if (Config.enums.recipeTypeEnum.indexOf(recipeType) < 0) { console.log(`invalid input: ${recipeType} not in the recipeType enum`); }
    else if (typeof morv != "object") { console.log(`invalid input: ${morv} not an object`); }
    else if (typeof method != "string") { console.log(`invalid input: ${method} not a string`); }
    else if (typeof serves != "number") { console.log(`invalid input: ${serves} not a number`); }
    else { this[recipeTitle] = { mealType: mealType, morv: morv, serves: serves, method: method, recipeType: recipeType, ingredients: [] }; }
  },
  addIngredient(recipeTitle, foodName, quantity, morv) {
    console.log('adding ingredient');
    if (typeof foodName != "string") { console.log(`invalid input: ${foodName} not a string`); }
    else if (typeof quantity != "number") { console.log(`invalid input: ${quantity} not a number`); }
    else if (Config.enums.morvEnum.indexOf(morv) < 0) { console.log(`invalid input: ${morv} not in the morv enum`); }
    else {
      let t1Food = Dict.foods[foodName];
      this[recipeTitle].ingredients.push({foodName:foodName, morv: morv, quantity: quantity });
    }
  },
  getRecipe(x) {
    return this[x];
  },
  getIngredient(x, y) {
    return this[x].ingredients[y];
  },
  deleteRecipe(x) {
    delete this[x];
  },
};
Dict.menus = {
  addMenu(menuTitle, startDate, endDate) {
    if (typeof menuTitle != "string") { console.log(`invalid input: ${menuTitle} not a string`); }
    else {
      this[menuTitle] = { startDate: startDate, endDate: endDate, meateaters: null, vegetarians: null, meals: [] };
    }
  },
  addMeal(menuTitle, mealType, date) {
    if (typeof menuTitle != "string") { console.log(`invalid input: ${menuTitle} not a string`); }
    else if (Config.enums.mealTypeEnum.indexOf(mealType) < 0) { console.log(`invalid input: ${mealType} not in the mealType enum`); }
    else if (typeof date != "object") { console.log(`invalid input: ${date} not an object`); }
    else {
      let newMeal = { mealType: mealType, date: date, recipes: [] };
      if (this[menuTitle].meals.length === 0) {
        this[menuTitle].meals[0] = newMeal;
      }
      else {
        for (let i = 0; i < this[menuTitle].meals.length; i++) {
          let u = require("./UtilityFunctions");
          let compare = u.CompareMeal(newMeal, this[menuTitle].meals[i]);
          if (compare === 0) {
            console.log("tried to add repeated meal. Meal not added.");
            break;
          }
          else if (compare === 1 && i === this[menuTitle].meals.length - 1) { // check if the meal needs to go at the end of the array
            this[menuTitle].meals[i + 1] = newMeal; break;
          }
          else if (compare === -1) {
            this[menuTitle].meals.splice(i, 0, newMeal); break;
          }
        }
      }
    }
  },
  addRecipe(menuTitle, mealID, recipeTitle, morv) {
    if (typeof menuTitle != "string") { console.log(`invalid input: ${menuTitle} not a string`); }
    else if (typeof mealID != "number") { console.log(`invalid input: ${mealID} not a number`); }
    else if (typeof recipeTitle != "string") { console.log(`invalid input: ${recipeTitle} not a string`); }
    else if (Config.enums.recipeMorv.indexOf(morv) < 0) { console.log(`invalid input: ${morv} not in the morv enum`); }
    else {
      let meal = this[menuTitle].meals[mealID];

      //check if recipe already exists in this meal
      meal.recipes.forEach(recipe => {
        if(recipe.recipeTitle === recipeTitle){
          console.log("tried to add repeated recipe. Recipe not added.");
          return "error";
        }
      });

      let newRecipe = {
        recipeTitle: recipeTitle,
        morv: morv, // inherits morv from input (user chooses morv for this instance of the recipe)
      };
      if (meal.recipes.length === 0) { // if there are no existing recipes. newRecipe is recipe[0]
        meal.recipes[0] = newRecipe;
        newRecipeid = 0;
      }
      else {
        for(let i=0; i<meal.recipes.length; i++){
          var existingRecipe = meal.recipes[i];
          let u = require("./UtilityFunctions");

          let compare = u.CompareRecipe(newRecipe.recipeTitle,existingRecipe.recipeTitle);

          if (compare === 1 && i === meal.recipes.length - 1) { // check if the recipe needs to go at the end of the array
            meal.recipes[i + 1] = newRecipe;
            newRecipeid = i + 1;
            break;
          }
          else if (compare === -1) {
            meal.recipes.splice(i, 0, newRecipe);
            newRecipeid = i;
            break;
          }
        }
      }
    }
  },
  changeAllergyType(menuTitle, personName, allergens, foods, morv) {
    if (!this[menuTitle].specials) this[menuTitle].specials = {};
    this[menuTitle].specials[personName] = {
      allergens: allergens ? allergens : [],
      foods: foods ? foods : [],
      morv: morv
    };
    Config.enums.specialsEnum[personName] = this[menuTitle].specials[personName];
  },
  multiplyUp(menuTitle, meateaters, vegetarians) {
    this[menuTitle].meateaters = meateaters;
    this[menuTitle].vegetarians = vegetarians;
  },

  addNumbersModifier(menuTitle, mealID, meateaters, vegetarians) {
    var thisMeal = this[menuTitle].meals[mealID];
    thisMeal.modifier = { meateaters: parseInt(meateaters), vegetarians: parseInt(vegetarians) };
  },

  addComments(menuTitle,mealID,recipeID,comments){
    this.getRecipe(menuTitle,mealID,recipeID).comments = comments;
  },
  getMenu(x) {
    return this[x];
  },
  getMeal(x, y) {
    return this[x].meals[y];
  },
  getRecipe(x, y, z) {
    return this[x].meals[y].recipes[z];
  },
  deleteMenu(x) {
    delete this[x];
  },
  // need to add deleteMeal function
  deleteMeal(menuTitle, mealID) {
    this[menuTitle].meals.splice(mealID, 1);
  },
  deleteRecipe(menuTitle, mealID, recipeID) {
    this[menuTitle].meals[mealID].recipes.splice(recipeID, 1);
  }
};

Config.enums = {
  addItem(itemName, enumName) //add an item to an enum
  {
    let enumEnum = Object.keys(this);
    if (typeof itemName != "string") { console.log(`invalid input: ${itemName} not a string`); }
    else if (enumEnum.indexOf(enumName) < 0) { console.log(`invalid input: ${enumName} not in the enum enum`); }
    else {
      this[enumName].push(itemName);
    }
  },
  deleteItem(itemName, enumName) {
    delete this[enumName][itemName];
  },
};

function ClearDict(dict) {
  Object.keys(dict).forEach(dictKey => {
    let d = dict[dictKey];
    Object.keys(dict[dictKey]).forEach(key => {
      if (typeof d[key] != 'function') {
        delete d[key];
      }
    });
  });
}

function ClearConfig(config){
  for(var prop in config){
    let c = config[prop];
    if (typeof c != 'function') {
      delete config[prop];
    }
  }
}

function GetDict(dictID){
  var mapping = [null,'foods','recipes','menus'];
  return Dict[mapping[dictID]];
}

function MissingItemWizard() {
  var missingFoods = [];
  var missingRecipes = [];

  Object.keys(Dict.menus).forEach(menuTitle => {
    var menu = Dict.menus[menuTitle];
    if (typeof menu !== 'function') {
      menu.meals.forEach(meal => {
        meal.recipes.forEach(recipe => {
          if (!Dict.recipes[recipe.recipeTitle]) {
            missingRecipes.push({ recipeTitle: recipe.recipeTitle, menuTitle: menuTitle });
          }
        });
      });
    }
  });

  Object.keys(Dict.recipes).forEach(recipeTitle => {
    var recipe = Dict.recipes[recipeTitle];
    if (typeof recipe !== 'function') {
      Object.keys(recipe.ingredients).forEach(ingredientName => {
        if (!Dict.foods[ingredientName]) {
          missingFoods.push({ foodName: ingredientName, recipeTitle: recipeTitle });
        }
      });
    }
  });

  console.log('Missing Recipes:');
  console.log(missingRecipes);
  console.log('Missing Foods:');
  console.log(missingFoods);
}


//function RestructureDictionary(){

//
//   Object.keys(Dict.recipes).forEach(recipeTitle => {
//       var recipe = Dict.recipes[recipeTitle];
//       if (typeof recipe !== 'function') {
//         var ingredientsObj = recipe.ingredients;
//         var ingredientsArr = [];
//           Object.keys(ingredientsObj).forEach(ingredientName => {
//             var ingredient = recipe.ingredients[ingredientName];
//             ingredient.foodName = ingredientName
//             ingredientsArr.push(ingredient);
//           });
//           recipe.ingredients = ingredientsArr;
//       }
//   });
//
// }

// function RestructureDictionary(){

// Object.keys(Dict.menus).forEach(menuTitle => {
//     var menu = Dict.menus[menuTitle]
//     if (typeof menu !== 'function') {
//         menu.meals.forEach((meal,i) => {
//             meal.recipes.forEach((recipe,j) => {
//               Dict.menus[menuTitle].meals[i].recipes[j] = {
//                 recipeTitle:recipe.recipeTitle,
//                 morv:recipe.morv,
//               };
//             });
//         });
//     }
// });

// Object.keys(Dict.recipes).forEach(recipeTitle => {
//     var recipe = Dict.recipes[recipeTitle];
//     if (typeof recipe !== 'function') {
//         Object.keys(recipe.ingredients).forEach(ingredientName => {
//           Dict.recipes[recipeTitle].ingredients[ingredientName] = {
//               quantity:Dict.recipes[recipeTitle].ingredients[ingredientName].quantitySmall,
//               morv:Dict.recipes[recipeTitle].ingredients[ingredientName].morv
//           };
//         });
//     }
// });

// }

module.exports = {
  Config:Config,
  Dict: Dict,
  GetDict:GetDict,
  ClearDict: ClearDict,
  ClearConfig:ClearConfig,
  MissingItemWizard: MissingItemWizard
};
