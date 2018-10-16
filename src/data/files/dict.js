var remote = require('electron').remote;
var fs = require('fs');
var Config = require('./config.js')

const Dict = {};

Dict.foods = {
   addFood(obj) //add a food to t1
   {
      console.log(Config);
      if (typeof obj.thing != "string") {
         console.log(`invalid input: ${thing} not a string`);
      } else if (typeof obj.unit != "string") {
         console.log(`invalid input: ${unit} not a string`);
      } else if (Config.enums.shopEnum.indexOf(obj.shop) < 0) {
         console.log(`invalid input: ${shop} not in the shop enum`);
      } else {
         this[obj.thing.toLowerCase()] = {
            unit: obj.unit === "" ? null : obj.unit,
            shop: obj.shop,
            foodType: obj.foodType,
            recipeRefCnt: 0
         };
         this.addAllergens(obj.thing, obj.allergens);
      }
   },
   addAllergens(thing, allergens) {
      //special case for empty string
      if (allergens.length === 1 && allergens[0].length === 0) {
         this[thing].allergens = [];
      } else {
         this[thing].allergens = allergens.sort();
         allergens.forEach(allergen => {
            if (Config.enums.allergenEnum.indexOf(allergen) < 0 && allergen !== "") {
               Config.addEnumItem(allergen, "allergenEnum");
            }
         });
         Config.enums.allergenEnum = Config.enums.allergenEnum.sort();
      }
   },
   getFood(x) {
      return this[x];
   },
   deleteItem(x) {
      delete this[x];
   },
};
Dict.recipes = {
   addRecipe(recipeTitle, mealType, morv, serves, method, recipeType) {
      if (typeof recipeTitle != "string") {
         console.log(`invalid input: ${recipeTitle} not a string`);
      } else if (Config.enums.mealTypeEnum.indexOf(mealType) < 0) {
         console.log(`invalid input: ${mealType} not in the mealType enum`);
      } else if (Config.enums.recipeTypeEnum.indexOf(recipeType) < 0) {
         console.log(`invalid input: ${recipeType} not in the recipeType enum`);
      } else if (typeof morv != "object") {
         console.log(`invalid input: ${morv} not an object`);
      } else if (typeof method != "string") {
         console.log(`invalid input: ${method} not a string`);
      } else if (typeof serves != "number") {
         console.log(`invalid input: ${serves} not a number`);
      } else {
         this[recipeTitle] = {
            mealType: mealType,
            morv: morv,
            serves: serves,
            method: method,
            recipeType: recipeType,
            ingredients: []
         };
      }
   },
   addIngredient(recipeTitle, foodName, quantity, morv) {
      console.log('adding ingredient');
      if (typeof foodName != "string") {
         console.log(`invalid input: ${foodName} not a string`);
      } else if (typeof quantity != "number") {
         console.log(`invalid input: ${quantity} not a number`);
      } else if (Config.enums.morvEnum.indexOf(morv) < 0) {
         console.log(`invalid input: ${morv} not in the morv enum`);
      } else {
         this[recipeTitle].ingredients.push({
            foodName: foodName,
            morv: morv,
            quantity: quantity
         });
         //increase the recipe Ref Cnt
         Dict.foods[foodName].recipeRefCnt++
      }
   },
   getRecipe(x) {
      return this[x];
   },
   getIngredient(x, y) {
      return this[x].ingredients[y];
   },
   deleteItem(x) {
      this[x].ingredients.forEach(ingredient => {
         Dict.foods[ingredient.foodName].recipeRefCnt--
      });
      delete this[x];
   },
};
Dict.menus = {
   addMenu(menuTitle, startDate, endDate) {
      if (typeof menuTitle != "string") {
         console.log(`invalid input: ${menuTitle} not a string`);
      } else {
         this[menuTitle] = {
            startDate: startDate,
            endDate: endDate,
            meateaters: null,
            vegetarians: null,
            meals: []
         };
      }
   },
   addMeal(menuTitle, mealType, date) {
      if (typeof menuTitle != "string") {
         console.log(`invalid input: ${menuTitle} not a string`);
      } else if (Config.enums.mealTypeEnum.indexOf(mealType) < 0) {
         console.log(`invalid input: ${mealType} not in the mealType enum`);
      } else if (typeof date != "object") {
         console.log(`invalid input: ${date} not an object`);
      } else {
         let newMeal = {
            mealType: mealType,
            date: date,
            recipes: []
         };
         if (this[menuTitle].meals.length === 0) {
            this[menuTitle].meals[0] = newMeal;
         } else {
            for (let i = 0; i < this[menuTitle].meals.length; i++) {
               let compare = CompareMeal(newMeal, this[menuTitle].meals[i]);
               if (compare === 0) {
                  console.log("tried to add repeated meal. Meal not added.");
                  break;
               } else if (compare === 1 && i === this[menuTitle].meals.length - 1) { // check if the meal needs to go at the end of the array
                  this[menuTitle].meals[i + 1] = newMeal;
                  break;
               } else if (compare === -1) {
                  this[menuTitle].meals.splice(i, 0, newMeal);
                  break;
               }
            }
         }
      }
   },
   addRecipe(menuTitle, mealID, recipeTitle, morv) {
      if (typeof menuTitle != "string") {
         console.log(`invalid input: ${menuTitle} not a string`);
      } else if (typeof mealID != "number") {
         console.log(`invalid input: ${mealID} not a number`);
      } else if (typeof recipeTitle != "string") {
         console.log(`invalid input: ${recipeTitle} not a string`);
      } else if (Config.enums.recipeMorv.indexOf(morv) < 0) {
         console.log(`invalid input: ${morv} not in the morv enum`);
      } else {
         let meal = this[menuTitle].meals[mealID];

         //check if recipe already exists in this meal
         meal.recipes.forEach(recipe => {
            if (recipe.recipeTitle === recipeTitle) {
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
         } else {
            for (let i = 0; i < meal.recipes.length; i++) {
               var existingRecipe = meal.recipes[i];

               let compare = CompareRecipe(newRecipe.recipeTitle, existingRecipe.recipeTitle);

               if (compare === 1 && i === meal.recipes.length - 1) { // check if the recipe needs to go at the end of the array
                  meal.recipes[i + 1] = newRecipe;
                  newRecipeid = i + 1;
                  break;
               } else if (compare === -1) {
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
      thisMeal.modifier = {
         meateaters: parseInt(meateaters),
         vegetarians: parseInt(vegetarians)
      };
   },

   addComments(menuTitle, mealID, recipeID, comments) {
      this.getRecipe(menuTitle, mealID, recipeID).comments = comments;
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
   deleteItem(x) {
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

Dict.getDict = function(dictID) {
   var mapping = [null, 'foods', 'recipes', 'menus'];
   return this[mapping[dictID]];
}

var update_event = new CustomEvent('update', {
   detail: {
      global: true,
      type: 'dict'
   }
});
Dict.read = function(backupFlag) {
   var coreOrBackup = backupFlag === 'backup' ? 'backup' : 'core';
   var fileName = remote.getGlobal('sharedObject').fileNames[coreOrBackup].dict;
   let input = JSON.parse(fs.readFileSync("./resources/" + fileName, {
      encoding: "utf8"
   }));
   //read in dicts
   for (var dictKey in input) {
      for (var thing in input[dictKey]) {
         if (input[dictKey].hasOwnProperty(thing)) {
            Dict[dictKey][thing] = input[dictKey][thing];
         }
      }
   }
   console.log('reading dict');
   window.dispatchEvent(update_event);
};

Dict.write = function(backupFlag) {
   var coreOrBackup = backupFlag === 'backup' ? 'backup' : 'core';
   var fileName = remote.getGlobal('sharedObject').fileNames[coreOrBackup].dict;
   fs.writeFileSync(`./resources/${fileName}`, JSON.stringify(Dict), {
      encoding: "utf8"
   });
   window.dispatchEvent(update_event);
}

Dict.clear = function() {
   Object.keys(dict).forEach(dictKey => {
      let ea = dict[dictKey];
      Object.keys(dict[dictKey]).forEach(key => {
         if (typeof ea[key] != 'function') {
            delete ea[key];
         }
      });
   });
}

//---------------- HELPERS ----------------
function CompareRecipe(aName, bName) {
   function isDessert(recipeType) {
      return recipeType === 'dessert c' || recipeType === 'dessert other' ? true : false;
   }
   let a = Dict.recipes[aName];
   let b = Dict.recipes[bName];
   let e = Config.enums;

   if (a.morv === 'sp' && b.morv !== 'sp') {
      if (isDessert(a.recipeType) === isDessert(b.recipeType)) {
         //if they are both desserts or both not desserts, then b goes first.
         return 1;
      }
      if (!isDessert(a.recipeType) && isDessert(b.recipeType)) {
         //if a is not a dessert, and b is a dessert, then a goes first
         return -1
      } else {
         //else a must be a dessert and b not be a dessert, so b goes first
         return 1;
      }
   } else if (e.recipeTypeEnum.indexOf(a.recipeType) > e.recipeTypeEnum.indexOf(b.recipeType)) {
      return 1;
   } else if (e.recipeTypeEnum.indexOf(a.recipeType) < e.recipeTypeEnum.indexOf(b.recipeType)) {
      return -1;
   } else if (e.recipeMorv.indexOf(a.morv) > e.recipeMorv.indexOf(b.morv)) {
      return 1;
   } else if (e.recipeMorv.indexOf(a.morv) < e.recipeMorv.indexOf(b.morv)) {
      return -1;
   } else if (aName > bName) {
      return 1;
   } else if (aName < bName) {
      return -1;
   } else return 0;
   // 1 means a is after b, -1 means a should be before b
}

/**compares meal type to identify if meal[a] is before or after meal[b] (including date and meal type). Returns 1 if a is after b, and -1 if a is before b. Returns 0 if a=b.
 * @param {string} a the key for meal a
 * @param {string} b the key for meal b
 */
function CompareMeal(a, b) {
   let e = Config.enums;
   let aDate = new Date(a.date);
   let bDate = new Date(b.date);
   let comparison = 0;
   if (aDate > bDate) {
      comparison = 1;
   } else if (aDate < bDate) {
      comparison = -1;
   } else if (e.mealTypeEnum.indexOf(a.mealType) > e.mealTypeEnum.indexOf(b.mealType)) {
      comparison = 1;
   } else if (e.mealTypeEnum.indexOf(a.mealType) < e.mealTypeEnum.indexOf(b.mealType)) {
      comparison = -1;
   }
   return comparison; // 1 means a is after b, -1 means a should be before b
}

module.exports = Dict;