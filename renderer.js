// preamble
    // This file is required by the index.html file and will
    // be executed in the renderer process for that window.
    // All of the Node.js APIs are available in this process.

    /*
    a NOTE ON MORV
    MORV - morv is an array in t2Recipes, but a value in t2 ingredients and t3.
    When multiplying up, the multiplier looks at the recipe morv. Only if that morv is 'null' will the multiplier look any further.
    If recipe morv = b, all ingredients will be 'b'
    */

    "use strict"
    var fs = require ("fs");
    var timespan = require("timespan");    

    var ts = new timespan.TimeSpan();
    console.log(ts)
    
//
// create data structures (dictionaries and enums)
    /* 3 dictionaries:
    t1 - food
    t2 - recipes > ingredients > food
    t3 - menus > meals > recipes > ingredients > food */

    const Dict = []

    // create Dict[1]
        Dict[1] =
        {
        addFood (thing,unit,shop,foodType) //add a food to t1
        { 
            if (typeof thing != "string") {console.log(`invalid input: ${thing} not a string`)}
            else if (typeof unit != "string" && unit != null) {console.log(`invalid input: ${unit} not a string or null`)}
            else if (shopEnum.indexOf(shop)<0){console.log(`invalid input: ${shop} not in the shop enum`)}
            else { this[thing] = {unit:unit,shop:shop,foodType:foodType}; }
        },
        getFood(x) {
        return this[x]
        },
        deleteFood(x) {
            delete this[x]
            console.log(`deleting ${x} from Dict[1]`)
        },
        importJSON(){
            let input = JSON.parse(fs.readFileSync("Dict[1].json",{encoding:"utf8"}))
            for (var thing in input)
            {
            if (input.hasOwnProperty(thing))
            {
                this[thing]=input[thing]
            }
            }
        },
        };
    //
    // create Dict[2]
        Dict[2] =
        {
        addRecipe (recipeTitle, mealType, morv, serves, method, recipeType)
        {
            if (typeof recipeTitle != "string") {console.log(`invalid input: ${recipeTitle} not a string`)}
            else if (mealTypeEnum.indexOf(mealType)<0){console.log(`invalid input: ${mealType} not in the mealType enum`)}  
            else if (recipeTypeEnum.indexOf(recipeType)<0){console.log(`invalid input: ${recipeType} not in the recipeType enum`)}
            else if (typeof morv != "object") {console.log(`invalid input: ${morv} not an object`)}
            else if (typeof method != "string") {console.log(`invalid input: ${method} not a string`)}
            else if (typeof serves != "number") {console.log(`invalid input: ${serves} not a number`)}
            else {this[recipeTitle] = {mealType:mealType,morv:morv,serves:serves,method:method,recipeType:recipeType,ingredients:{}}; }
        },
        addIngredient (recipeTitle,foodName,quantitySmall,morv) {
            if (typeof foodName != "string") {console.log(`invalid input: ${foodName} not a string`)}
            //    else if (!(foodName in obj)) {console.log(`invalid input: ${foodName} isn't in Dict[1]`)}
            else if (typeof quantitySmall != "number") {console.log(`invalid input: ${quantitySmall} not a number`)}
            else if (morvEnum.indexOf(morv)<0){console.log(`invalid input: ${morv} not in the morv enum`)}
            else {
                let t1Food = Dict[1][foodName]
                this[recipeTitle].ingredients[foodName] = {food:[],morv:morv,quantitySmall:quantitySmall,quantityLarge:null};
                this[recipeTitle].ingredients[foodName].food = {thing:t1Food.thing, unit:t1Food.unit, shop:t1Food.shop};    
            }
        },
        getRecipe(x) {
        return this[x]
        },
        getIngredient(x,y) {
            return this[x].ingredients[y]
        },
        getFood(x,y) {
            return this[x].ingredients[y].food
        },
        deleteRecipe(x) {
            delete this[x]
            console.log(`deleting ${x} from Dict[2]`)
        },
        importJSON(){
            let input = JSON.parse(fs.readFileSync("Dict[2].json",{encoding:"utf8"}))
            for (var recipeTitle in input) {
            if (input.hasOwnProperty(recipeTitle)) {
                this[recipeTitle]=input[recipeTitle]
            }
            }
        },
        };
    //
    // create Dict[3]
        Dict[3] =
        {
        addMenu (menuTitle,startDate,endDate) {
            if (typeof menuTitle != "string") {console.log(`invalid input: ${menuTitle} not a string`)}
            //   else if (typeof startDate != "object") {console.log(`invalid input: ${startDate} not an object`)}
            //   else if (typeof endDate != "object") {console.log(`invalid input: ${endDate} not an object`)}
                else {
                this[menuTitle] = {startDate:startDate,endDate:endDate,meateaters:null,vegetarians:null,meals:[]};
                }
        },
        addMeal (menuTitle,mealType,date) {
            if (typeof menuTitle != "string") {console.log(`invalid input: ${menuTitle} not a string`)}
            else if (mealTypeEnum.indexOf(mealType)<0){console.log(`invalid input: ${mealType} not in the mealType enum`)}
            else if (typeof date != "object") {console.log(`invalid input: ${date} not an object`)}
            else {
                let newMeal = {mealType:mealType, date:date, recipes:[]};
                if(this[menuTitle].meals.length === 0){
                    this[menuTitle].meals[0] = newMeal
                }
                else{
                    for (let i=0; i<this[menuTitle].meals.length; i++){
                        console.log(`i i ${i}`)
                        console.log(compareMeal(newMeal,this[menuTitle].meals[i]))
                        let compare = compareMeal(newMeal,this[menuTitle].meals[i])
                        if (compare ===0){
                            console.log("tried to add repeated meal. Meal not added.")
                            break
                        }
                        else if(compare===1 && i===this[menuTitle].meals.length-1){ // check if the meal needs to go at the end of the array
                                this[menuTitle].meals[i+1] = newMeal; break
                        }    
                        else if (compare === -1){
                            this[menuTitle].meals.splice(i, 0, newMeal); break                            
                        }
                    }                
                }
            }
        },
        addRecipe (menuTitle,mealID,recipeTitle,morv) {
            let t2Recipe = Dict[2][recipeTitle]
            if (typeof menuTitle != "string") {console.log(`invalid input: ${menuTitle} not a string`)}
            else if (typeof mealID != "number") {console.log(`invalid input: ${mealID} not a number`)}
            else if (typeof recipeTitle != "string") {console.log(`invalid input: ${recipeTitle} not a string`)}    
            else if (morvEnum.indexOf(morv)<0){console.log(`invalid input: ${morv} not in the morv enum`)}
            else 
            {
                let i = (Object.keys(this[menuTitle].meals[mealID].recipes).length)
                let recipe = this[menuTitle].meals[mealID].recipes[i]
                this[menuTitle].meals[mealID].recipes[i] =
                {
                    recipeTitle:recipeTitle,
                    mealType:t2Recipe.mealType,
                    morv:morv, // inherits morv from input (user chooses morv for this instance of the recipe)
                    serves:t2Recipe.serves,
                    method:t2Recipe.method,
                    recipeType:t2Recipe.recipeType,
                    ingredients:{}
                }
                if(morv==="v" && t2Recipe.morv.indexOf("b")===0){
                    let ingredientsKey = Object.keys(t2Recipe.ingredients)
                    for(let j=0; j<ingredientsKey.length-1; j++){
                        let ingredientName = ingredientsKey[j]
                        let ingredient = t2Recipe.ingredients[ingredientName]
                        if(ingredient.morv==="m"){continue}
                        this[menuTitle].meals[mealID].recipes[i].ingredients[ingredientName]=ingredient
                    }
                }
                else if(morv==="m" && t2Recipe.morv.indexOf("b")===0){
                    let ingredientsKey = Object.keys(t2Recipe.ingredients)
                    for(let j=0; j<ingredientsKey.length-1; j++){
                        let ingredientName = ingredientsKey[j]
                        let ingredient = t2Recipe.ingredients[ingredientName]
                        if(ingredient.morv==="v"){continue}
                        this[menuTitle].meals[mealID].recipes[i].ingredients[ingredientName]=ingredient
                    }
                }
                else{this[menuTitle].meals[mealID].recipes[i].ingredients=t2Recipe.ingredients}

            }
            if(typeof this[menuTitle].meateaters==="number"){
            this.multiplyUp(menuTitle,this[menuTitle].meateaters,this[menuTitle].vegetarians)
            }
        },  
        multiplyUp (menuTitle,meateaters,vegetarians) {
            this[menuTitle].meateaters = meateaters
            this[menuTitle].vegetarians = vegetarians
            for (var mealKey in Dict[3][menuTitle].meals) {
            if(this[menuTitle].meals.hasOwnProperty(mealKey))
            {
                for (var recipeKey in this[menuTitle].meals[mealKey].recipes) {
                if(this.getMeal(menuTitle,mealKey).recipes.hasOwnProperty(recipeKey))
                {
                    let recipe = this.getRecipe(menuTitle,mealKey,recipeKey)
                    for (var ingredientKey in recipe.ingredients) {
                    if(recipe.ingredients.hasOwnProperty(ingredientKey))
                    {
                        let ingredient = this.getIngredient(menuTitle,mealKey,recipeKey,ingredientKey)
                        if (recipe.morv === "m"){
                        ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*this[menuTitle].meateaters
                        }
                        else if (recipe.morv === "v"){
                        ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*this[menuTitle].vegetarians
                        }
                        else if (recipe.morv === "b") {
                        ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*(this[menuTitle].vegetarians+this[menuTitle].meateaters)                
                        }
                        else if (recipe.morv === null){
                        if (ingredient.morv === "v"){
                            ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*this[menuTitle].vegetarians
                        }
                        else if (ingredient.morv === "m"){
                            ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*this[menuTitle].meateaters
                        }
                        else if (ingredient.morv === "b"){
                            ingredient.quantityLarge = (ingredient.quantitySmall/recipe.serves)*(this[menuTitle].vegetarians+this[menuTitle].meateaters)                                    
                        }
                        else {console.log(`invalid ingredient morv: ${ingredient.morv}`)}
                        }
                        else {console.log(`invalid recipe morv: ${recipe.morv}`)}
                        
                    }
                    }
                }
                }
            }
            }
        },
        getMenu(x) {
        return this[x]
        },
        getMeal(x,y) {
            return this[x].meals[y]
        },
        getRecipe(x,y,z) {
            return this[x].meals[y].recipes[z]
        },
        getIngredient(x,y,z,a) {
            return this[x].meals[y].recipes[z].ingredients[a]
        },
        getFood(x,y,z,a) {
            return this[x].meals[y].recipes[z].ingredients[a].food
        },
        deleteMenu(x) {
            delete this[x]
            console.log(`deleting ${x} from Dict[3]`)
        },
        // need to add deleteMeal function
        deleteMeal(menuTitle,mealID){
            this[menuTitle].meals.splice(mealID,1)
        },
        deleteRecipe(menuTitle,mealID,recipeID){
            console.log(`deleting ${this[menuTitle].meals[mealID].recipes[recipeID].recipeTitle} from Dict[3]`)                        
            this[menuTitle].meals[mealID].recipes.splice(recipeID,1)
        },
        importJSON(){
            var input = null;
            try { input = JSON.parse(fs.readFileSync("Dict[3].json",{encoding:"utf8"})) }
            catch (e)
            {
                if(e){console.log("Exception captured during json parsing " + e) }
            }

            if(input) //checks if input has been initialised
            {
                for (var menuTitle in input) {
                    if (input.hasOwnProperty(menuTitle)) {
                        this[menuTitle]=input[menuTitle]
                    }
                }
            }
        },
        }; 
    //    
    // create enums
        const mealTypeEnum = ["breakfast","snack","lunch","dinner"]      
        const recipeTypeEnum = ["core","dessert core","veg","starch","sauce","other"] 
        const morvEnum = ["b","v","m",null]  
        const morvOpts = ["b","v","m","v / b"]   
        const shopEnum = ["Bakers","Bookers","Peterlee","Pigotts","Tesco","Troutts","Wrenns","Other"] 
        const foodTypeEnum = ["alcohol","alium","citrus","dairy","fish","fruit","green veg","herb","meat","nut","seed","spice","staple","starch","sweet","veg","other"]    
        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    //
