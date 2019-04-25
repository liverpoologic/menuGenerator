var tagsInput = require('tags-input');

module.exports = function(DATA) {
    var d = DATA.dict;
    var c = DATA.config;
    var u = require('../../utilities')(DATA);
    const els = DATA.els.edit.people;

    function generator() {
        var tabcontent = u.ID('people_tab_content');
        CreatePageEls(tabcontent);
        DATA.els.edit.selectMenu.addEventListener('change', CreatePeopleList);

        //event listener to load people list page when menu is selected
        els.saveBtn.addEventListener('click', saveAllergens);

        els.plusButton.addEventListener('click', addAllergenRow);

        // window.addEventListener('update', UpdateListener);
    }

    function CreatePageEls(parentDiv) {
        els.peopleDiv = u
            .CreateEl('div')
            .parent(parentDiv)
            .style('display:none')
            .end();
        els.peopleTable = u
            .CreateEl('table')
            .parent(els.peopleDiv)
            .className('ingredientTable')
            .style('margin-top:15px')
            .id('specialsTable')
            .end();
        els.peopleTableHeader = u
            .CreateEl('tr')
            .parent(els.peopleTable)
            .end();

        var cells = [
            {
                title: 'Person',
                width: 60
            },
            {
                title: 'Allergens',
                width: 200
            },
            {
                title: 'Foods',
                width: 300
            },
            {
                title: 'Morv',
                width: 40
            },
            {
                title: '',
                width: 15
            }
        ];

        cells.forEach(ea => {
            u.CreateEl('th')
                .parent(els.peopleTableHeader)
                .innerText(ea.title)
                .style(`width:${ea.width}px`)
                .end();
        });

        //add 'plus' row
        let plusRow = els.peopleTable.insertRow();
        console.log(plusRow);

        // plusRow.className = 'addItemRow';
        let plusCell = u
            .CreateEl('td')
            .parent(plusRow)
            .className('addItemCell')
            .end();
        els.plusButton = u
            .CreateEl('button')
            .parent(plusCell)
            .className('ingredientTableButton')
            .end();
        u.Icon('plus', els.plusButton);

        u.Br(els.peopleDiv);
        els.saveBtn = u
            .CreateEl('button')
            .parent(els.peopleDiv)
            .innerText('Save')
            .end();
    }

    function CreatePeopleList(event) {
        RefreshAllergenTable(event.target.value);
        if (DATA.els.edit.selectMenu.value != '_default') {
            els.peopleDiv.style = 'display:block';
        } else {
            els.peopleDiv.style = 'display:none';
        }
    }

    function RefreshAllergenTable(menuTitle) {
        if (menuTitle == '_default') return;

        //clear everything that isn't the header row or the last 'plus' row
        for (var i = 1; i < els.peopleTable.rows.length - 1; ) {
            els.peopleTable.deleteRow(i);
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
        var i = els.peopleTable.rows.length;

        rowIndex = rowIndex ? rowIndex : i - 1;
        var newRow = els.peopleTable.insertRow(rowIndex);

        var inputConfig = [
            {
                elementType: 'input',
                type: 'text',
                key: 'person',
                id: 'agnPerson'
            },
            {
                elementType: 'input',
                type: 'tags',
                dropdownSource: 'allergenList',
                key: 'allergens',
                id: 'agnAllergen'
            },
            {
                elementType: 'input',
                type: 'tags',
                dropdownSource: 'food',
                key: 'foods',
                id: 'agnFoods'
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
        let ourEls = {};
        inputConfig.forEach((obj, ind) => {
            let inputId = obj.id ? `${obj.id}${i - 1}` : undefined;
            let cell = u
                .CreateEl('td')
                .parent(newRow)
                .className('cellWithInput')
                .end();
            ourEls[obj.key] = u
                .CreateEl(obj.elementType)
                .id(inputId)
                .className(obj.className)
                .type(obj.type)
                .parent(cell)
                .end();
            if (obj.type === 'tags') {
                var valArray = [];
                try {
                    valArray = specialData[obj.key];
                } catch (e) {}
                tagsInput(
                    ourEls[obj.key],
                    obj.dropdownSource,
                    'populate',
                    ',',
                    valArray
                );
            } else if (obj.elementType === 'button') {
                u.Icon('minus', ourEls[obj.key]);
            }
        });

        ourEls.person.setAttribute('list', 'specialPeople');
        if (personName) ourEls.person.setAttribute('value', personName);

        //TODO: fix this!
        var defaultVal = 'M or V';

        u.CreateDropdown(
            ourEls.morv.id,
            ['m', 'v'],
            false,
            undefined,
            'M or V'
        );

        if (specialData) {
            ourEls.morv.value = specialData.morv;
        }

        ourEls.person.addEventListener('change', selectPersonName);

        ourEls.minus.addEventListener('click', deleteAllergenRow);
    }

    function deleteAllergenRow() {
        let table = els.peopleTable;
        let i = u.GetNumber(event.target.id);

        //remove from dict obj if it exists
        var menuTitle = DATA.els.edit.selectMenu.value;
        var key = els.peopleTable.rows[i].cells[0].value;
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
        var menuTitle = DATA.els.edit.selectMenu.value;
        let table = els.peopleTable;
        var rowcount = table.rows.length - 1;

        for (let i = 1; i < rowcount; i++) {
            console.log(i);

            var personName = u.ID(`agnPerson${i}`).value;
            var allergens = getArr(`agnAllergen${i}`);
            var foods = getArr(`agnFoods${i}`);
            var morv = u.ID(`peopleMorv${i}`).value;

            if (!personName || morv === 'morv' || (!allergens && !foods))
                continue;

            d.menus.changeAllergyType(
                menuTitle,
                personName,
                allergens,
                foods,
                morv
            );
        }
        d.write();
        RefreshAllergenTable(menuTitle);
    }

    function getArr(id) {
        var thing = u.ID(id).value;
        return thing ? thing.split(',') : undefined;
    }

    function selectPersonName(event) {
        var name = event.target.value;
        console.log(event);
        var i = u.GetNumber(event.target.id);
        var specialsEnum = c.enums.specialsEnum;
        var specialNames = Object.keys(specialsEnum);

        if (specialNames.indexOf(name) >= 0) {
            var specialData = specialsEnum[name];
            els.peopleTable.deleteRow(i);
            addAllergenRow(name, specialData, i);
        }
    }

    return {
        generator: generator
    };
};
