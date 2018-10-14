var tagsInput = require('tags-input');


module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var u = require("../../utilities")(DATA);

   var cellWidths = [60, 150, 150, 20, 15, 15];

   function generator() {
      //event listener to load people list page when menu is selected
      u.ID("selectPeopleMenu").addEventListener("change", CreatePeopleList);
      u.CreateElement("table", u.ID('viewPeopleDiv'), 'specialsTable');

      var saveBtn = u.CreateEl('button').id('saveAllergens').parent(u.ID('viewPeopleDiv')).innerText('Save').end();
      saveBtn.addEventListener('click', saveAllergens);
   }

   function CreatePeopleList(event) {
      RefreshAllergenTable(event.target.value);
   }

   function RefreshAllergenTable(menuTitle) {
      u.ID('specialsTable').innerHTML = "";
      var cellTitles = ["Person", "Allergens", "Foods", "Morv", "-", "+"];
      u.CreateRow("specialsTable", "th", cellTitles, ["", "", "", "", "", "addSpecialRowHeader"], cellWidths, "px");
      var specials = d.menus[menuTitle].specials;
      if (specials) {
         Object.keys(specials).forEach(person => {
            addAllergenRow(person, specials[person]);
         });
      } else {
         addAllergenRow();
      }
      u.ID('addSpecialRowHeader').addEventListener('click', function() {
         addAllergenRow();
      });
   }

   function addAllergenRow(personName, specialData, rowIndex) {
      var i = u.ID('specialsTable').rows.length;
      var cellContents = ["", "", "", "", "-", "+"];
      var cellIDs = ["", "", "", "", `agn-${i}`, `agn+${i}`];

      var newRow = u.CreateRow("specialsTable", "td", cellContents, cellIDs, cellWidths, "px", rowIndex);

      var inputConfig = [{
            elementType: 'input',
            type: 'text',
            id: 'agnPerson',
            key: 'person'
         },
         {
            elementType: 'input',
            type: 'tags',
            id: 'agnAllergen',
            dropdownSource: 'allergenList',
            key: 'allergens'
         },
         {
            elementType: 'input',
            type: 'tags',
            id: 'agnFoods',
            dropdownSource: 'food',
            key: 'foods'
         },
         {
            elementType: 'select',
            id: 'agnMorv',
            key: 'morv'
         }
      ];
      var els = {};
      inputConfig.forEach((obj, ind) => {
         els[obj.key] = u.CreateEl(obj.elementType).type(obj.typeType).id(`${obj.id}${i}`).parent(newRow.children[ind]).end();
         if (obj.type === 'tags') {
            var valArray = [];
            try {
               valArray = specialData[obj.key];
            } catch (e) {

            }
            console.log(valArray);
            tagsInput(els[obj.key], obj.dropdownSource, 'populate', ',', valArray);
         }
      });
      els.person.setAttribute('list', 'specialPeople');
      if (personName) els.person.setAttribute('value', personName);
      var defaultVal = 'morv';
      if (specialData) {
         defaultVal = specialData.morv;
      }
      u.CreateDropdown(els.morv.id, ["m", "v"], false, undefined, defaultVal);

      u.ID(`agnPerson${i}`).addEventListener('change', selectPersonName);

      u.ID(`agn+${i}`).addEventListener('click', function() {
         addAllergenRow();
      });
      u.ID(`agn-${i}`).addEventListener('click', deleteAllergenRow);
   }

   function deleteAllergenRow() {
      let table = u.ID('specialsTable');
      let i = u.GetNumber(event.target.id);

      //remove from dict obj if it exists
      var menuTitle = u.ID('selectPeopleMenu').value;
      var key = u.ID(`agnPerson${i}`).value;
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
      var menuTitle = u.ID('selectPeopleMenu').value;
      var table = u.ID('specialsTable');
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
         u.ID('specialsTable').deleteRow(i);
         addAllergenRow(name, specialData, i);
      }
   }



   return {
      generator: generator
   };
}