//
// TAB: Add Food
    ID("addfood_btn").addEventListener("click", AddFoodBtn)

    function AddFoodBtn ()
    {
        let thing = ID("foodThing").value.toLowerCase()
        let shop = ID("selectFoodShop").value
        let foodType = ID("selectFoodType").value
        
        if (ID("foodUnit").value === ""){ //set unit as null when blank
            Dict[1].addFood(thing,null,shop,foodType)
        }
        else {         
            let unit = ID("foodUnit").value
            Dict[1].addFood(thing,unit,shop,foodType)
        }
        writeDict(1)
        setValues([["foodThing",""],["foodUnit",""],["selectFoodShop","Shop"],["selectFoodType","Food Type"]])

        for (let i=0; i+1 < ID("ingredientTable").rows.length; i++){
            if(ID(`selectIngredientFood${i}`).value==="Food"){
            ClearDropdown(`selectIngredientFood${i}`,"Food")
            CreateDropdown(`selectIngredientFood${i}`,Dict[1],true) // recipe > add ingredients
            }
        }
    }
//
// TAB: Add Recipe
    //
    ID("addRecipe_btn").addEventListener("click", AddRecipeBtn)    
    function AddRecipeBtn ()
    {
        let title = ID("recipeTitle").value
        let mealType = ID("selectRecipeMealType").value
        let recipeType = ID("selectRecipeType").value    
        let serves = parseInt(ID("recipeServes").value)
        let method = ID("recipeMethod").value
        let morvInput = ID("recipeMorv").value  
        
        if (morvInput === "v / b"){
            Dict[2].addRecipe(title, mealType, ["v","b"], serves, method, recipeType)
        }
        else (
            Dict[2].addRecipe(title, mealType, [morvInput], serves, method, recipeType)
        )       
        //ADD INGREDIENTS 
            for (let i = 0; i+1 < ID("ingredientTable").rows.length; i++) { 
                let foodName = ID(`selectIngredientFood${i}`).value
                let quantitySmall = parseFloat(ID(`ingredientQuantitySmall${i}`).value)
                if (ID(`selectIngredientMorv${i}`).value === "null")
                {
                    Dict[2].addIngredient(title,foodName,quantitySmall,null)                
                }
                else {
                let morv = ID(`selectIngredientMorv${i}`).value
                Dict[2].addIngredient(title,foodName,quantitySmall,morv)
                };
                ID(`selectIngredientFood${i}`).value = "Food"
                ID(`ingredientQuantitySmall${i}`).value = ""
                ID(`selectIngredientMorv${i}`).value = "null"
            }
            for (let i = ID("ingredientTable").rows.length; i > 2; i--) {   
                ID("ingredientTable").deleteRow(i-1);     
                }
            writeDict(2)
            setValues([["recipeTitle",""],["selectRecipeMealType","Meal Type"],["selectRecipeType","Recipe Type"],["recipeMorv","morv"],["recipeServes",""],["recipeMethod",""]])
        }
    //
    function createIngredientTable(){
        createRow("ingredientTable","th",["Food","Quantity","","Morv","-","+"],[40,18,12,12,6,6],"%")
        addIngredientsRow()
    }
    // create row in ingredients table - currently doesn't work if you start deleting random (non-end). Need to block user from removing past lines.    
        function addIngredientsRow()
        {
            let j = ID("ingredientTable").rows.length-1;
            let colhtml = []
            colhtml.push ("<select id='selectIngredientFood" + j + "'><option>Food</option></select>")    
            colhtml.push("<input type='number' id='ingredientQuantitySmall" + j + "' style='width:100%'>")
            colhtml.push("<text id ='ingredientUnitDisplay" + j + "'>")
            colhtml.push("<select id='selectIngredientMorv" + j + "'><option>null</option></select>")   
            colhtml.push("<input type='button' id='-ingbtn" + j + "' value='-' >")
            colhtml.push("<input type='button' id='+ingbtn" + j + "' value='+' >")

            createRow("ingredientTable","td",colhtml,[40,18,12,12,6,6],"%")
            CreateDropdown(`selectIngredientFood${j}`,Dict[1],true) // recipe > add ingredients
            CreateDropdown(`selectIngredientMorv${j}`,morvEnum,false) // recipe > morv            

            ID(`selectIngredientFood${j}`).addEventListener("change", DisplayUnit)

            function DisplayUnit () {
                if(ID(`selectIngredientFood${j}`).value === "Food"){
                    ID(`ingredientUnitDisplay${j}`).innerText=""                    
                }
                else{
                    let x = Dict[1][ID(`selectIngredientFood${j}`).value].unit
                    ID(`ingredientUnitDisplay${j}`).innerText=x    
                }
            }
            ID(`+ingbtn${j}`).addEventListener("click", addIngredientsRow)    

            ID(`-ingbtn${j}`).addEventListener("click", function(){
                ID("ingredientTable").deleteRow(j+1);             
            })
        }
    //
//
// TAB: Add Menu
    function AddMenuBtn ()
    {
        let title = ID("menuTitle").value
        let startDate = new Date (ID("menuStartDate").value)
        let endDate = new Date(ID("menuEndDate").value)
        Dict[3].addMenu(title,startDate,endDate)
        writeDict(3)
        createAddMealModal(title)                    
        setValues([["menuTitle",""],["menuEndDate",""],["menuStartDate",""]])        
    }

    // add meals to a menu (weekend - default)
        ID("add_weekend_menu").addEventListener("click", function(){
                {
                    let title = ID("menuTitle").value
                    let startDate = new Date(ID("menuStartDate").value)
                    let endDate = new Date(ID("menuEndDate").value)
                    let midDate =  new Date(ID("menuStartDate").value);
                    midDate.setDate(startDate.getDate() + 1);
                    
                    Dict[3].addMenu(title,startDate,endDate)

                    Dict[3].addMeal(title,"dinner",startDate)
                    Dict[3].addMeal(title,"breakfast",midDate)
                    Dict[3].addMeal(title,"snack",midDate)
                    Dict[3].addMeal(title,"lunch",midDate)
                    Dict[3].addMeal(title,"dinner",midDate)
                    Dict[3].addMeal(title,"breakfast",endDate)
                    Dict[3].addMeal(title,"lunch",endDate)
                    
                    Dict[3].addRecipe(title,1,"Standard Breakfast","b")
                    Dict[3].addRecipe(title,5,"Standard Breakfast","b")

                    writeDict(3) 
                    setValues([["menuTitle",""],["menuEndDate",""]["menuStartDate",""]])
                }
            })
    //
    // add meals to a custom menu
        CreateDropdown("selectMealTypeForAddMeals",mealTypeEnum,false)
        ID("addmenu_btn").addEventListener("click", AddMenuBtn)
        
        function createAddMealModal(menuTitle){
            let startDate = new Date(Dict[3][menuTitle].startDate)
            let endDate = new Date (Dict[3][menuTitle].endDate)
            console.log(startDate)
            console.log(endDate)
            if(endDate<startDate){console.log("End Date is after Start Date"); return null}
            ID("menuTitleForAddMeals").innerHTML = menuTitle
            // create list of dates
                let end = false
                let i = 0
                let dateList = []
                while (end===false){
                    dateList[i] = new Date (Dict[3][menuTitle].startDate)                 
                    dateList[i].setDate(startDate.getDate() + i);
                    if (dateList[i].getDate()===endDate.getDate()){end=true}
                    if(i===20){end=true; console.log("date range too large")}
                    i++                    
                }
                let dateEnum = []
                for (let j=0; j<dateList.length; j++){
                    let d = dateList[j]
                    dateEnum[j]=`${weekday[d.getDay()]} (${getFormalDate(d)})`
                }
                ClearDropdown("selectDayForAddMeals","Select Day")
                CreateDropdown("selectDayForAddMeals",dateEnum,false,dateList)
                CreateMealList()
                ID("addMealsToMenu").style = "display: block"                
            //
            // create list of meals
            }
        function CreateMealList(){
            let menuTitle = ID("menuTitleForAddMeals").innerHTML            
            setValues([["selectMealTypeForAddMeals","Select Meal"]])
            let mealDiv = ID("currentMealList")
            mealDiv.innerHTML=""
            let menu = Dict[3][menuTitle]
            for (let i = 0; i < menu.meals.length; i++) {
                let meal = Dict[3].getMeal(menuTitle,i) 
                let day = weekday[new Date (meal.date).getDay()]
                let mealTitleDiv = document.createElement("div")
                let mealTitle = document.createElement("text");
                html(mealTitleDiv,"","recipeTitleDiv","background-color:#cccccc")
                html(mealTitle,"","recipeTitle","","",`${day} ${meal.mealType}`)
                mealDiv.appendChild(mealTitleDiv);
                mealTitleDiv.appendChild(mealTitle);

                let deleteMealFromMenu = document.createElement("button")
                html(deleteMealFromMenu,"","removeRecipe","","","x")
                mealTitleDiv.appendChild(deleteMealFromMenu)

                deleteMealFromMenu.addEventListener("click",function(){
                    Dict[3].deleteMeal(menuTitle,i)
                    writeDict(3)
                    CreateMealList()            
                })
            }      
        }
        ID("addMeals_btn").addEventListener("click",AddMealBtn) 
        
        function AddMealBtn (){
            let menuTitle = ID("menuTitleForAddMeals").innerHTML
            Dict[3].addMeal(menuTitle,ID("selectMealTypeForAddMeals").value,new Date (ID("selectDayForAddMeals").value))
            CreateMealList()            
        }
        //
        // function to get date into 'th' format
            function getFormalDate(date){
                let d = date.getDate()
                let st = [1,21,31]
                let nd = [2,22]
                let rd = [3,23]
                if (st.indexOf(d)>-1){return `${d}st`}
                else if (nd.indexOf(d)>-1){return `${d}nd`}
                else if (rd.indexOf(d)>-1){return `${d}rd`}
                else {return `${d}th`}
            }
    //
