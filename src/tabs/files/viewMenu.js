const ipc = require('electron').ipcRenderer;


//TODO fix code so same code used for normal and print menu
//TODO fix printing0

//
// TODO Right hand strip (info page) includes:
// 1. baseline M/V numbers
// 2. people with allergies


module.exports = function(DATA) {
   const d = DATA.dict;
   const c = DATA.config;
   const u = require("../../utilities")(DATA);
   const els = DATA.els.edit.viewMenu;

   function generator() {

      var tabcontent = u.ID('viewMenu_tab_content');
      CreatePageEls(tabcontent);

      DATA.els.edit.selectMenu.addEventListener("change", RefreshMenu);

      window.addEventListener('update', RefreshPage);
      // for debug
      window.printMenu = PrintMenu;
   }

   function CreatePageEls(parentDiv) {

      els.menuMorvCounts = u.CreateEl('notes').className('summary').style('float:left; margin-top:5px').parent(parentDiv).end();

      els.viewMenuDiv = u.CreateEl('div').style('width:400px; margin:30px 0 0 0').parent(parentDiv).end();
   }

   function RefreshPage(EV) {
      if (EV.detail.type === 'dict') {
         //refresh list of recipes
         // RefreshMenu()
      }
   }

   /** Refresh view menu (triggered when menu is selected) */
   function RefreshMenu({
      isPrint
   }) {
      let displayOnLoad = isPrint ? 'block' : 'none';
      let printPrefix = isPrint ? 'print_' : '';

      const parentDiv = isPrint ? u.ID('print_menu') : els.viewMenuDiv;
      parentDiv.innerHTML = ""; //clear the div
      let menuTitle = DATA.els.edit.selectMenu.value;
      let menu = d.menus.getMenu(menuTitle);
      if (menuTitle === "Menu" || !menu) {
         return "no action required";
      }

      menu.meals.forEach((meal, i) => {
         let day = c.enums.weekday[new Date(meal.date).getDay()];

         let mealTitle = u.CreateEl('h3').className('viewMealTitle').parent(parentDiv).id(`${printPrefix}mealTitle${i}`).innerText(`${day} ${meal.mealType}`).end();
         if (isPrint && i === 0) {
            mealTitle.className = 'firstMealTitle';
         }

         if (Object.keys(meal.recipes).length > 0 && !isPrint) { // if there is a recipe in the meal AND we're not in print mode, print the recipes and hide/show buttons

            let showMealBtn = u.CreateEl('button').className('mealbtn').id(`showMealBtn${i}`).parent(parentDiv).style('display:inline').end();
            u.Icon('plus', showMealBtn);

            let hideMealBtn = u.CreateEl('button').className('mealbtn').id(`hideMealBtn${i}`).parent(parentDiv).style('display:none').end();
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

         if (!isPrint) u.Br(parentDiv);
         let mealDiv = u.CreateElement("div", parentDiv, `${printPrefix}mealDiv${i}`, "mealDiv", "", displayOnLoad);
         let mCount = meal.modifier ? Number(menu.meateaters) + Number(meal.modifier.meateaters) : menu.meateaters;
         let vCount = meal.modifier ? Number(menu.vegetarians) + Number(meal.modifier.vegetarians) : menu.vegetarians;
         let mealNumbersText = `M: ${mCount} V: ${vCount}`;
         let mealNumbers = u.CreateEl('notes').className('summary').innerText(mealNumbersText).parent(mealDiv).end();

         // adds recipe
         meal.recipes.forEach((menuRecipe, j) => {
            var recipe = d.recipes[menuRecipe.recipeTitle];
            let recipeWrapDiv = u.CreateEl('div').parent(mealDiv).className(`wrapDiv ${recipe.recipeType}`).end();

            if (!recipe) {
               u.CreateEl('h4').innerText(`Missing Recipe: ${menuRecipe.recipeTitle}`).parent(recipeWrapDiv).end();
               //break out of this loop and move onto the next recipe
               return;
            }
            let recipeTitle = u.CreateElement("h4", recipeWrapDiv, `${printPrefix}recipeTitle${i}${j}`, "", `${menuRecipe.recipeTitle} - ${menuRecipe.morv}`, "inline-block");
            if (menuRecipe.morv === "b") {
               recipeTitle.innerText = `${menuRecipe.recipeTitle}`;
            } else if (menuRecipe.morv === "sp") {
               let specialCount = menuRecipe.specialCount ? menuRecipe.specialCount : "";
               recipeTitle.innerText = `${menuRecipe.recipeTitle} (${menuRecipe.morv}: ${specialCount})`;
            }

            // adds + and - buttons
            if (!isPrint) {
               let showRecipeBtn = u.CreateEl('button').className('recipebtn').id(`showRecipeBtn${i}${j}`).parent(recipeWrapDiv).style('display:inline').end();
               u.Icon('plus', showRecipeBtn);
               let hideRecipeBtn = u.CreateEl('button').className('recipebtn').id(`hideRecipeBtn${i}${j}`).parent(recipeWrapDiv).style('display:none').end();
               u.Icon('minus', hideRecipeBtn);

               showRecipeBtn.addEventListener("click", function() {
                  u.ShowElements(`recipeDiv${i}${j}`, "block");
                  u.ShowElements(`hideRecipeBtn${i}${j}`, "inline");
                  u.HideElements(`showRecipeBtn${i}${j}`);
                  u.HideElements(`recipeDivLineBreak${i}${j}`);
               });

               hideRecipeBtn.addEventListener("click", function() {
                  u.HideElements([`recipeDiv${i}${j}`, `hideRecipeBtn${i}${j}`]);
                  u.ShowElements(`showRecipeBtn${i}${j}`, "inline");
                  u.ShowElements(`recipeDivLineBreak${i}${j}`, 'block');
               });
            }

            let recipeDiv = u.CreateElement("div", recipeWrapDiv, `recipeDiv${i}${j}`, "recipeDiv");
            if (!isPrint) {
               let lineBreak = u.CreateEl('br').id(`recipeDivLineBreak${i}${j}`).parent(recipeWrapDiv).end();
            }

            let specials = u.CreateEl('notes').className('summary').parent(recipeDiv).id(`specials${i}${j}`).end();
            let specialsArr = [];

            if (menuRecipe.comments) {
               let comments = u.CreateEl('notes').className('summary').parent(recipeDiv).end();
               comments.innerHTML = menuRecipe.comments.replace(/(?:\r\n|\r|\n)/g, '<br>');
            }

            //create serves
            u.CreateEl('notes').parent(recipeDiv).innerText(`Original Recipe Serves ${recipe.serves}`).end();

            let ingredientTable = u.CreateEl('table').parent(recipeDiv).id(`${printPrefix}ingredientTable${i}${j}`).className('recipeIngredientTable').end();

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
                  ids.push(`${printPrefix}${i}${j}${k}${x}`);
               }
               u.CreateRow(`${printPrefix}ingredientTable${i}${j}`, "td", html, ids, [50, 10, 10, 30], "%");
               u.ID(`${printPrefix}${i}${j}${k}1`).style.fontSize = "11px";
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


               var specialsText = Object.keys(specialsObj2).map(problemFoods => {
                  var people = specialsObj2[problemFoods];
                  return `${people.length} - ${problemFoods} (${people.join(", ")})`;
               });
               specialsText.splice(0, 0, 'Specials:');


               specials.innerHTML = specialsText.join('<br>');
               u.Br(specials);

               recipeTitle.innerText = `${recipeTitle.innerText} *`;
            }
         });
      });

      //create right panel
      els.menuMorvCounts.innerText = `Meateaters: ${menu.meateaters}    Vegetarians: ${menu.vegetarians}`;
      console.log(menu);

   }

   /** onclick 'print menu' - calls 'generate print menu' */
   function PrintMenu() {
      let menuTitle = DATA.els.edit.selectMenu.value.replace("/", "-");
      let filePath = 'C:/Users/Lisa Karlin/Documents/Menus';
      let rand = (Math.random() * 1000).toFixed(0);
      if (menuTitle === "Menu") {
         alert("menu not selected - please select menu");
         return false;
      } else if (filePath === "") {
         alert("file path not chosen; please enter a file path");
         u.ShowElements("settingsModal", "block");
         return false;
      }
      u.ShowElements("print_menu", "block");
      // call RefreshMenu with isPrint = true
      RefreshMenu({
         isPrint: true
      });
      RefreshPrintSummary();
      u.HideElements("mainApp");
      ipc.send('print-to-pdf', `${filePath}/${menuTitle}_menu_${rand}.pdf`);
   }

   function RefreshPrintSummary() {
      let menuTitle = DATA.els.edit.selectMenu.value;
      let menu = d.menus.getMenu(menuTitle);
      if (menuTitle === "_default" || !menu) {
         return "no action required";
      }

      let parentDiv = u.ID('print_menu');

      // add a list of all the meals and each recipe
      let summaryDiv = u.CreateEl('div').className('summaryDiv').parent(parentDiv).end();

      menu.meals.forEach((meal, i) => {
         let day = c.enums.weekday[new Date(meal.date).getDay()];
         let wrapDiv = u.CreateEl('div').className('wrapDiv').parent(summaryDiv).end();
         let mealTitle = u.CreateEl('h3').parent(wrapDiv).innerText(`${day} ${meal.mealType}`).end();

         //TODO - fix this hack
         let mealCountText = u.ID(`mealDiv${i}`).children[0].innerText;
         let mealCountEl = u.CreateEl('notes').parent(wrapDiv).innerText(mealCountText).end();

         meal.recipes.forEach((recipe, j) => {
            let actual_recipe = d.recipes[recipe.recipeTitle];

            if (actual_recipe.recipeType === 'dessert') {
               let divider = u.CreateEl('div').parent(wrapDiv).className('divider').end();
            }

            let titleText = recipe.morv == 'b' ? recipe.recipeTitle : `${recipe.recipeTitle} - ${recipe.morv}`
            let recipeTitle = u.CreateEl('h4').parent(wrapDiv).className(actual_recipe.recipeType).innerHTML(titleText).end();


            let allRecipeNotes = u.ID(`recipeDiv${i}${j}`).getElementsByClassName('summary')
            let recipeNotesText = Array.prototype.map.call(allRecipeNotes, x => x.innerText).join("<br>");

            let recipeNotesEl = u.CreateEl('notes').parent(wrapDiv).innerHTML(recipeNotesText).end();

         })
      })


   }

   return {
      generator: generator,
      PrintMenu: PrintMenu
   };
};