var tagsInput = require('tags-input');


module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var u = require("../../utilities")(DATA);

   var ELS;

   function generator(hTabEls) {

      var tabcontent = u.ID('people_tab_content');
      ELS = CreatePageEls(tabcontent);
      ELS.selectMenu = hTabEls.selectMenu;
      ELS.selectMenu.addEventListener("change", CreatePeopleList);

      //event listener to load people list page when menu is selected
      ELS.saveBtn.addEventListener('click', saveAllergens);

      ELS.plusButton.addEventListener("click", addAllergenRow);

      //  window.addEventListener('update', UpdateListener);

   }

   function CreatePageEls(parentDiv) {
      console.log('creating people page els')
      var els = {};
      els.peopleDiv = u.CreateEl('div').parent(parentDiv).style('display:none').end();
      els.peopleTable = u.CreateEl('table').parent(els.peopleDiv).className('ingredientTable').style('margin-top:15px').id('specialsTable').end();
      els.peopleTableHeader = u.CreateEl('tr').parent(els.peopleTable).end();

      var cells = [{
            title: 'Person',
            width: 60
         },
         {
            title: 'Allergens',
            width: 200
         }, {
            title: 'Foods',
            width: 300
         }, {
            title: 'Morv',
            width: 40
         }, {
            title: '',
            width: 15
         },
      ];

      cells.forEach(ea => {
         u.CreateEl('th').parent(els.peopleTableHeader).innerText(ea.title).style(`width:${ea.width}px`).end();
      })

      //add 'plus' row
      let plusRow = els.peopleTable.insertRow();
      console.log(plusRow);

      // plusRow.className = 'addItemRow';
      let plusCell = u.CreateEl('td').parent(plusRow).className('addItemCell').end();
      els.plusButton = u.CreateEl('button').parent(plusCell).className('ingredientTableButton').end();
      u.Icon('plus', els.plusButton)

      u.Br(els.peopleDiv);
      els.saveBtn = u.CreateEl('button').parent(els.peopleDiv).innerText('Save').end();

      return els;
   }

   function CreatePeopleList(event) {
      RefreshAllergenTable(event.target.value);
      if (ELS.selectMenu.value != '_default') {
         ELS.peopleDiv.style = 'display:block'
      } else {
         ELS.peopleDiv.style = 'display:none'
      }
   }

   function RefreshAllergenTable(menuTitle) {

      //clear everything that isn't the header row or the last 'plus' row
      for (var i = 1; i < ELS.peopleTable.rows.length - 1;) {
         ELS.peopleTable.deleteRow(i);
      }

      var specials = d.menus[menuTitle].specials;
      if (specials) {
         Object.keys(specials).forEach(person => {
            addAllergenRow(person, specials[person]);
         });
      } else {
         addAllergenRow();
      }
      // u.ID('addSpecialRowHeader').addEventListener('click', function() {
      //    addAllergenRow();
      // });
   }

   function addAllergenRow(personName, specialData, rowIndex) {
      if (typeof personName != 'string') personName = undefined;
      var i = ELS.peopleTable.rows.length;

      rowIndex = rowIndex ? rowIndex : i - 1;
      var newRow = ELS.peopleTable.insertRow(rowIndex);

      var inputConfig = [{
            elementType: 'input',
            type: 'text',
            key: 'person'
         },
         {
            elementType: 'input',
            type: 'tags',
            dropdownSource: 'allergenList',
            key: 'allergens'
         },
         {
            elementType: 'input',
            type: 'tags',
            dropdownSource: 'food',
            key: 'foods'
         },
         {
            elementType: 'select',
            key: 'morv',
            id: 'peopleMorv'
         },
         {
            elementType: 'button',
            key: 'minus',
            id: '-person',
            className: 'removeLineBtn'
         }
      ];
      let els = {};
      inputConfig.forEach((obj, ind) => {
         let inputId = obj.id ? `${obj.id}${i-1}` : undefined;
         let cell = u.CreateEl('td').parent(newRow).className('cellWithInput').end();
         els[obj.key] = u.CreateEl(obj.elementType).id(inputId).className(obj.className).type(obj.type).parent(cell).end();
         if (obj.type === 'tags') {
            var valArray = [];
            try {
               valArray = specialData[obj.key];
            } catch (e) {

            }
            tagsInput(els[obj.key], obj.dropdownSource, 'populate', ',', valArray);
         } else if (obj.elementType === 'button') {
            u.Icon('minus', els[obj.key])
         }
      });

      els.person.setAttribute('list', 'specialPeople');
      if (personName) els.person.setAttribute('value', personName);

      //TODO: fix this!
      var defaultVal = 'M or V';

      console.log(els.morv.id);
      u.CreateDropdown(els.morv.id, ["m", "v"], false, undefined, 'M or V');

      if (specialData) {
         els.morv.value = specialData.morv;
      }

      els.person.addEventListener('change', selectPersonName);

      els.minus.addEventListener('click', deleteAllergenRow);
   }

   function deleteAllergenRow() {
      let table = ELS.peopleTable;
      let i = u.GetNumber(event.target.id);

      //remove from dict obj if it exists
      var menuTitle = ELS.selectMenu.value;
      var key = ELS.peopleTable.rows[i].cells[0].value;
      if (key && d.menus[menuTitle].specials) {
         if (d.menus[menuTitle].specials[key]) {
            delete d.menus[menuTitle].specials[key];
            d.write();
         }
      }

      table.deleteRow(i);

      // renumber the ids of all the rows below the deleted row
      let len = table.rows.length;

      function replaceIndexes(parent, from, to) {
         Array.prototype.forEach.call(parent.children, cell => {
            cell.id = cell.id.replace(from, to);
            replaceIndexes(cell, from, to);
         });
      }
      for (i; i < len; i++) {
         replaceIndexes(table.rows[i], i + 1, i);
      }
   }

   function saveAllergens() {
      var menuTitle = ELS.selectMenu.value;
      let table = ELS.peopleTable;
      var rowcount = table.rows.length;

      for (let i = 1; i < rowcount; i++) {
         var personName = u.ID(`agnPerson${i}`).value;
         var allergens = getArr(`agnAllergen${i}`);
         var foods = getArr(`agnFoods${i}`);
         var morv = u.ID(`agnMorv${i}`).value;

         if (!personName || morv === 'morv' || (!allergens && !foods)) continue;

         d.menus.changeAllergyType(menuTitle, personName, allergens, foods, morv);
      }
      d.write();
      RefreshAllergenTable(menuTitle);
   }

   function getArr(id) {
      var thing = u.ID(id).value;
      return thing ? thing.split(",") : undefined;
   }

   function selectPersonName(event) {
      var name = event.target.value;
      var i = u.GetNumber(event.target.id);
      var specialsEnum = c.enums.specialsEnum;
      var specialNames = Object.keys(specialsEnum);

      if (specialNames.indexOf(name) >= 0) {
         var specialData = specialsEnum[name];
         ELS.peopleTable.deleteRow(i);
         addAllergenRow(name, specialData, i);
      }
   }



   return {
      generator: generator
   };
}