//
// TAB: Admin
    // create filter row
        function createFilterRow(dictID,filterType){
            let tableID = `t${dictID}Table`
            let Table = ID(tableID)
            let filterRow = Table.insertRow()
            for (let i = 0; i < filterType.length; i++) {
                let filterCell = document.createElement("th");  
                filterRow.appendChild(filterCell);
                filterCell.addEventListener("change",function(){
                    createAdminTableContents(dictID)
                })    
                if(filterType[i]===null){}       
                else if (filterType[i]==="select"){
                    html(filterCell,`${tableID}Filter${i}`,"","",`<select id=${tableID}Filter${i}input><option value="All">All</option></select>`)                    
                }   
                else if (filterType[i]==="longText"){
                    html(filterCell,`${tableID}Filter${i}`,"","",`<input id=${tableID}Filter${i}input type='text' style='width:80%'><button id=${tableID}Filter${i}clear class='insideCellBtn'>x</button>`)                    
                    ID(`${tableID}Filter${i}clear`).addEventListener("click",function(){
                      ID(`${tableID}Filter${i}input`).value=""
                      createAdminTableContents(dictID)
                  })
                }
                else {   
                    html(filterCell,`${tableID}Filter${i}`,"","",`<input id=${tableID}Filter${i}input type='${filterType[i]}' class='tableTextInput'>`)
                }
            }
        }
    //
    // filter table function
        function FilterTable(dictID,id,parameters) //returns false if value should be filtered out
        {
                let keys = Object.keys(Dict[dictID]).sort()
                let filter = []
                let filterBool = []
                
                for  (let i=0; i<parameters.length; i++){
                    if (parameters[i]===null){filterBool[i]=true; continue}
                    let thing = Dict[dictID][keys[id]]
                    let thingName = keys[id].toLowerCase()
                    let property = parameters[i][0]
                    if(typeof ID(`t${dictID}TableFilter${i}input`).value === "string"){
                        filter[i]=ID(`t${dictID}TableFilter${i}input`).value.toLowerCase()                        
                    }
                    else {filter[i]=ID(`t${dictID}TableFilter${i}input`).value}
                    filterBool[i]=false
                    if(filter[i]===parameters[i][1]){filterBool[i]=true; continue}
                    if(parameters[i][0]==="key"){
                        if(thingName.indexOf(filter[i])>-1){filterBool[i]=true; continue}
                    }
                    else {
                        let thingProperty                        
                        if(typeof thing[property] === "string"){
                            thingProperty = thing[property].toLowerCase()                                                    
                        }
                        else {thingProperty = thing[property]}
                        if(thingProperty===null){continue}
                        if(thingProperty.indexOf(filter[i])>-1){filterBool[i]=true}                                            
                    }
                }
                let result = true                
                for (let i=0; i<filterBool.length; i++){
                    if (filterBool[i]===false){result = false}
                }
                return result
        }
    //
    // create admin table function
        function createAdminTable(tableID){
            let table = ID(`t${tableID}Table`)
            table.innerHTML=""
            if(tableID===1){
                createRow("t1Table","th",["Food Name","Unit","Shop","Type","-"],[40,15,15,15,5],"%")
                createFilterRow("1",["longText","longText","select","select",null],[true])
                CreateDropdown("t1TableFilter2input",shopEnum,false)
                CreateDropdown("t1TableFilter3input",foodTypeEnum,false) 
            }
            else if(tableID===2){
                createRow("t2Table","th",["Recipe Title","Meal","Type","Serves","Morv","-"],[55,15,15,10,10,5],"%")
                createFilterRow("2",["longText","select","select",null,"select",null])
                CreateDropdown("t2TableFilter1input",mealTypeEnum,false)
                CreateDropdown("t2TableFilter2input",recipeTypeEnum,false) 
                CreateDropdown("t2TableFilter4input",morvEnum,false) 
            }
            else if(tableID===3){
                createRow("t3Table","th",["Menu Title","Start Date","End Date","-"],[40,30,30,10],"%")
                createFilterRow("3",["text",null,null,null])
            }
            createAdminTableContents(tableID)                            
        }
    //
    // create admin table contents function
        function createAdminTableContents(inputTableID){
            let tableID=parseInt(inputTableID)
            let table = ID(`t${tableID}Table`)
            for(let i=table.rows.length; i>2; i--){
                table.deleteRow(i-1);   
            }
            let dictKeys = Object.keys(Dict[tableID]).sort()  
            for (let i = 0; i < dictKeys.length; i++) {
                let rowKey = Dict[tableID][dictKeys[i]]                                                    
                if(typeof rowKey==="function"){
                    continue
                }
                let j = table.rows.length-1;
                if(tableID===1){
                    let filter = FilterTable(1,i,[["key",""],["unit",""],["shop","all"],["foodType","all"]])   
                    if(filter===false){continue}
                    let newRow = table.insertRow(j+1); 
                    
                    let col = AddRow(newRow,5)
                    html(col[0],`t1TableKey${j}`,"","","",dictKeys[i])
                    html(col[1],`t1TableUnit${j}`,"","","",rowKey.unit)
                    html(col[2],`t1TableShop${j}`,"","","",rowKey.shop)
                    html(col[3],`t1TableFoodType${j}`,"","","",rowKey.foodType)
                    html(col[4],`t1RemoveLinebtn${j}`,"","","<input type='button' value='-'>")  

                    createEditCellListeners(`t1TableUnit${j}`,"text",`t1TableKey${j}`,1,"unit")
                    createEditCellListeners(`t1TableShop${j}`,"select",`t1TableKey${j}`,1,"shop",shopEnum,false)
                    createEditCellListeners(`t1TableFoodType${j}`,"select",`t1TableKey${j}`,1,"foodType",foodTypeEnum,false)
                        
                    // edit food name
                        ID(`t1TableKey${j}`).addEventListener("click", function editCell()
                        {
                            let cell = ID(`t1TableKey${j}`)
                            let oldValue = cell.innerText
                            cell.innerHTML = `<input type='text' id='t1TableFoodNameInput${j}' value='${oldValue}'><button id='t1TableFoodNameSave${j}' class='insideCellBtn'>✔</button>`
                            cell.className="tableInput"
                            ID(`t1TableKey${j}`).removeEventListener("click",editCell)
                            ID(`t1TableFoodNameSave${j}`).addEventListener("click", function editFood(){
                                let newValue = ID(`t1TableFoodNameInput${j}`).value
                                renameKey(oldValue,newValue,Dict[1])
                                // check whether food is present in any recipes
                                    let recipeKeys = Object.keys(Dict[2])  
                                    var impactedRecipes = []                   
                                    for (let k=0; k<recipeKeys.length; k++){
                                        let recipe = Dict[2][recipeKeys[k]]                                                    
                                        if(typeof recipe==="function"){
                                            continue
                                        }
                                        let ingredientKeys = Object.keys(recipe.ingredients)
                                        for (let x=0; x<ingredientKeys.length; x++){
                                            if(oldValue === ingredientKeys[x]){
                                                renameKey(oldValue,newValue,recipe.ingredients)
                                                impactedRecipes.push(recipeKeys[k])
                                            }
                                        }
                                    }
                                //
                                // check whether food is present in any menus (t3)
                                    let menuKeys = Object.keys(Dict[3]).sort()
                                    for (let k=0; k<menuKeys.length; k++){
                                        let menuTitle = menuKeys[k]
                                        if(typeof Dict[3][menuTitle]==="function"){
                                            continue
                                        }
                                        let mealKeys = Object.keys(Dict[3][menuTitle].meals)                                        
                                        for (let x=0; x<mealKeys.length; x++){
                                            let mealNo = parseInt(mealKeys[x])
                                            let recipeKeys = Object.keys(Dict[3][menuTitle].meals[mealNo].recipes)
                                            for (let y=0; y<recipeKeys.length; y++){
                                                let recipeNo = parseInt(recipeKeys[y])
                                                let recipe = Dict[3].getRecipe(menuTitle,mealNo,recipeNo)
                                                let recipeTitle = recipe.recipeTitle
                                                if(impactedRecipes.indexOf(recipeTitle) >-1 ){
                                                    let morv = recipe.morv
                                                    Dict[3].deleteRecipe(menuTitle,mealNo,recipeNo)
                                                    Dict[3].addRecipe(menuTitle,mealNo,recipeTitle,morv)
                                                }
                                            }
                                        }
                                    }
                                //
                                writeDict(1)                                
                                writeDict(2)  
                                writeDict(3)   
                              
                            })
                        }) 
                    // 
                }
                else if(tableID===2){
                    let filter = FilterTable(2,i,[["key",""],["mealType","all"],["recipeType","all"],null,["morv","all"]])               
                    if(filter===false){continue}
                    filter = FilterIngredient(i)
                    if(filter===false){continue}                    
                    
                    let newRow = table.insertRow(j+1); 
                    
                    let col = AddRow(newRow,6)
                    html(col[0],`t2TableKey${j}`,"","","",dictKeys[i])
                    html(col[1],`t2TableMeal${j}`,"","","",rowKey.mealType)
                    html(col[2],`t2TableType${j}`,"","","",rowKey.recipeType)
                    html(col[3],`t2TableServes${j}`,"","","",rowKey.serves)
                    html(col[4],`t2TableMorv${j}`,"","","",rowKey.morv)
                    html(col[5],`t2RemoveLinebtn${j}`,"","","<input type='button' value='-'>")  
                    
                    createEditCellListeners(`t2TableMeal${j}`,"select",`t2TableKey${j}`,2,"mealType",mealTypeEnum,false)
                    createEditCellListeners(`t2TableType${j}`,"select",`t2TableKey${j}`,2,"recipeType",recipeTypeEnum,false)
                    createEditCellListeners(`t2TableServes${j}`,"number",`t2TableKey${j}`,2)
    
                    // edit morv cell                        
                        ID(`t2TableMorv${j}`).addEventListener("click", function editCell()
                        {
                            let cell = ID(`t2TableMorv${j}`)
                            let key = ID(`t2TableKey${j}`).innerText   
                            let oldValue = Dict[2][key]["morv"]
                            cell.innerHTML = "<select id='Input_t2TableMorv" + j + "'><option>"+ oldValue + "</option></select><input type='button' value='✔' id='Save_t2TableMorv" + j + "'>"
                            CreateDropdown(`Input_t2TableMorv${j}`,morvOpts,false)  
                            cell.className="tableInput"
                            ID(`t2TableMorv${j}`).removeEventListener("click",editCell)
                            ID(`Save_t2TableMorv${j}`).addEventListener("click", function()
                            {
                                let newValue = ID(`Input_t2TableMorv${j}`).value
                                if(newValue === "v / b"){
                                    Dict[2][key]["morv"] = ["v","b"]
                                }
                                else{Dict[2][key]["morv"] = [newValue]}

                                writeDict(2)
                            })
                        })   
                    //

                    // edit recipe
                        // create event listener for clicking a recipeTitle in the admin screen 
                            ID(`t2TableKey${j}`).addEventListener("click", function()
                            {
                                // set inner text of 'add recipe' screen 
                                    let recipe = Dict[2][ID(`t2TableKey${j}`).innerText]
                                    let recipeTitle = ID(`t2TableKey${j}`).innerText
                                    ID("AddRecipePageTitle").innerText = "Edit Recipe"
                                    ID("recipeTitle").value = recipeTitle
                                    ID("selectRecipeMealType").value = recipe.mealType
                                    ID("selectRecipeType").value = recipe.recipeType
                                    if (recipe.morv.length > 1){ID("recipeMorv").value = "v / b"}
                                    else {ID("recipeMorv").value = recipe.morv}
                                    ID("recipeServes").value = recipe.serves
                                    ID("recipeMethod").value = recipe.method
                                    
                                    // loop to add ingredients
                                    let ingredientKey = Object.keys(recipe.ingredients)
                                        for(let i=0; i<ingredientKey.length; i++){
                                            let ingredient = Dict[2].getIngredient(recipeTitle,ingredientKey[i])
                                            ID(`selectIngredientFood${i}`).value=ingredientKey[i]
                                            ID(`ingredientQuantitySmall${i}`).value = ingredient.quantitySmall
                                            ID(`ingredientUnitDisplay${i}`).innerText = ingredient.food.unit
                                            ID(`selectIngredientMorv${i}`).value = ingredient.morv
                                            if (i===ingredientKey.length-1) {break}
                                            else {addIngredientsRow()}
                                    }

                                // open the AddRecipe tab and show 'save changes' button = editRecipe_btn
                                    hideElement("addRecipe_btn")
                                    showElement("editRecipe_btn","inline")
                                    openHTab("AddRecipe")
                            })  
                        //
                        //
                    //
                }
                else if(tableID===3){
                    let filter = FilterTable(3,i,[["key",""]])               
                    if(filter===false){continue}  
                    let newRow = table.insertRow(j+1); 
                    
                    
                    // generate display for start and end date
                        let rawStartDate = (new Date(rowKey.startDate))
                        let rawEndDate = (new Date(rowKey.endDate))
                        
                        let startDay = rawStartDate.getDate()
                        let startMonth = rawStartDate.getMonth()+1
                        let startYear = rawStartDate.getFullYear()
                        let startDate = `${startDay}/${startMonth}/${startYear}`

                        let endDay = rawEndDate.getDate()
                        let endMonth = rawEndDate.getMonth()+1
                        let endYear = rawEndDate.getFullYear()
                        let endDate = `${endDay}/${endMonth}/${endYear}`
                    //

                    let col = AddRow(newRow,4)
                    html(col[0],`t3TableKey${j}`,"","","",dictKeys[i])
                    html(col[1],`t3TableStartDate${j}`,"","","",startDate)
                    html(col[2],`t3TableEndDate${j}`,"","","",endDate)
                    html(col[3],`t3RemoveLinebtn${j}`,"","","<input type='button' value='-'>")  
                    
                    createEditCellListeners(`t3TableStartDate${j}`,"date",`t3TableTitle${j}`,3,"startDate")
                    createEditCellListeners(`t3TableEndDate${j}`,"date",`t3TableTitle${j}`,3,"endDate")                
                    
                }
                // event listener to delete row
                    let deleteRowContents = [null,"deleteFood","deleteRecipe","deleteMenu"]
                    if(ID(`t${tableID}RemoveLinebtn${j}`)===null){continue}
                    ID(`t${tableID}RemoveLinebtn${j}`).addEventListener("click", function()
                        {
                            Dict[tableID][deleteRowContents[tableID]](ID(`t${tableID}TableKey${j}`).innerText)                          
                            writeDict(tableID) 
                        })
                //
            } 
        }
    //
    // filter by ingredients functions
        // filter ingredient function
            function FilterIngredient(i){
                let filter = ID("ingredientSearchInput").value.toLowerCase()
                let recipeKeys = Object.keys(Dict[2]).sort()
                let ingredients = Dict[2][recipeKeys[i]].ingredients
                let ingredientsKeys = Object.keys(ingredients)
                let result = false
                for (let j=0; j<ingredientsKeys.length; j++){
                    let ingredient = ingredientsKeys[j]
                    if (ingredient.indexOf(filter)>-1){result=true}
                }
                return result
            } 
        //

        // add event listener for the ingredient sarch btn
            ID("ingredientSearchInput").addEventListener("change",function(){
                createAdminTableContents(2)  
            })

            ID("clearIngredientSearch").addEventListener("click", function(){
                ID("ingredientSearchInput").value=""
                createAdminTableContents(2)
            })
        //
    //
