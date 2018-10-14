module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var e = c.enums;
   var u = require("../../utilities")(DATA);

   function generator() {
      u.ID("addmenu_btn").addEventListener("click", AddMenuBtn);
      u.ID("add_weekend_menu").addEventListener("click", AddWeekendMenuBtn);
      u.ID("addMeals_btn").addEventListener("click", AddMealBtn);
   }

   function AddMenuBtn() { //when you press 'add empty menu' button on the add menu screen
      let title = u.ID("newMenuTitle").value;
      let startDate = new Date(u.ID("menuStartDate").value);
      let endDate = new Date(u.ID("menuEndDate").value);
      d.menus.addMenu(title, startDate, endDate);
      d.write();
      CreateAddMealModal(title);
      u.SetValues([
         ["newMenuTitle", ""],
         ["menuEndDate", ""],
         ["menuStartDate", ""]
      ]);
   }

   function AddWeekendMenuBtn() { //when you press 'add weekend menu' button on the add menu screen
      let title = u.ID("newMenuTitle").value;
      let startDate = new Date(u.ID("menuStartDate").value);
      let endDate = new Date(u.ID("menuEndDate").value);
      let midDate = new Date(u.ID("menuStartDate").value);
      midDate.setDate(startDate.getDate() + 1);

      d.menus.addMenu(title, startDate, endDate);

      try {
         d.menus.addMeal(title, "dinner", startDate);
         d.menus.addMeal(title, "breakfast", midDate);
         d.menus.addMeal(title, "snack", midDate);
         d.menus.addMeal(title, "lunch", midDate);
         d.menus.addMeal(title, "dinner", midDate);
         d.menus.addMeal(title, "breakfast", endDate);
         d.menus.addMeal(title, "lunch", endDate);

         d.menus.addRecipe(title, 1, "Standard Breakfast", "b");
         d.menus.addRecipe(title, 5, "Standard Breakfast", "b");
      } catch (e) {
         console.log(e);
      }

      u.SetValues([
         ["newMenuTitle", ""],
         ["menuEndDate", ""],
         ["menuStartDate", ""]
      ]);
      d.write();
   }

   function CreateAddMealModal(menuTitle) { // creates and shows the modal 'add meal', calls 'CreateMealList' to make the right hand panel

      let startDate = new Date(d.menus[menuTitle].startDate);
      let endDate = new Date(d.menus[menuTitle].endDate);
      if (endDate < startDate) {
         console.log("End Date is after Start Date");
         return null;
      }
      u.ID("menuTitleForAddMeals").innerHTML = menuTitle;
      // create list of dates
      let dateList = [];
      let end = false;
      let i = 0;
      while (end === false) {
         dateList[i] = new Date(d.menus[menuTitle].startDate);
         dateList[i].setDate(startDate.getDate() + i);
         if (dateList[i].getDate() === endDate.getDate()) {
            end = true;
         }
         if (i === 20) {
            end = true;
            console.log("date range too large");
         }
         i++;
      }
      let dateEnum = dateList.map(d => {
         return `${c.enums.weekday[d.getDay()]} (${u.GetFormalDate(d)})`
      })
      u.CreateDropdown("selectDayForAddMeals", dateEnum, false, dateList, 'Select Day');
      CreateMealList();
      u.ID("addMealsToMenu").style = "display: block";
   }

   function CreateMealList() { // creates the meal list on the right of the add meal modal, and adds delete buttons that remove a meal and reload the list
      let menuTitle = u.ID("menuTitleForAddMeals").innerHTML;
      u.SetValues([
         ["selectMealTypeForAddMeals", "_default"]
      ]);
      let mealDiv = u.ID("currentMealList");
      mealDiv.innerHTML = "";
      let menu = d.menus[menuTitle];
      for (let i = 0; i < menu.meals.length; i++) {
         let meal = d.menus.getMeal(menuTitle, i);
         let day = c.enums.weekday[new Date(meal.date).getDay()];
         let mealTitleDiv = u.CreateElement("div", mealDiv, "", "listItem");
         mealTitleDiv.style.width = '300px';
         let mealTitle = u.CreateElement("text", mealTitleDiv, "", "recipeTitle", `${day} ${meal.mealType}`);

         let deleteMealFromMenu = u.CreateElement("button", mealTitleDiv, "", "removeRecipe", "x");
         deleteMealFromMenu.addEventListener("click", function() {
            d.menus.deleteMeal(menuTitle, i);
            d.write();
            CreateMealList();
         });
      }
   }

   function AddMealBtn() { // adds event listener for the 'add meal' button in the add meal modal
      let menuTitle = u.ID("menuTitleForAddMeals").innerHTML;
      let mealID = d.menus.addMeal(menuTitle, u.ID("selectMealTypeForAddMeals").value, new Date(u.ID("selectDayForAddMeals").value));
      if (u.ID("selectMealTypeForAddMeals").value === "breakfast") {
         d.menus.addRecipe(menuTitle, mealID, "Standard Breakfast", "b");
      }
      d.write();
      CreateMealList();
   }

   return {
      generator: generator,
      CreateAddMealModal: CreateAddMealModal
   };
}