var u = require("./UtilityFunctions.js")



function RefreshDropdowns(Dict) {
    var e = Dict[4]


    // Create array of menu names
    var menuValList = u.GetKeysExFns(Dict[3]).sort((a, b) => {
        return u.Compare(Dict[3][a].startDate, Dict[3][b].startDate)
    });

    var menuNameList = menuValList.map(menuTitle => {
        var menu = Dict[3].getMenu(menuTitle);
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
            source: e.morvEnum,
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
            source: Dict[2],
            keys: true,
            ids: ['selectRecipeForMenu'],
            _default: 'Recipe',
        },
        {
            source: e,
            keys: true,
            ids: ['selectAdminEnum'],
            _default: 'Enum'
        }
    ];


    dropdownConfig.forEach(x => {
        x.ids.forEach(id => {
            var _default = x._default;
            var domObj = u.ID(id);
            if (domObj != null) {
                if (domObj.value != null && domObj.value != undefined && domObj.value != "") _default = domObj.value;
            }
            u.CreateDropdown(id, x.source, x.keys, x.valueOpts, _default);
        })
    })
}

function RefreshDataLists(Dict) {

    var dataListConfig = [
        {
            id: 'allergenList',
            sourceArr: Dict[4].allergenEnum
        },
        {
            id: 'food',
            sourceArr: u.GetKeysExFns(Dict[1]).sort()
        },
        {
            id:'specialPeople',
            sourceArr: u.GetKeysExFns(Dict[4].specialsEnum)
        }
    ]

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
        })

    })
}

module.exports = {
    RefreshDropdowns: RefreshDropdowns, // refreshes all dropdowns
    RefreshDataLists: RefreshDataLists // refreshes all datalists
}