//
// TAB: View Menu
    // loads menu in 'edit menu' screen
        ID("selectViewMenu").addEventListener("change", SelectViewMenu)
        function SelectViewMenu (){
            let menuDiv = ID("viewMenuDiv")
            menuDiv.innerHTML="" //clear the child div
            let menuTitle = ID("selectViewMenu").value
            let menu = Dict[3].getMenu(menuTitle)
            if(menuTitle === "Menu"){   }               
            else {
            for (let i = 0; i < menu.meals.length; i++) {
                let meal = Dict[3].getMeal(menuTitle,i) 
                let day = weekday[new Date (meal.date).getDay()]
                let mealTitle = document.createElement("h3");
                html(mealTitle,`mealTitle${i}`,"","display:inline-block","",`${day} ${meal.mealType}`)
                menuDiv.appendChild(mealTitle);
                if (Object.keys(meal.recipes).length > 0){
                    var showMealBtn = document.createElement("button");
                    html(showMealBtn,`showMealBtn${i}`,"mealbtn","display:inline","+")
                    var hideMealBtn = document.createElement("button");  
                    html(hideMealBtn,`hideMealBtn${i}`,"mealbtn","display:none","-")
                    menuDiv.appendChild(showMealBtn);
                    menuDiv.appendChild(hideMealBtn); 

                    ID(`showMealBtn${i}`).addEventListener("click",function(){
                        mealDiv.style="display: block"
                        ID(`showMealBtn${i}`).style = "display: none"
                        ID(`hideMealBtn${i}`).style = "display: :inline"                
                    })
                    ID(`hideMealBtn${i}`).addEventListener("click",function(){
                        mealDiv.style="display: none"
                        ID(`hideMealBtn${i}`).style = "display: none"                                
                        ID(`showMealBtn${i}`).style = "display: inline"
                    })
                }

                menuDiv.appendChild(document.createElement("br"));
                let mealDiv = document.createElement("div")            
                menuDiv.appendChild(mealDiv)
                html(mealDiv,`mealDiv${i}`,"mealDiv","display:none")

                //
                // adds recipe
                    // adds recipe title 
                        for (let j=0; j<meal.recipes.length; j++) {
                            let recipe = Dict[3].getRecipe(menuTitle,i,j)                        
                            let recipeTitle = document.createElement("h4");    
                            if(recipe.morv === "b"){
                                html(recipeTitle,`recipeTitle${i}${j}`,"","display: inline-block","",`${recipe.recipeTitle} (${recipe.serves})`)             
                            } 
                            else{
                                html(recipeTitle,`recipeTitle${i}${j}`,"","display: inline-block","",`${recipe.recipeTitle} (${recipe.serves}) - ${recipe.morv} `)                                             
                            }
                            ID(`mealDiv${i}`).appendChild(recipeTitle); 
                    //
                    // adds + and - buttons
                        var showRecipeBtn = document.createElement("button");
                        html(showRecipeBtn,`showRecipeBtn${i}${j}`,"recipebtn","display:inline","+")
                        var hideRecipeBtn = document.createElement("button");   
                        html(hideRecipeBtn,`hideRecipeBtn${i}${j}`,"recipebtn","display:none","-")                        
                        mealDiv.appendChild(showRecipeBtn);
                        mealDiv.appendChild(hideRecipeBtn); 

                        ID(`showRecipeBtn${i}${j}`).addEventListener("click", function(){
                            ID(`recipeDiv${i}${j}`).style="display: block; width:50%"
                            ID(`showRecipeBtn${i}${j}`).style = "display: none"
                            ID(`hideRecipeBtn${i}${j}`).style = "display: inline"                
                        })

                        ID(`hideRecipeBtn${i}${j}`).addEventListener("click",function(){
                            ID(`recipeDiv${i}${j}`).style="display: none"
                            ID(`hideRecipeBtn${i}${j}`).style = "display: none"                                
                            ID(`showRecipeBtn${i}${j}`).style = "display: inline"
                        })
                    //
                    // add recipe Div
                        let recipeDiv = document.createElement("div")
                        html(recipeDiv,`recipeDiv${i}${j}`,"recipeDiv","display:none")
                        mealDiv.appendChild(recipeDiv);
                        mealDiv.appendChild(document.createElement("br"))
                    //
                    // adds ingredients table
                        let ingredientTableDiv = document.createElement("div");      
                        ingredientTableDiv.id = `ingredientTableDiv${i}${j}`         
                        let ingredientTable = document.createElement("table");       
                        ingredientTable.id = `ingredientTable${i}${j}`              
                        
                        ID(`recipeDiv${i}${j}`).appendChild(ingredientTableDiv);   // Add the div to 'menuDiv'
                        ID(`ingredientTableDiv${i}${j}`).appendChild(ingredientTable);   // Add the table to the div                

                        let ingredientKey = Object.keys(recipe.ingredients)                
                        for (let k = 0; k < ingredientKey.length; k++) {
                            let ingredient = Dict[3].getIngredient(menuTitle,i,j,ingredientKey[k])
                            let html = []
                            let ids = []
                            html.push(ingredientKey[k])

                            if (ingredient.quantityLarge===null){
                                html.push(`(${ingredient.quantitySmall})`); 
                                html.push(ingredient.quantityLarge);  
                                html.push(ingredient.food.unit);    
                            }
                            else {
                                let display = DisplayIngredient(ingredient.quantitySmall,ingredient.quantityLarge,ingredient.food.unit)
                                for (let x=0; x<3; x++){
                                    html.push(display[x])
                                }
                            }
                            for (let x=0; x<4; x++){
                                ids.push(`${i}${j}${k}${x}`)
                            }
                            createRow(`ingredientTable${i}${j}`,"td",html,[50,10,10,30],"%",ids)
                            ID(`${i}${j}${k}1`).style.fontSize="11px" 
                        }                     
                        let method = document.createElement("p"); 
                        var methodHTML = recipe.method.replace(/(?:\r\n|\r|\n)/g, '<br><br>');                        
                        ID(`ingredientTableDiv${i}${j}`).appendChild(method);
                        method.innerHTML = methodHTML
                    }
                }
            }
        }      
