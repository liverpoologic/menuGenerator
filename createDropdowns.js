var u = require("./UtilityFunctions.js");



function RefreshDropdowns(Dict,Config) {

    var e = Config.enums;

    // Create array of menu names
    var menuValList = u.GetKeysExFns(Dict.menus).sort((a, b) => {
        return u.Compare(Dict.menus[a].startDate, Dict.menus[b].startDate);
    });

    var menuNameList = menuValList.map(menuTitle => {
        var menu = Dict.menus.getMenu(menuTitle);
        return menu.startDate ? `${menuTitle} (${u.GetMMMyy(new Date(menu.startDate))})` : menuTitle;
    });

    var dropdownConfig = [
        {
            source: e.shopEnum,
            keys: false,
            ids: ['selectFoodShop'],
            _default: 'Shop'
        },
        {
            source: e.foodTypeEnum,
            keys: false,
            ids: ['selectFoodType'],
            _default: 'Food Type'
        },
        {
            source: e.mealTypeEnum,
            keys: false,
            ids: ['selectRecipeMealType', 'selectMealTypeForAddMeals'],
            _default: 'Meal Type'
        },
        {
            source: e.recipeTypeEnum,
            keys: false,
            ids: ['selectRecipeType'],
            _default: 'Food Type'
        },
        {
            source: e.morvOpts,
            keys: false,
            ids: ['recipeMorv'],
            _default: 'morv'
        },
        {
            source: e.recipeMorv,
            keys: false,
            ids: ['selectMorvForMenu'],
            _default: 'morv'
        },
        {
            source: menuNameList,
            keys: false,
            ids: ['selectViewMenu', 'selectEditMenu', 'selectMenuForNewRecipe', 'selectPeopleMenu', 'selectMenuForMultiplyUp', 'selectMenuForShopping'],
            _default: 'Choose Menu',
            valueOpts: menuValList
        },
        {
            source: Dict.recipes,
            keys: true,
            ids: ['selectRecipeForMenu'],
            _default: 'Recipe',
        },
        {
            source: e,
            keys: true,
            ids: ['selectAdminEnum'],
            _default: 'Select an Enum'
        }
    ];
    //To Do - validate that the checks for 'default' are all correct. Perhaps exchange with a single string 'default'

    dropdownConfig.forEach(x => {
        x.ids.forEach(id => {
            // var _default = x._default;
            // var domObj = u.ID(id);
            // if (domObj != null) {
            //     if (domObj.value != null && domObj.value != undefined && domObj.value != "") _default = domObj.value;
            // }
            u.CreateDropdown(id, x.source, x.keys, x.valueOpts,x._default);
        });
    });
}

function RefreshDataLists(Dict,Config) {

    var dataListConfig = [
        {
            id: 'allergenList',
            sourceArr: Config.enums.allergenEnum
        },
        {
            id: 'food',
            sourceArr: u.GetKeysExFns(Dict.foods).sort()
        },
        {
            id:'specialPeople',
            sourceArr: u.GetKeysExFns(Config.enums.specialsEnum)
        }
    ];

    dataListConfig.forEach(obj => {
        var domObj = u.ID(obj.id);
        if (domObj != null) {
            domObj.innerHTML = "";
        }
        else {
            domObj = u.CreateEl('dataList').id(obj.id).parent(u.ID('dataLists')).end();
        }
        obj.sourceArr.forEach(ea => {
            var newOpt = u.CreateEl('option').parent(domObj).value(ea).end();
        });

    });
}

module.exports = {
    RefreshDropdowns: RefreshDropdowns, // refreshes all dropdowns
    RefreshDataLists: RefreshDataLists // refreshes all datalists
};
