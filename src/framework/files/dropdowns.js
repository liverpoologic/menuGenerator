module.exports = function(DATA) {

   var u = require("../../utilities")(DATA);

   function Initialise() {
      window.addEventListener('update', RefreshDropdowns)
      window.addEventListener('update', RefreshDataLists)
   }

   //    u.CreateDropdown("t2TableFilter1input", e.mealTypeEnum, false, undefined, 'all');
   //    u.CreateDropdown("t2TableFilter2input", e.recipeTypeEnum, false, undefined, 'all');
   //    u.CreateDropdown("t2TableFilter4input", e.morvEnum, false, undefined, 'all');


   function RefreshDropdowns(EV) {
      var d = DATA.dict;
      var c = DATA.config;

      if (EV.detail.type !== 'config') {
         // Create array of menu names
         var menuValList = u.GetKeysExFns(d.menus).sort((a, b) => {
            return u.Compare(d.menus[a].startDate, d.menus[b].startDate);
         });

         var menuNameList = menuValList.map(menuTitle => {
            var menu = d.menus.getMenu(menuTitle);
            return menu.startDate ? `${menuTitle} (${u.GetMMMyy(new Date(menu.startDate))})` : menuTitle;
         });
      }

      var dropdownConfig = [{
            source: function() {
               return c.enums.shopEnum;
            },
            keys: false,
            ids: [ /**'selectFoodShop',*/ 't1TableFilter2input'],
            _default: 'Shop',
            type: 'config'
         },
         {
            source: function() {
               return c.enums.allergenEnum;
            },
            keys: false,
            ids: ['t1TableFilter4input'],
            type: 'config',
            _default: 'Allergens'
         },
         {
            source: function() {
               return c.enums.foodTypeEnum;
            },
            keys: false,
            ids: [ /**'selectFoodType', */ 't1TableFilter3input'],
            _default: 'Food Type',
            type: 'config'
         },
         // {
         //    source: function() {
         //       return c.enums.mealTypeEnum;
         //    },
         //    keys: false,
         //    ids: ['selectRecipeMealType', 'selectMealTypeForAddMeals', 't2TableFilter1input'],
         //    _default: 'Meal Type',
         //    type: 'config'
         // },
         // {
         //    source: function() {
         //       return c.enums.recipeTypeEnum;
         //    },
         //    keys: false,
         //    ids: ['selectRecipeType', 't2TableFilter2input'],
         //    _default: 'Food Type',
         //    type: 'config'
         // },
         // {
         //    source: function() {
         //       return c.enums.morvEnum;
         //    },
         //    keys: false,
         //    ids: ['recipeMorv'],
         //    _default: 'morv',
         //    type: 'config'
         // },
         // {
         //    source: function() {
         //       return c.enums.recipeMorv;
         //    },
         //    keys: false,
         //    ids: ['selectMorvForMenu'],
         //    _default: 'morv',
         //    type: 'config'
         // },
         // {
         //    source: function() {
         //       return menuNameList;
         //    },
         //    keys: false,
         //    ids: ['selectViewMenu', 'selectEditMenu', 'selectPeopleMenu', 'selectMenuForShopping'],
         //    _default: 'Choose Menu',
         //    valueOpts: menuValList,
         //    type: 'dict'
         // },
         // {
         //    source: function() {
         //       return d.recipes;
         //    },
         //    keys: true,
         //    ids: ['selectRecipeForMenu'],
         //    _default: 'Recipe',
         //    type: 'dict'
         // },
         // {
         //    source: function() {
         //       return c.enums;
         //    },
         //    keys: true,
         //    ids: ['selectAdminEnum'],
         //    _default: 'Select an Enum',
         //    type: 'config'
         // },
         // {
         //    source: function() {
         //       return d.foods
         //    },
         //    keys: true,
         //    table: 'ingredientTable',
         //    idPrefix: 'selectIngredientFood',
         //    _default: 'Food',
         //    type: 'dict'
         // },
         // {
         //    source: function() {
         //       return c.enums.morvEnum
         //    },
         //    keys: false,
         //    table: 'ingredientTable',
         //    idPrefix: 'selectIngredientMorv',
         //    _default: 'M or V',
         //    type: 'config'
         // },
         // {
         //    source: function() {
         //       return c.enums.morvEnum;
         //    },
         //    keys: false,
         //    ids: ['t2TableFilter4input'],
         //    _default: 'M or V',
         //    type: 'config'
         //
         // }
      ];
      //To Do - validate that the checks for 'default' are all correct. Perhaps exchange with a single string 'default'

      dropdownConfig.forEach(x => {
         //filter whether we need to update
         if ((EV.detail.global && EV.detail.type === x.type) || EV.detail.table && EV.detail.table === x.table) {

            var ids = x.table ? get_ids(x) : x.ids;
            ids.forEach(id => {
               // var _default = x._default;
               // var domObj = u.ID(id);
               // if (domObj != null) {
               //     if (domObj.value != null && domObj.value != undefined && domObj.value != "") _default = domObj.value;
               // }
               u.CreateDropdown(id, x.source(), x.keys, x.valueOpts, x._default);
            });
         }
      });
   }
   //
   // u.CreateDropdown(`selectIngredientFood${j}`, d.foods, true, undefined, 'Food'); // recipe > add ingredients
   // u.CreateDropdown(`selectIngredientMorv${j}`, e.morvEnum, false, undefined, 'morv'); // recipe > morv
   //

   function RefreshDataLists(EV) {
      var d = DATA.dict;
      var c = DATA.config;

      var dataListConfig = [{
            id: 'allergenList',
            sourceArr: function() {
               return c.enums.allergenEnum;
            },
            type: 'config'
         },
         {
            id: 'food',
            sourceArr: function() {
               return u.GetKeysExFns(d.foods).sort();
            },
            type: 'dict'
         },
         {
            id: 'specialPeople',
            sourceArr: function() {
               return u.GetKeysExFns(c.enums.specialsEnum)
            },
            type: 'config'
         }
      ];

      dataListConfig.forEach(obj => {
         if (EV.detail.global && EV.detail.type === obj.type) {
            var domObj = u.ID(obj.id);
            if (domObj != null) {
               domObj.innerHTML = "";
            } else {
               domObj = u.CreateEl('dataList').id(obj.id).parent(u.ID('dataLists')).end();
            }
            obj.sourceArr().forEach(ea => {
               var newOpt = u.CreateEl('option').parent(domObj).value(ea).end();
            });
         }
      });
   }

   function get_ids(configObj) {
      var numberOfRows = u.ID(configObj.table).rows.length;
      var output = [];
      for (let i = 0; i < numberOfRows; i++) {
         output.push(`${configObj.idPrefix}${i}`)
      }
      return output;
   }

   return {
      Initialise: Initialise, // initialise dropdown listeners
   };
}