//
// TAB: Edit Menu
    // add recipe to menu function   
        //create filter dropdowns
            // function to create list of checkboxes
                function CreateFilterList(oldEnum,newEnum,checkboxID,divID){
                    // populate newEnum
                    newEnum[0]="All"
                    for (let i=0; i<oldEnum.length; i++){
                        newEnum[i+1] = oldEnum[i]
                    }
                    // create checkboxes
                    for (let i=0; i<newEnum.length;i++){
                        let checklist = ID(divID)
                        let checkbox = document.createElement("input")
                        let checkboxLabel = document.createElement("label")
                        html(checkbox,`${checkboxID}${i}`)
                        html(checkboxLabel,"","filterLabel","","",newEnum[i])
                        checkbox.setAttribute("checked","true")
                        
                        checkbox.setAttribute("type", "checkbox");
                        checklist.appendChild(checkbox);
                        checklist.appendChild(checkboxLabel);
                        checklist.appendChild(document.createElement("br"));
                    }

                    // check everything on an 'all' box
                        ID(`${checkboxID}0`).addEventListener("change",function(){
                            if(this.checked){
                                for (let i=1; i<newEnum.length;i++){
                                    ID(`${checkboxID}${i}`).checked=true                          
                                }    
                            }
                            else{
                                for (let i=1; i<newEnum.length;i++){
                                    ID(`${checkboxID}${i}`).checked=false                          
                                }    
                            }
                        })
                }
            //
            // call function to create checkboxes
                var morvEnum2 = ["b","v","m"]
                var mealTypeFilter = []
                var recipeTypeFilter = []
                var morvFilter = []
                CreateFilterList(mealTypeEnum,mealTypeFilter,"mealTypeCheckbox","mealTypeFilters")
                CreateFilterList(recipeTypeEnum,recipeTypeFilter,"recipeTypeCheckbox","recipeTypeFilters")
                CreateFilterList(morvEnum2,morvFilter,"morvCheckbox","morvFilters") 
            //      
            // Apply filters button
                ID("addRecipeApplyFilters").addEventListener("click",function(){
                // create recipe keys list
                    let oldRecipeKeys=Object.keys(Dict[2])
                    let newRecipeKeys=[]                    
                    let filteredMealTypeEnum = []
                    let filteredRecipeTypeEnum = []
                    let filteredMorvEnum = []

                    // create enums for each filter
                    function CreateFilterEnums(filterEnum,checkboxID,resultEnum){
                        for(let i=1; i<filterEnum.length; i++){
                            if(ID(`${checkboxID}${i}`).checked === true){
                                resultEnum.push(filterEnum[i])
                            }
                        }    
                    }

                    CreateFilterEnums(mealTypeFilter,"mealTypeCheckbox",filteredMealTypeEnum)
                    CreateFilterEnums(recipeTypeFilter,"recipeTypeCheckbox",filteredRecipeTypeEnum)
                    CreateFilterEnums(morvFilter,"morvCheckbox",filteredMorvEnum)
                    
                    // check if mealType is correct
                        for(let i=0; i<oldRecipeKeys.length; i++){
                            if(typeof Dict[2][oldRecipeKeys[i]]==="function"){
                                continue
                            }        
                            let mealType=Dict[2][oldRecipeKeys[i]].mealType
                            let recipeType=Dict[2][oldRecipeKeys[i]].recipeType
                            let morv=Dict[2][oldRecipeKeys[i]].morv  

                            let filteredMorv=null
                            for(let j=0; j<morv.length;j++){
                                if(filteredMorvEnum.indexOf(morv[j])>-1){
                                    filteredMorv=true
                                }
                            }
                            
                            if(
                                filteredMealTypeEnum.indexOf(mealType)>-1 &&
                                filteredRecipeTypeEnum.indexOf(recipeType)>-1 &&
                                filteredMorv===true
                            ){

                                    newRecipeKeys.push(oldRecipeKeys[i])
                            }
                        }
                        ClearDropdown("selectRecipeForMenu","Choose Recipe")
                        CreateDropdown("selectRecipeForMenu",newRecipeKeys,false)
                    })
                //
            //
            // Clear filters button
                ID("addRecipeClearFilters").addEventListener("click",function(){
                    ClearFilters(mealTypeFilter,"mealTypeCheckbox")
                    ClearFilters(recipeTypeFilter,"recipeTypeCheckbox")
                    ClearFilters(morvFilter,"morvCheckbox")
                })
                    
                function ClearFilters(filterEnum,checkboxID) {
                    for (let i=0; i<filterEnum.length;i++){
                        ID(`${checkboxID}${i}`).checked=true                          
                    }   
                }
            
            //
        //
        // add recipe to menu button + create modal
            ID("addRecipeToMenu_btn").addEventListener("click", function(){
                ID("addRecipeToMenu").style = "display: block"
                ID("selectMenuForNewRecipe").value=ID("selectEditMenu").value
                    // create meal dropdown
                    // clear anything that's already there
                    ID("selectMealForMenu").innerHTML="<option>Choose Meal</option>"
                    //
                    // create meal enum & dropdon          
                    let menu = Dict[3][ID("selectMenuForNewRecipe").value]
                    let mealEnum = []
                    for (let i = 0; i < menu.meals.length; i++) {   
                        let day = weekday[new Date (menu.meals[i].date).getDay()]
                        mealEnum.push(`${day} ${menu.meals[i].mealType}`)
                    }   
                    let values =[]
                    for(let i = 0; i < mealEnum.length; i++) {values[i]=i}
                    CreateDropdown("selectMealForMenu",mealEnum,false,values)
                            
            })

            ID("addRecipeCancel_btn").addEventListener("click",function(){
                ID('addRecipeToMenu').style = "display=:none"
            })

            ID("addRecipeToMenu_submit").addEventListener("click", function(){
                let menuTitle = ID("selectMenuForNewRecipe").value
                let mealID = parseInt(ID("selectMealForMenu").value)
                let recipeTitle = ID("selectRecipeForMenu").value
                let morv = ID("selectMorvForMenu").value
                
                Dict[3].addRecipe(menuTitle,mealID,recipeTitle,morv)
                writeDict(3) 
                SelectEditMenu()
                setValues([["selectMealForMenu","Choose Meal"],["selectRecipeForMenu","Choose Recipe"],["selectMorvForMenu","Choose Morv"]])
            })
    //
    // create select meal dropdown from menu (in edit menu > add recipe)
        ID("selectMenuForNewRecipe").addEventListener("change", function(){
            // clear anything that's already there
            ID("selectMealForMenu").innerHTML="<option>Choose Meal</option>"
            //
            // create meal enum & dropdon          
            let menu = Dict[3][ID("selectMenuForNewRecipe").value]
            let mealEnum = []
            for (let i = 0; i < menu.meals.length; i++) {   
                let day = weekday[new Date (menu.meals[i].date).getDay()]
                mealEnum.push(`${day} ${menu.meals[i].mealType}`)
            }   
            // creating my own dropdown as needs different displays and values
            let values =[]
            for(let i = 0; i < mealEnum.length; i++) {values[i]=i}
            CreateDropdown("selectMealForMenu",mealEnum,false,values)            
        })
    //
    // multiply up a menu
        ID("multiplyUp_btn").addEventListener("click", function(){
            ID("multiplyUp").style = "display: block"
            ID("selectMenuForMultiplyUp").value=ID("selectEditMenu").value            
        })
        ID("multiplyUpCancel_btn").addEventListener("click",function(){
            ID('multiplyUp').style = "display=:none"
        })
        ID("multiplyUp_submit").addEventListener("click", function(){
            let menuTitle = ID("selectMenuForMultiplyUp").value
            let meateaters = parseInt(ID("multiplyUpMeateaters").value)
            let vegetarians = parseInt(ID("multiplyUpVegetarians").value)

            Dict[3].multiplyUp(menuTitle,meateaters,vegetarians)
            writeDict(3)
            setValues([["selectMenuForMultiplyUp","Choose Menu"],["multiplyUpMeateaters",""],["multiplyUpVegetarians",""],["selectViewMenu",menuTitle]])
            ID('multiplyUp').style = "display=:none" 
            SelectEditMenu()
        })
    //
    // create list of meals and recipes (includes remove recipe button)
        ID("selectEditMenu").addEventListener("change", SelectEditMenu)
        function SelectEditMenu (){
            let menuDiv = ID("editMenuDiv")
            menuDiv.innerHTML=""
            let menuTitle = ID("selectEditMenu").value
            let menu = Dict[3].getMenu(menuTitle)
            if(menuTitle === "Menu"){ }               
            else {
                for (let i = 0; i < menu.meals.length; i++) {
                    let meal = Dict[3].getMeal(menuTitle,i) 
                    let day = weekday[new Date (meal.date).getDay()]
                    let mealTitle = document.createElement("text");
                    html(mealTitle,`mealTitle${i}`,"mealTitle","display:inline-block","",`${day} ${meal.mealType}`)
                    menuDiv.appendChild(mealTitle);

                    menuDiv.appendChild(document.createElement("br"));
                    let mealDiv = document.createElement("div")            
                    menuDiv.appendChild(mealDiv)
                    html(mealDiv,`mealDiv${i}`)
                    //
                    // adds recipe
                        // adds recipe title 
                        let recipeTitlePlaceholder = document.createElement("div")  
                        html(recipeTitlePlaceholder,`recipeTitlePlaceholder${i}0`,"recipeTitlePlaceholder")
                        mealDiv.appendChild(recipeTitlePlaceholder);
                        recipeDragDrop(null,recipeTitlePlaceholder)
                        
                            for (let j=0; j<meal.recipes.length; j++) {
                                let recipe = Dict[3].getRecipe(menuTitle,i,j) 
                                let recipeTitleDiv = document.createElement("div") 
                                let recipeTitlePlaceholder = document.createElement("div")   
                                
                                html(recipeTitleDiv,`recipeTitleDiv${i}${j}`,"recipeTitleDiv")
                                html(recipeTitlePlaceholder,`recipeTitlePlaceholder${i}${j+1}`,"recipeTitlePlaceholder")
                                
                                let recipeTitle = document.createElement("text"); 
                                if(recipe.morv === "b"){
                                    html(recipeTitle,`recipeTitle${i}${j}`,"recipeTitle","","",`${recipe.recipeTitle}`)             
                                } 
                                else{
                                    html(recipeTitle,`recipeTitle${i}${j}`,"recipeTitle","","",`${recipe.recipeTitle} - ${recipe.morv} `)                                             
                                }
                                if (recipe.recipeType==="dessert core"){recipeTitleDiv.style="background-color:#F28D18"}
                                else if (recipe.recipeType==="core"){recipeTitleDiv.style="background-color:#23D08A"}
                                
                                mealDiv.appendChild(recipeTitleDiv);
                                mealDiv.appendChild(recipeTitlePlaceholder);
                                recipeTitleDiv.appendChild(recipeTitle);
                                recipeDragDrop(recipeTitle,recipeTitlePlaceholder)
                                
                                let deleteRecipeFromMenu = document.createElement("button")
                                html(deleteRecipeFromMenu,`deleteRecipe${i}${j}`,"removeRecipe","","","x")
                                recipeTitleDiv.appendChild(deleteRecipeFromMenu)

                                deleteRecipeFromMenu.addEventListener("click",function(){
                                    Dict[3].deleteRecipe(menuTitle,i,j)
                                    writeDict(3)
                                    SelectEditMenu()
                                })

                            }
                        
                    //             
                //
                }
            }
        }      
    //
    // create functions to support recipe drag and drop
        var dragRecipeID = null;
        function recipeDragDrop(draggable,droppable){
            if(draggable){
                draggable.setAttribute("draggable", true);
                draggable.addEventListener("dragstart",function(){
                    dragRecipeID = event.target.id
                });
            }
            if(droppable){
                droppable.addEventListener("dragover",function(){
                    allowDrop(event)
                    event.target.style = "height:20px; background-color:#eee; width:304px"                                
                })
                droppable.addEventListener("dragleave",function(){
                    event.target.style = "height:5px; background-color:#ffffff; width:304px"
                })  
                droppable.addEventListener("drop",function(){
                    drop(event)
                    event.target.style = "height:5px; background-color:#ffffff; width:304px"
                    let draggedMealID = parseInt(dragRecipeID.slice(-2,-1))
                    let droppedMealID = parseInt(event.target.id.slice(-2,-1))
                    let draggedRecipeID = parseInt(dragRecipeID.slice(-1))
                    let droppedRecipeID = parseInt(event.target.id.slice(-1))

                    if (draggedMealID !== droppedMealID){console.log("you dragged to another meal! cheat")}
                    if (draggedRecipeID === droppedRecipeID || (draggedRecipeID + 1) === droppedRecipeID){
                        console.log("you didn't move")
                         SelectEditMenu()
                        }
                    else{
                        let menuTitle = ID("selectEditMenu").value
                        let meal = Dict[3].getMeal(menuTitle,draggedMealID)
                        let oldRecipes = meal.recipes
                        let newRecipes = []
                        if(draggedRecipeID > droppedRecipeID){
                            // add recipes that haven't moved to newRecipes
                            for (let i=0;i<droppedRecipeID;i++){
                                newRecipes[i]=oldRecipes[i]
                            }
                            for (let i=oldRecipes.length-1;i>draggedRecipeID;i--){
                                newRecipes[i]=oldRecipes[i]
                            }
                            // add recipes that have moved by 1 to newRecipes
                            for (let i=droppedRecipeID; i<draggedRecipeID; i++){
                                newRecipes[i+1]=oldRecipes[i]
                            }
                            // add the recipe that you moved
                            newRecipes[droppedRecipeID] = oldRecipes[draggedRecipeID]
                            meal.recipes = newRecipes
                        }
                        else { //draggedID < droppedID
                            // add recipes that haven't moved to newRecipes
                            for (let i=0;i<draggedRecipeID;i++){
                                newRecipes[i]=oldRecipes[i]
                            } 
                            for (let i=oldRecipes.length-1;i>droppedRecipeID;i--){
                                newRecipes[i]=oldRecipes[i]
                            }
                            // add recipes that have moved by 1 to newRecipes
                            for (let i=draggedRecipeID+1; i<droppedRecipeID+1; i++){
                                newRecipes[i-1]=oldRecipes[i]
                            }
                            // add the recipe that you moved
                            if(droppedRecipeID===oldRecipes.length)
                            {
                                newRecipes[droppedRecipeID-1] = oldRecipes[draggedRecipeID]
                            }
                            else{
                                newRecipes[droppedRecipeID] = oldRecipes[draggedRecipeID]
                            }
                            meal.recipes = newRecipes
                        }
                        writeDict(3)
                        SelectEditMenu()
                    }
                })
            }
        }   

    //
    // add a meal (note full function is in add menu tab)
        ID("editMealsEditMenu_btn").addEventListener("click",function(){
            ID("addMealsToMenu").style = "display: block"
            createAddMealModal(ID("selectEditMenu").value)
        })
    
    //
