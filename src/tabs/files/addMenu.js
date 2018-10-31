module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var e = c.enums;
   var u = require("../../utilities")(DATA);

   function generator() {

      var tabcontent = u.ID('addMenu_tab_content');
      var els = CreatePageEls(tabcontent)

      els.addEmptyMenu.addEventListener("click", function() {
         AddEmptyMenu(els)
      });

      els.addWeekendMenu.addEventListener("click", function() {
         AddWeekendMenu(els)
      });

      els.addMealModal.addMealButton.addEventListener("click", function() {
         AddMealBtn(els.addMealModal)
      });
   }

   function CreatePageEls(parentDiv) {
      var els = {};

      els.subBox = u.CreateEl('div').parent(parentDiv).style('height:70px; width:430px;').end();
      els.menuTitle = u.CreateEl('input').type('text').placeholder('Menu Title').parent(els.subBox).end();
      u.Br(els.subBox);

      els.left = u.CreateEl('div').style('width:200px; margin:8px 0 0 0; float:left').parent(els.subBox).end();
      els.right = u.CreateEl('div').style('width:200px; margin:8px 0 0 0; float:right').parent(els.subBox).end();

      u.CreateEl('dateheader').innerText('Start Date').parent(els.left).end();
      els.startDate = u.CreateEl('input').type('date').parent(els.left).end();
      u.Br(els.left);
      u.Br(els.left);

      u.CreateEl('dateheader').innerText('End Date').parent(els.right).end();
      els.endDate = u.CreateEl('input').type('date').parent(els.right).end();
      u.Br(els.right);
      u.Br(els.right);

      els.addEmptyMenu = u.CreateEl('button').parent(els.left).innerText('Add Empty Menu').style('width:inherit').end();
      els.addWeekendMenu = u.CreateEl('button').parent(els.right).innerText('Add Standard Weekend Menu').style('width:inherit').end();

      els.addMealModal = CreateAddMealModalEls();

      return els;
   }

   function CreateAddMealModalEls() {
      var els = {};

      els.modal = u.CreateEl('div').id('Add Meals Modal').className('modal').parent(u.ID('modals')).end();
      els.modalContent = u.CreateEl('div').className('modal-content animate').parent(els.modal).end();
      els.titleContainer = u.CreateEl('div').className('container').style('padding-bottom:0px').parent(els.modalContent).end();
      els.title = u.CreateEl('text').className('modal-title').innerText('Add Meals to: ').parent(els.titleContainer).end();
      els.menuTitle = u.CreateEl('text').className('modal-title').parent(els.titleContainer).end();

      els.flexContainer = u.CreateEl('div').className('flex-container').style('width:600px; padding:0').parent(els.modalContent).end();
      els.left = u.CreateEl('div').className('container').style('width:228px').parent(els.flexContainer).end();
      els.right = u.CreateEl('div').className('container').style('width:308px').parent(els.flexContainer).end();

      els.selectDay = u.CreateEl('select').id('selectDayForAddMeals').parent(els.left).end();
      u.Br(els.left);
      els.selectMealType = u.CreateEl('select').id('selectMealTypeForAddMeals').parent(els.left).end();
      u.Br(els.left);
      u.Br(els.left);
      els.addMealButton = u.CreateEl('button').innerText('Add Meal').parent(els.left).end();

      els.currentMealList = u.CreateEl('container').style('width:50%').parent(els.right).end();

      return els;
   }

   function AddEmptyMenu(els) { //when you press 'add empty menu' button on the add menu screen
      let title = els.menuTitle.value;
      d.menus.addMenu(title, els.startDate.value, els.endDate.value);
      d.write();
      RefreshAddMealModal(els, title);
      u.ClearVals(els);
   }

   function AddWeekendMenu(els) { //when you press 'add weekend menu' button on the add menu screen
      let title = els.menuTitle.value;

      let startDate = new Date(els.startDate.value);
      let endDate = new Date(els.endDate.value);
      let midDate = new Date(els.startDate.value);
      midDate.setDate(startDate.getDate() + 1);

      d.menus.addMenu(title, startDate, endDate);

      d.menus.addMeal(title, "dinner", startDate);
      d.menus.addMeal(title, "breakfast", midDate);
      d.menus.addMeal(title, "snack", midDate);
      d.menus.addMeal(title, "lunch", midDate);
      d.menus.addMeal(title, "dinner", midDate);
      d.menus.addMeal(title, "breakfast", endDate);
      d.menus.addMeal(title, "lunch", endDate);

      d.menus.addRecipe(title, 1, "Standard Breakfast", "b");
      d.menus.addRecipe(title, 5, "Standard Breakfast", "b");
      d.write();

      u.ClearVals(els);
   }

   function RefreshAddMealModal(els, menuTitle) { // creates and shows the modal 'add meal', calls 'CreateMealList' to make the right hand panel

      let startDate = new Date(d.menus[menuTitle].startDate);
      let endDate = new Date(d.menus[menuTitle].endDate);
      if (endDate < startDate) {
         console.log("End Date is after Start Date");
         return null;
      }
      els.addMealModal.menuTitle.innerText = menuTitle;
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
      CreateMealList(els.addMealModal);
      els.addMealModal.modal.style = "display: block";
   }

   function CreateMealList(modalEls) { // creates the meal list on the right of the add meal modal, and adds delete buttons that remove a meal and reload the list
      let menuTitle = modalEls.menuTitle.innerText;
      modalEls.currentMealList.innerHTML = "";
      let menu = d.menus[menuTitle];
      for (let i = 0; i < menu.meals.length; i++) {
         let meal = d.menus.getMeal(menuTitle, i);
         let day = c.enums.weekday[new Date(meal.date).getDay()];
         let mealTitleDiv = u.CreateElement("div", modalEls.currentMealList, "", "listItem");
         mealTitleDiv.style.width = '300px';
         let mealTitle = u.CreateElement("text", mealTitleDiv, "", "recipeTitle", `${day} ${meal.mealType}`);

         let deleteMealFromMenu = u.CreateElement("button", mealTitleDiv, "", "removeListItem", "x");
         deleteMealFromMenu.addEventListener("click", function() {
            d.menus.deleteMeal(menuTitle, i);
            d.write();
            CreateMealList(modalEls);
         });
      }
   }

   function AddMealBtn(modalEls) { // adds event listener for the 'add meal' button in the add meal modal

      let mealID = d.menus.addMeal(
         modalEls.menuTitle.innerText,
         modalEls.selectMealType.value,
         new Date(modalEls.selectDay.value)
      );

      if (modalEls.selectMealType.value === "breakfast") {
         d.menus.addRecipe(modalEls.menuTitle.innerText, mealID, "Standard Breakfast", "b");
      }
      d.write();
      modalEls.selectMealType.value = "_default";
      CreateMealList(modalEls);
   }

   return {
      generator: generator,
      RefreshAddMealModal: RefreshAddMealModal
   };
}