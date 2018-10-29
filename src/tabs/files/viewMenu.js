const ipc = require('electron').ipcRenderer;


//TODO fix code so same code used for normal and print menu
//TODO fix styling
//TODO fix printing0
//TODO remove plus button and put at bottom

//
// TODO Right hand strip (info page) includes:
// 1. baseline M/V numbers
// 2. people with allergies



module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var u = require("../../utilities")(DATA);
   var els = {};

   function generator() {

      var tabcontent = u.ID('viewMenu_tab_content');
      els = CreatePageEls(tabcontent)

      els.selectMenu.addEventListener("change", RefreshViewMenu);
      els.printMenu.addEventListener("click", PrintMenu);

      window.addEventListener('update', RefreshPage);

   }

   function CreatePageEls(parentDiv) {
      var els = {};

      els.pgTitle = u.CreateEl('h2').innerText('View Menu').parent(parentDiv).end();
      els.selectMenu = u.CreateEl('select').id('selectViewMenu').parent(parentDiv).style('width:300px').end();
      els.printMenu = u.CreateEl('button').style("margin: 8px 40px; font-size: 19px;recipeIngredientTable padding: 4px 8px;").parent(parentDiv).end();
      u.Icon('file-pdf', els.printMenu);
      els.viewMenuDiv = u.CreateEl('div').parent(parentDiv).end();

      els.subBox = u.CreateEl('div').parent(parentDiv).end();
      els.viewMenuDiv = u.CreateEl('div').style('width:400px; margin:0; float:left').parent(els.subBox).end();
      els.menuInfoDiv = u.CreateEl('div').style('width:375px; margin:0; float:right').parent(els.subBox).end();

      return els;
   }

   function RefreshPage(EV) {
      if (EV.detail.type === 'dict') {
         //refresh list of recipes
         RefreshViewMenu()
      }
   }

   /** Refresh view menu (triggered when menu is selected) */
   function RefreshViewMenu() {
      els.viewMenuDiv.innerHTML = ""; //clear the div
      els.menuInfoDiv.innerHTML = "";
      let menuTitle = els.selectMenu.value;
      let menu = d.menus.getMenu(menuTitle);
      if (menuTitle === "Menu" || !menu) {
         return "no action required";
      }


      menu.meals.forEach((meal, i) => {
         let day = c.enums.weekday[new Date(meal.date).getDay()];
         let mealTitle = u.CreateElement("h3", els.viewMenuDiv, `mealTitle${i}`, "", `${day} ${meal.mealType}`, "inline-block");

         if (Object.keys(meal.recipes).length > 0) { // if there is a recipe in the meal, print the recipes and hide/show buttons

            let showMealBtn = u.CreateEl('button').className('mealbtn').id(`showMealBtn${i}`).parent(els.viewMenuDiv).style('display:inline').end();
            u.Icon('plus', showMealBtn);

            let hideMealBtn = u.CreateEl('button').className('mealbtn').id(`hideMealBtn${i}`).parent(els.viewMenuDiv).style('display:none').end();
            u.Icon('minus', hideMealBtn);

            showMealBtn.addEventListener("click", function() {
               u.ShowElements(`mealDiv${i}`, "block");
               u.ShowElements(`hideMealBtn${i}`, "inline");
               u.HideElements(`showMealBtn${i}`);
            });
            hideMealBtn.addEventListener("click", function() {
               u.HideElements([`mealDiv${i}`, `hideMealBtn${i}`]);
               u.ShowElements(`showMealBtn${i}`, "inline");
            });
         }
         u.CreateElement("br", els.viewMenuDiv);
         let mealDiv = u.CreateElement("div", els.viewMenuDiv, `mealDiv${i}`, "mealDiv", "", "none");
         let mCount = meal.modifier ? Number(menu.meateaters) + Number(meal.modifier.meateaters) : menu.meateaters;
         let vCount = meal.modifier ? Number(menu.vegetarians) + Number(meal.modifier.vegetarians) : menu.vegetarians;
         let mealNumbersText = `M: ${mCount} V: ${vCount}`;
         let mealNumbers = u.CreateEl('specials').innerText(mealNumbersText).parent(mealDiv).end();

         // adds recipe
         meal.recipes.forEach((menuRecipe, j) => {
            var recipe = d.recipes[menuRecipe.recipeTitle];
            if (!recipe) {
               u.CreateEl('h4').innerText(`Missing Recipe: ${menuRecipe.recipeTitle}`).parent(mealDiv).end();
               //break out of this loop and move onto the next recipe
               return;
            }
            let recipeTitle = u.CreateElement("h4", mealDiv, `recipeTitle${i}${j}`, "", `${menuRecipe.recipeTitle} (${recipe.serves}) - ${menuRecipe.morv}`, "inline-block");
            if (menuRecipe.morv === "b") {
               recipeTitle.innerText = `${menuRecipe.recipeTitle} (${recipe.serves})`;
            } else if (menuRecipe.morv === "sp") {
               recipeTitle.innerText = `${menuRecipe.recipeTitle} (${recipe.serves}) - ${menuRecipe.morv}: ${menuRecipe.specialCount}`;
            }

            // adds + and - buttons
            let showRecipeBtn = u.CreateEl('button').className('recipebtn').id(`showRecipeBtn${i}${j}`).parent(mealDiv).style('display:inline').end();
            u.Icon('plus', showRecipeBtn);
            let hideRecipeBtn = u.CreateEl('button').className('recipebtn').id(`hideRecipeBtn${i}${j}`).parent(mealDiv).style('display:none').end();
            u.Icon('minus', hideRecipeBtn);

            let recipeDiv = u.CreateElement("div", mealDiv, `recipeDiv${i}${j}`, "recipeDiv");
            let lineBreak = u.CreateEl('br').id(`recipeDivLineBreak${i}${j}`).parent(mealDiv).end();

            showRecipeBtn.addEventListener("click", function() {
               u.ShowElements(`recipeDiv${i}${j}`, "block");
               u.ShowElements(`hideRecipeBtn${i}${j}`, "inline");
               u.HideElements(`showRecipeBtn${i}${j}`);
               u.HideElements(`recipeDivLineBreak${i}${j}`)
            });

            hideRecipeBtn.addEventListener("click", function() {
               u.HideElements([`recipeDiv${i}${j}`, `hideRecipeBtn${i}${j}`]);
               u.ShowElements(`showRecipeBtn${i}${j}`, "inline");
               u.ShowElements(`recipeDivLineBreak${i}${j}`, 'block')
            });

            let specials = u.CreateElement("specials", recipeDiv, `specials${i}${j}`);
            let specialsArr = [];

            if (menuRecipe.comments) {
               let comments = u.CreateElement('specials', recipeDiv);
               comments.innerHTML = menuRecipe.comments.replace(/(?:\r\n|\r|\n)/g, '<br>');
               comments.style = 'margin-bottom: 6px'
            }

            let ingredientTable = u.CreateEl('table').parent(recipeDiv).id(`ingredientTable${i}${j}`).className('recipeIngredientTable').end();

            var specialPeople;
            // get rid of special people who won't eat this meal
            if (menu.specials && menuRecipe.morv !== 'b') {
               specialPeople = {};
               Object.keys(menu.specials).forEach(personName => {
                  var data = menu.specials[personName];
                  if (data.morv === menuRecipe.morv) {
                     specialPeople[personName] = data;
                  }
               });

            } else specialPeople = menu.specials;

            recipe.ingredients.forEach((ingredient, k) => {
               let food = d.foods[ingredient.foodName];
               let html = [];
               let ids = [];
               var allergens = food.allergens;
               if (menu.specials) {
                  Object.keys(specialPeople).forEach(personName => {

                     var dietaryReq = menu.specials[personName];
                     let allergenList = [];
                     if (allergens && dietaryReq.allergens) {
                        allergens.forEach(allergen => {
                           if (dietaryReq.allergens.indexOf(allergen) >= 0) allergenList.push(ingredient.foodName);
                        });
                     }
                     if (dietaryReq.foods) {
                        if (dietaryReq.foods.indexOf(ingredient.foodName) >= 0) allergenList.push(ingredient.foodName);
                     }

                     if (allergenList.length > 0) {
                        specialsArr.push({
                           personName: personName,
                           foodName: ingredient.foodName
                        });
                     }
                  });
               }

               if (menu.meateaters === null) {
                  html = [`(${ingredient.quantity})`, null, food.unit];
               } else {
                  var qLarge = u.CalculateQLarge(menuTitle, i, menuRecipe, ingredient);
                  html = u.DisplayIngredient(ingredient.quantity, qLarge, food.unit);
               }
               html.unshift(ingredient.foodName);
               for (let x = 0; x < 4; x++) {
                  ids.push(`${i}${j}${k}${x}`);
               }
               u.CreateRow(`ingredientTable${i}${j}`, "td", html, ids, [50, 10, 10, 30], "%");
               u.ID(`${i}${j}${k}1`).style.fontSize = "11px";
            });
            let method = u.CreateElement("p", recipeDiv);
            var methodHTML = recipe.method.replace(/(?:\r\n|\r|\n)/g, '<br><br>');
            method.innerHTML = methodHTML;

            if (specialsArr.length > 0) {

               var specialsObj1 = {};

               specialsArr.forEach(obj => {
                  if (!specialsObj1[obj.personName]) {
                     specialsObj1[obj.personName] = [];
                  }
                  specialsObj1[obj.personName].push(obj.foodName);

               });

               var specialsObj2 = {};

               Object.keys(specialsObj1).forEach(person => {
                  var foodJoined = specialsObj1[person].sort().join(", ");
                  if (!specialsObj2[foodJoined]) {
                     specialsObj2[foodJoined] = [];
                  }
                  specialsObj2[foodJoined].push(person);
               });


               specialsText = Object.keys(specialsObj2).map(problemFoods => {
                  var people = specialsObj2[problemFoods];
                  return `${people.length} - ${problemFoods} (${people.join(", ")})`;
               });
               specialsText.splice(0, 0, 'Specials:');


               specials.innerHTML = specialsText.join('<br>');
               specials.style = 'margin-bottom: 6px'
               u.Br(specials);

               recipeTitle.innerText = `${recipeTitle.innerText} *`;
            }
         });
      });

      //create right panel
      let morvCountTable = u.CreateEl('specials').innerText(`Meateaters: ${menu.meateaters}\n Vegetarians: ${menu.vegetarians}`).parent(els.menuInfoDiv).end()

   }

   /** onclick 'print menu' - calls 'generate print menu' */
   function PrintMenu() {
      let menuTitle = els.selectMenu.value.replace("/", "-");
      let filePath = u.ID("filepath").value;
      let rand = (Math.random() * 1000).toFixed(0);
      if (menuTitle === "Menu") {
         alert("menu not selected - please select menu");
         return false;
      } else if (filePath === "") {
         alert("file path not chosen; please enter a file path");
         u.ShowElements("settingsModal", "block");
         return false;
      }
      u.ShowElements("PrintMenu", "block");
      GeneratePrintMenu();
      u.HideElements("mainApp");
      ipc.send('print-to-pdf', `${filePath}/${menuTitle}_menu_${rand}.pdf`);
   }

   /** Generate menu to be printed (from view menu tab) */
   function GeneratePrintMenu() {
      //TODO FIX THIS AND MAKE LESS REPEATED CODE!!!
      els.viewMenuDiv = u.ID("PrintMenu");
      els.viewMenuDiv.innerHTML = ""; //clear the child div
      let menuTitle = u.ID("selectViewMenu").value;
      let menu = d.menus.getMenu(menuTitle);

      menu.meals.forEach((meal, i) => {
         let day = c.enums.weekday[new Date(meal.date).getDay()];

         let mealTitle = u.CreateElement("h3", els.viewMenuDiv, `printMealTitle${i}`, "printMealTitle", `${day} ${meal.mealType}`, "block");
         if (i === 0) {
            mealTitle.className = 'firstPrintMealTitle';
         }

         let mealDiv = u.CreateElement("div", els.viewMenuDiv, `printMealDiv${i}`, "printMealDiv");
         let mCount = meal.modifier ? Number(menu.meateaters) + Number(meal.modifier.meateaters) : menu.meateaters;
         let vCount = meal.modifier ? Number(menu.vegetarians) + Number(meal.modifier.vegetarians) : menu.vegetarians;
         let mealNumbersText = `M: ${mCount} V: ${vCount}`;
         let mealNumbers = u.CreateEl('specials').innerText(mealNumbersText).parent(mealDiv).end();

         u.CreateElement("br", els.viewMenuDiv);

         // adds recipe
         meal.recipes.forEach((menuRecipe, j) => {
            var recipe = d.recipes[menuRecipe.recipeTitle];

            let recipeDiv = u.CreateElement("div", mealDiv, `printRecipeDiv${i}${j}`, "printRecipeDiv");
            u.CreateElement("br", mealDiv);

            let recipeTitle = u.CreateElement("h4", recipeDiv, `printRecipeTitle${i}${j}`, "printRecipeTitle", `${menuRecipe.recipeTitle} (${recipe.serves}) - ${menuRecipe.morv}`, "block");
            if (menuRecipe.morv === "b") {
               recipeTitle.innerText = `${menuRecipe.recipeTitle} (${recipe.serves})`;
            } else if (menuRecipe.morv === "sp") {
               recipeTitle.innerText = `${menuRecipe.recipeTitle} (${recipe.serves}) - ${menuRecipe.morv}: ${menuRecipe.specialCount}`;
            }

            if (recipe.recipeType === "dessert c") {
               recipeTitle.className = "printDessertRecipeTitle";
            }

            u.CreateElement("br", mealDiv);
            let specials = u.CreateElement("specials", recipeDiv, `specials${i}${j}`);
            u.CreateElement("br", recipeDiv);

            let specialsArr = [];

            let ingredientTable = u.CreateElement("table", recipeDiv, `printIngredientTable${i}${j}`, "printIngredientTable", "", "block");

            var specialPeople;

            // get rid of special people who won't eat this meal
            if (menu.specials && menuRecipe.morv !== 'b') {
               specialPeople = {};
               Object.keys(menu.specials).forEach(personName => {
                  var data = menu.specials[personName];
                  if (data.morv === menuRecipe.morv) {
                     specialPeople[personName] = data;
                  }
               });

            } else specialPeople = menu.specials;

            recipe.ingredients.forEach((ingredient, k) => {
               let foodName = ingredient.foodName;
               let food = d.foods[foodName];
               let html = [];
               let ids = [];
               var allergens = food.allergens;
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
                        specialsArr.push({
                           personName: personName,
                           foodName: foodName
                        });
                     }
                  });
               }

               if (menu.meateaters === null) {
                  html = [`(${ingredient.quantity})`, null, food.unit];
               } else {
                  var qLarge = u.CalculateQLarge(menuTitle, i, menuRecipe, ingredient);
                  html = u.DisplayIngredient(ingredient.quantity, qLarge, food.unit);
               }
               html.unshift(foodName);
               for (let x = 0; x < 4; x++) {
                  ids.push(`print${i}${j}${k}${x}`);
               }
               u.CreateRow(`printIngredientTable${i}${j}`, "td", html, ids, [50, 10, 10, 30], "%");
               u.ID(`print${i}${j}${k}1`).style.fontSize = "11px";
            });
            let method = u.CreateElement("p", recipeDiv, `printMethod${i}${j}`, "printMethod", "", "block");
            method.innerHTML = recipe.method.replace(/(?:\r\n|\r|\n)/g, '<br><br>');


            if (menuRecipe.comments) {
               let comments = u.CreateElement('specials', recipeDiv);
               comments.innerHTML = menuRecipe.comments.replace(/(?:\r\n|\r|\n)/g, '<br>')
            }

            if (specialsArr.length > 0) {

               var specialsObj1 = {};

               specialsArr.forEach(obj => {
                  if (!specialsObj1[obj.personName]) {
                     specialsObj1[obj.personName] = [];
                  }
                  specialsObj1[obj.personName].push(obj.foodName);
               });

               var specialsObj2 = {};

               Object.keys(specialsObj1).forEach(person => {
                  var foodJoined = specialsObj1[person].sort().join(", ");
                  if (!specialsObj2[foodJoined]) {
                     specialsObj2[foodJoined] = [];
                  }
                  specialsObj2[foodJoined].push(person);
               });


               specialsText = Object.keys(specialsObj2).map(problemFoods => {
                  var people = specialsObj2[problemFoods];
                  return `${people.length} - ${problemFoods} (${people.join(", ")})`;
               });
               specialsText.splice(0, 0, 'Specials:');


               specials.innerHTML = specialsText.join('<br>');

               recipeTitle.innerText = `${recipeTitle.innerText} *`;
            }
         });
      });


   }

   return {
      generator: generator
   };
}