//
// TAB: Shopping
    // create buttons and divs
        var shoppingDiv = ID("Shopping")
        for (let i=0; i < shopEnum.length; i++ ){
            let btn = document.createElement("button")
            html(btn,`shoppingbtn${shopEnum[i]}`,"shoppingbtn","","",shopEnum[i])
            shoppingDiv.appendChild(btn);

        }
        for (let i=0; i < shopEnum.length; i++ ){
            let div = document.createElement("div")
            shoppingDiv.appendChild(div);
            html(div,`shoppingdiv${shopEnum[i]}`,"shoppingbtn","display:none")            

            let shoppingTable = document.createElement("table")
            div.appendChild(shoppingTable)
            html(shoppingTable,`shoppingtable${shopEnum[i]}`,"shoppingTable")
        }
    //
    // create divs and tables
        ID("selectMenuForShopping").addEventListener("change",function(){
        for (let i=0; i < shopEnum.length; i++ ){
            ID(`shoppingtable${shopEnum[i]}`).innerHTML=""           
            
            let rowNumber = 0                        
            
            let menuTitle = ID("selectMenuForShopping").value
            let menu = Dict[3].getMenu(menuTitle)
                let mealKey = Object.keys(menu.meals)
                for (let j=0; j < mealKey.length; j++){
                    let meal = Dict[3].getMeal(menuTitle,j) 
                    let recipeKey = Object.keys(meal.recipes)
                    for (let k=0; k < recipeKey.length; k++){
                        let recipe = Dict[3].getRecipe(menuTitle,j,recipeKey[k])   
                        let ingredientKey = Object.keys(recipe.ingredients)  
                        for (let l = 0; l < ingredientKey.length; l++) {
                            let ingredient = Dict[3].getIngredient(menuTitle,j,recipeKey[k],ingredientKey[l])                
                            if (ingredient.food.shop === shopEnum[i]){
                                let numberOfRows = ID(`shoppingtable${shopEnum[i]}`).rows.length
                                if (numberOfRows === 0){
                                  //  let shoppingTableRow = ID(`shoppingtable${shopEnum[i]}`).insertRow(rowNumber);           
                                    
                                  //  let col = AddRow(shoppingTableRow,3)
                                    let cellIDs =[]
                                    for (let x=0; x<3; x++){
                                         cellIDs[x] = `${menuTitle}${shopEnum[i]}row${rowNumber}col${x}`
                                    }
                                    createRow(`shoppingtable${shopEnum[i]}`,"td",[ingredientKey[l],ingredient.quantityLarge,ingredient.food.unit],[50,30,20],"%",cellIDs)                                    
                                            
                                    rowNumber++;
                                    }
                                else {
                                    for (let m = 0; m < numberOfRows; m++){
                                        if (ID(`${menuTitle}${shopEnum[i]}row${m}col0`).innerText === ingredientKey[l] ){
                                                let currentValue = parseFloat(ID(`${menuTitle}${shopEnum[i]}row${m}col1`).innerText)
                                                let newValue = currentValue + ingredient.quantityLarge
                                                ID(`${menuTitle}${shopEnum[i]}row${m}col1`).innerText = newValue
                                                break;
                                            }
                                        else if (m === numberOfRows-1){                                         
                                            let cellIDs =[]
                                            for (let x=0; x<3; x++){
                                                 cellIDs[x] = `${menuTitle}${shopEnum[i]}row${rowNumber}col${x}`
                                            }
                                            createRow(`shoppingtable${shopEnum[i]}`,"td",[ingredientKey[l],ingredient.quantityLarge,ingredient.food.unit],[50,30,20],"%",cellIDs)                                                                               
                                            rowNumber++; 
                                        }
                                        else { continue }  
                                        }
                                    }
                                }                           
                            }
                        }                             
                    }
                    let numberOfRows = ID(`shoppingtable${shopEnum[i]}`).rows.length
                    for (let n=0; n < numberOfRows; n++){
                        let col = []
                        col[0] = ID(`${menuTitle}${shopEnum[i]}row${n}col0`)
                        col[1] = ID(`${menuTitle}${shopEnum[i]}row${n}col1`)
                        col[2] = ID(`${menuTitle}${shopEnum[i]}row${n}col2`)
                        let unit = null
                        let quantityLarge=parseFloat(col[1].innerText);
                            if (col[2].innerText !== null){                                
                                unit = col[2].innerText
                            }
                            let display = DisplayIngredient(null,quantityLarge,unit)
                            col[1].innerText = display[1]
                            col[2].innerText = display[2]
                    }
                }
        })

    //
    // create hide/show listeners
        function ShowShoppingDiv(i){
            for (let j=0; j < shopEnum.length; j++){
                if (i===j){
                    showElement(`shoppingdiv${shopEnum[j]}`,"block")
                }
                else{
                    hideElement(`shoppingdiv${shopEnum[j]}`)
                }
            }
        }

        for (let i=0; i < shopEnum.length; i++ ){            
            ID(`shoppingbtn${shopEnum[i]}`).addEventListener("click",function()
            {ShowShoppingDiv(i)}
            )
        }


    //

//
// CREATE Printable Menu
    // event listener for the print menu button
        ID("printMenubtn").addEventListener('click', function (event) {
            showElement("PrintMenu","block")
            GeneratePrintMenu()
            hideElement("mainApp")
            let menuTitle = ID("selectViewMenu").value.replace("/","-")
            let rand = (Math.random()*1000).toFixed(0)
            ipc.send('print-to-pdf',`${menuTitle}_menu_${rand}.pdf`)
        })
    //
    //function GeneratePrintMenu
        function GeneratePrintMenu (){
            let menuDiv = ID("PrintMenu")
            menuDiv.innerHTML="" //clear the child div
            let menuTitle = ID("selectViewMenu").value
            let menu = Dict[3].getMenu(menuTitle)
            for (let i = 0; i < menu.meals.length; i++) {
                let meal = Dict[3].getMeal(menuTitle,i) 
                let day = weekday[new Date (meal.date).getDay()]
                let mealTitle = document.createElement("h3");
                html(mealTitle,`printMealTitle${i}`,"printMealTitle","display:block","",`${day} ${meal.mealType}`)
                menuDiv.appendChild(mealTitle);

                let mealDiv = document.createElement("div")            
                menuDiv.appendChild(mealDiv)
                html(mealDiv,`printMealDiv${i}`,"mealDiv")

                //
                // adds recipe
                    // adds recipe title 
                        for (let j=0; j<meal.recipes.length; j++) {
                            let recipe = Dict[3].getRecipe(menuTitle,i,j)                        
                            let recipeTitle = document.createElement("h4"); 
                            if(recipe.morv === "b"){
                                if(recipe.recipeType === "dessert core"){
                                    html(recipeTitle,`printRecipeTitle${i}${j}`,"printDessertRecipeTitle","display: block","",`${recipe.recipeTitle} (${recipe.serves})`)             
                                }
                                else {
                                html(recipeTitle,`printRecipeTitle${i}${j}`,"printRecipeTitle","display: block","",`${recipe.recipeTitle} (${recipe.serves})`)             
                                }
                            } 
                            else{
                                html(recipeTitle,`printRecipeTitle${i}${j}`,"","display: block","",`${recipe.recipeTitle} (${recipe.serves}) - ${recipe.morv} `)                                             
                            }
                            //
                            // add recipe Div
                                let recipeDiv = document.createElement("div")
                                html(recipeDiv,`printRecipeDiv${i}${j}`,"printRecipeDiv","display:block")
                                mealDiv.appendChild(recipeDiv);
                                recipeDiv.appendChild(recipeTitle);                     
                                mealDiv.appendChild(document.createElement("br"))
                            //
                            // adds ingredients table
                                let ingredientTableDiv = document.createElement("div");       // Create a <div> element
                                ingredientTableDiv.id = `printIngredientTableDiv${i}${j}`              // give the node an id
                                let ingredientTable = document.createElement("table");          // Create a <table> element
                                html(ingredientTable,`printIngredientTable${i}${j}`,"printIngredientTable","display:block")
                                
                                ID(`printRecipeDiv${i}${j}`).appendChild(ingredientTableDiv);   // Add the div to 'menuDiv'
                                ID(`printIngredientTableDiv${i}${j}`).appendChild(ingredientTable);   // Add the table to the div                

                                let ingredientKey = Object.keys(recipe.ingredients)                
                                for (let k = 0; k < ingredientKey.length; k++) {
                                //  let ingredientTableRow = ingredientTable.insertRow(k);           
                                    let ingredient = Dict[3].getIngredient(menuTitle,i,j,ingredientKey[k])
                                    let html = []
                                    let ids = []
                                    html.push(ingredientKey[k])
                                    
                                    if (ingredient.quantityLarge===null){
                                        html.push(`(${ingredient.quantitySmall})`); 
                                        html.push(ingredient.quantityLarge);  
                                        html.push(ingredient.food.unit);    
                                    }
                                    else {
                                        let display = DisplayIngredient(ingredient.quantitySmall,ingredient.quantityLarge,ingredient.food.unit)
                                        for (let x=0; x<3; x++){
                                            html.push(display[x])
                                        }
                                    }
                                    for (let x=0; x<4; x++){
                                        ids.push(`print${i}${j}${k}${x}`)
                                    }
                                    createRow(`printIngredientTable${i}${j}`,"td",html,[50,10,10,30],"%",ids)
                                    ID(`print${i}${j}${k}1`).style.fontSize="11px"                        
                                }
                                let method = document.createElement("p"); 
                                var methodHTML = recipe.method.replace(/(?:\r\n|\r|\n)/g, '<br><br>');                        
                                ID(`printIngredientTableDiv${i}${j}`).appendChild(method);
                                html(method,`printMethod${i}${j}`,"printMethod","display:block",methodHTML)
                        }
            }
        }   
    //
//
// CREATE Printable Shopping Lists
    // event listener for the print menu button
        ID("printShoppingbtn").addEventListener('click', function (event) {
            showElement("PrintShopping","block")
            GeneratePrintShopping()
            hideElement("mainApp")
            let menuTitle = ID("selectMenuForShopping").value.replace("/","-")
            let rand = (Math.random()*1000).toFixed(0)            
            ipc.send('print-to-pdf',`${menuTitle}_shopping_${rand}.pdf`)
        })
    //
    // function GeneratePrintShopping
        function GeneratePrintShopping(){
            let shoppingDiv = ID("PrintShopping")
            let menuTitle = ID("selectMenuForShopping").value
            for (let i=0; i<shopEnum.length; i++){
                let shop = shopEnum[i]
                let shoppingTable = ID(`shoppingtable${shop}`)                
                if(shoppingTable.innerHTML===""){console.log("table is empty"); continue} //check if table is empty

                let printShoppingListTitle = document.createElement("h2")
                shoppingDiv.appendChild(printShoppingListTitle)
                html(printShoppingListTitle,`printShoppingTitle${i}`,"printShoppingList","","",`${menuTitle} - ${shop}`)

                // create array with list of foods from shopping table with row number as a property
                    let foodList = []                
                    for(let j=0; j<shoppingTable.rows.length; j++){
                        let foodName = ID(`${menuTitle}${shop}row${j}col0`).innerText
                        foodList[foodName]={foodName:foodName, rowNumber:j}                      
                    }
                    let foodListKeys = Object.keys(foodList)
                    foodListKeys.sort()
                    if(foodListKeys.length>10){
                        foodListKeys.sort(compareFoodType)                    
                    }          

                // print shopping list
                    let printShoppingTable = document.createElement("table")
                    shoppingDiv.appendChild(printShoppingTable)
                    html(printShoppingTable,`printshoppingtable${shop}`,"printShoppingTable")
                    let rowNumber = 0
                    for (let k=0; k<foodListKeys.length; k++){
                        let foodName = foodListKeys[k]                    
                        if(foodListKeys.length>10 && k>0 && Dict[1][foodName].foodType !== Dict[1][foodListKeys[k-1]].foodType)
                        {
                            let printShoppingTableRow = ID(`printshoppingtable${shop}`).insertRow(rowNumber);                                             
                            printShoppingTableRow.innerHTML="<td colspan=3 style='background-color:grey'></td>"
                            rowNumber++;                        
                        }
                        let HTML=[]
                        let tableRowNumber = foodList[foodName].rowNumber                    
                        for (let x=0; x<3; x++){
                            HTML[x]=ID(`${menuTitle}${shop}row${tableRowNumber}col${x}`).innerText;
                        }
                        createRow(`printshoppingtable${shop}`,"td",HTML,[200,50,50],"px")
                        rowNumber++;
                    }
                    if(i===1){
                        let essentialsNote = document.createElement("p")
                        shoppingDiv.appendChild(essentialsNote)
                        html(essentialsNote,"","essentialsNote","","","Don't forget to buy essentials: olive oil, milton, tea/coffee, tupperware, cocoa, biscuits")
                    }
            }
        }
    
//
// ONLOAD functions
    // Import the 3 dictionaries
        Dict[1].importJSON()
        Dict[2].importJSON()
        Dict[3].importJSON()
    //
    // List of dropdowns to create
        CreateDropdown("selectFoodShop",shopEnum,false) // add food > select shop    
        CreateDropdown("selectFoodType",foodTypeEnum,false) // add food > select food type    
        CreateDropdown("selectRecipeMealType",mealTypeEnum,false) // add recipe > select meal type
        CreateDropdown("selectRecipeType",recipeTypeEnum,false) // add recipe > select recipe type
        CreateDropdown("recipeMorv",morvOpts,false) // add recipe > select morv    
        CreateDropdown("selectViewMenu",Dict[3],true) // view menu > select menu
        CreateDropdown("selectEditMenu",Dict[3],true) // edit menu > select menu
        CreateDropdown("selectMenuForNewRecipe",Dict[3],true) // edit menu > add recipe > select menu
        CreateDropdown("selectRecipeForMenu",Dict[2],true) // edit menu > add recipe > select recipe
        CreateDropdown("selectMorvForMenu",morvEnum,false) // edit menu > add recipe > select morv
        CreateDropdown("selectMenuForMultiplyUp",Dict[3],true) // edit menu > multiply up > select menu    
        CreateDropdown("selectMenuForShopping",Dict[3],true) // shopping > select menu
    //
    // functions to create tables on load
        createIngredientTable()
        createAdminTable(1)
        createAdminTable(2)
        createAdminTable(3)
    //

//
// GENERAL utility functions 
    // when user clicks elsewhere, modals close
            var multiplyModal = ID("multiplyUp");
            var addRecipeModal = ID("addRecipeToMenu");
            var addMealModal = ID("addMealsToMenu")
            
            window.onclick = function(closeModals) {
                if (closeModals.target == addRecipeModal) {
                    addRecipeModal.style = "display none";
                    SelectEditMenu()                    
                }
                else if (closeModals.target == multiplyModal) {
                    multiplyModal.style = "display: none"
                    SelectEditMenu()                    
                }
                else if (closeModals.target == addMealModal) {
                    addMealModal.style = "display: none"
                    SelectEditMenu()                    
                } 
            }
    //
    // function to change quantities into sensible sizes
        function DisplayIngredient(quantitySmall,quantityLarge,unit){
            let x =`(${quantitySmall})`;            
            let y = quantityLarge
            let z = unit
            if (quantitySmall===null){let x = 1}

            if (unit==="g" && quantityLarge > 1000){
                x=`(${quantitySmall/1000})`;
                y=parseFloat((quantityLarge/1000).toFixed(2))
                z="kg"  
            }
            else if(unit==="ml" && quantityLarge > 1000){
                x=`(${quantitySmall/1000})`;
                y=parseFloat((quantityLarge/1000).toFixed(2))
                z="l"                  
            }
            else if (unit==="null" || unit === "tsp" || unit === "loaves" || unit === "bunches"){
                y=quantityLarge.toFixed(0);                 
            }
            else if(quantityLarge > 100){
                y = Math.round(quantityLarge/5)*5
            }
            else if (Number.isInteger(quantityLarge)){
                y=quantityLarge.toFixed(0);  
            }
            else {
                y=parseFloat(quantityLarge.toPrecision(2))
            }
            return[x,y,z]                                
        }
    //
    // function to add row to a cell
        function AddRow(rowName,numberOfRows) {
            var output = []
            for (let i=0; i<numberOfRows; i++){
                output.push(rowName.insertCell(i))
            }
            return output
        }
    //
    // create table row
        function createRow(tableID,cellType,cellInnerHtml,cellWidth,widthUnit,cellIDs){
            let Table = ID(tableID)
            let newRow = Table.insertRow()

            for (var i = 0; i < cellInnerHtml.length; i++) {
                let newCell = document.createElement(cellType);
                html(newCell,"","",`width:${cellWidth[i]}${widthUnit}`,cellInnerHtml[i])
                if(typeof cellIDs === "object"){newCell.id=cellIDs[i]}
                newRow.appendChild(newCell);
            }
        }
    //
    // function to add contents to a row of cells
        function AddRowContent(cells,contents){
            for (let i=0; i<cells.length;i++)
                cells[i].innerHTML = contents[i]
        }
    //
    // function to edit cell
        function createEditCellListeners(cellID,inputType,keyID,dictID,property,dropdownSource,dropdownKeys){
        ID(cellID).addEventListener("click", function editCell()
        {
            let cell = ID(cellID)
            let key = ID(keyID).innerText   
            let oldValue = Dict[dictID][key][property]
            if (inputType === "text" || inputType === "number"){
                cell.innerHTML = `<input type='${inputType}' id='Input_${cellID}' value='${oldValue}' class='tableTextInput'><button id='Save_${cellID}' class='insideCellBtn'>✔</button>`
            }
            else if (inputType === "select"){
                cell.innerHTML = `<select id='Input_${cellID}'><option>${oldValue}</option></select><button id='Save_${cellID}' class='insideCellBtn'>✔</button>`                
                CreateDropdown(`Input_${cellID}`,dropdownSource,dropdownKeys)  
            }
            cell.className="tableInput"
            ID(cellID).removeEventListener("click",editCell)
            ID(`Save_${cellID}`).addEventListener("click", function saveNewCell()
            {
                let newValue = ID(`Input_${cellID}`).value
                Dict[dictID][key][property] = newValue
                writeDict(dictID)
            })
        })   
        }   
    //
    // open h-tab - change tab contents when you use tab
        // create listeners for each button
            var HtabList=document.getElementsByClassName("htablinks")
            for (let i=0; i<HtabList.length; i++){
                let btnID = HtabList[i].id
                let tabIDlength = btnID.length-6
                let tabID = btnID.slice(0,tabIDlength)
                ID(btnID).addEventListener("click",function() {
                    openHTab(tabID)
                })    
            }
        // function that changes display when you press button
            function openHTab(tabName) {
                var i, tabcontent, tablinks;
                tabcontent = document.getElementsByClassName("htabcontent");
                for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                }
                tablinks = document.getElementsByClassName("htablinks");
                for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
                }
                document.getElementById(tabName).style.display = "block";
                event.currentTarget.className += " active";
                if(tabName="AdminTabBtn") // removes padding from Admin tab
                {ID("Admin")} // TO BE COMPLETED
            }
    //
    // open v-tab - change tab contents when you use tab
        var VtabList=document.getElementsByClassName("vtablinks")
        for (let i=0; i<VtabList.length; i++){
            let btnID = VtabList[i].id
            let tabIDlength = btnID.length-6
            let tabID = btnID.slice(0,tabIDlength)
            ID(btnID).addEventListener("click",function() {
                openVTab(tabID)
            })    
        }
        // function that changes display when you press button
            function openVTab(tabName) {
                var i, tabcontent, tablinks;
                tabcontent = document.getElementsByClassName("vtabcontent");
                for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                }
                tablinks = document.getElementsByClassName("vtablinks");
                for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
                }
                document.getElementById(tabName).style.display = "block";
                event.currentTarget.className += " active";
            }
    //
    // function 'writeDict' to write to dictionaries
        function writeDict(dictID){
            fs.writeFileSync(`Dict[${dictID}].json`,JSON.stringify(Dict[dictID]),{encoding:"utf8"}) 
            createAdminTableContents(dictID)            
        }
    //
    // function to shorten 'document.getElementById' to 'ID'
        function ID(elementID){
            return document.getElementById(elementID)
        }
    //
    // function to set attributes of an html object: id, classname, style, innerHTML and innerText
        function html(variable,id,className,style,innerHTML,innerText,value) {
            if (variable === ""){
                console.log("variable was blank")
            }
            else{
                if (id !== undefined && id !== "") {variable.id=id} else {}; 
                if (className !== undefined && className !== "") {variable.className=className} else {};            
                if (style !== undefined && style !== ""){variable.style=style} else {};            
                if (innerHTML !== undefined && innerHTML !== "") {variable.innerHTML=innerHTML} else {};            
                if (innerText !== undefined && innerText !== "") {variable.innerText=innerText} else {};          
                if (value !== undefined && value !== "") {variable.value=value} else {};          
            }
        }
    //
    // function to create dropdowns
        function CreateDropdown(elementID,source,keys,valueOpts) {
            var select = ID(elementID);
            if (keys === true){
                var options = Object.keys(source).sort()              
            }
            else {
                var options = source
            }
            if (typeof valueOpts !== "object"){
                valueOpts = []
                for (let x=0; x<options.length; x++){
                    valueOpts[x] = options[x]
                }
            }
            for(let i = 0; i < options.length; i++) {
                let displayOpt = options[i];
                let valueOpt = valueOpts[i]
                if (keys === true){
                    if(typeof source[displayOpt]==="function"){
                        continue
                    }
                }
                let el = document.createElement("option");
                el.textContent = displayOpt;
                el.value = valueOpt;
                select.appendChild(el);
            }
        }
    //
    // function to clear drop down and put in default option  
        function ClearDropdown(elementID,option){
            ID(elementID).innerHTML="";
            let opt = document.createElement("option");
            opt.textContent = option        
            opt.value = option
            ID(elementID).appendChild(opt)
        }
    //
    // functions to facilitate drag and drop
        function allowDrop(ev) {
            ev.preventDefault();
        }
        function drop(ev) {
            ev.preventDefault();
        }

    //
    // function to return to normal once pdf has printed
        const ipc = require('electron').ipcRenderer
        ipc.on('wrote-pdf', function (event, path) {
        hideElement("PrintMenu")
        hideElement("PrintShopping")
        showElement("mainApp","block")
        console.log(`Wrote PDF to: ${path}`)
        })
    //
    // function to compare food types of two foods
        function compareFoodType(a, b) {
            let foodtypea = Dict[1][a].foodType
            let foodtypeb = Dict[1][b].foodType

            let comparison = 0;
            if (foodtypea > foodtypeb) {
            comparison = 1;
            } else if (foodtypea < foodtypeb) {
            comparison = -1;
            }
            else if (a > b){
                comparison = 1
            }
            else if (a < b){
                comparison = -1
            }
            return comparison;
        }
    //
    // function to compare food types of two foods: 1 means a is after b, -1 means a should be before b
        function compareMeal(a, b) {
            let aDate = new Date(a.date)
            let bDate = new Date(b.date)
            let comparison = 0;
            if (aDate > bDate) {
            comparison = 1;
            } else if (aDate < bDate) {
            comparison = -1;
            }
            else if (mealTypeEnum.indexOf(a.mealType) > mealTypeEnum.indexOf(b.mealType)){
                comparison = 1
            }
            else if (mealTypeEnum.indexOf(a.mealType) < mealTypeEnum.indexOf(b.mealType)){
                comparison = -1
            }
            return comparison;
        }
    //
    // create event listener for 'save changes' button to support t2 > 'edit recipe' functionality
        ID("editRecipe_btn").addEventListener("click", function(){
            Dict[2].deleteRecipe(ID("recipeTitle"))
            AddRecipeBtn()
            writeDict(2)
            ID("t2Table").innerHTML=""
            ID("AddRecipePageTitle").innerText = "Add Recipe" 
            showElement("addRecipe_btn","inline")
            hideElement("editRecipe_btn")
            openHTab("Admin")                            
            openVTab("t2RecipeDict")
        })  
    //
    // rename key function
        function renameKey(oldKeyName,newKeyName,location){
            if (oldKeyName !== newKeyName) {
                Object.defineProperty(location, newKeyName,Object.getOwnPropertyDescriptor(location, oldKeyName));
                delete location[oldKeyName];
            }      
        }
    //
    // function to set values for a given list of IDs
        function setValues(input){
            for(let i=0; i<input.length; i++){
                ID(input[i][0]).value=input[i][1]
            }
        }
    //
    // show and hide functions
        function showElement(id,display){
            ID(id).style=`display:${display}`
        }
        function hideElement (id){
            ID(id).style="display:none"
        }
    //
//
