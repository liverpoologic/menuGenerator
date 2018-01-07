// preamble
    // This file is required by the index.id file and will
    // be executed in the renderer process for that window.
    // All of the Node.js APIs are available in this process.

    /*
    a NOTE ON MORV
    MORV - morv is an array in t2Recipes, but a value in t2 ingredients and t3.
    When multiplying up, the multiplier looks at the recipe morv. Only if that morv is 'null' will the multiplier look any further.
    If recipe morv = b, all ingredients will be 'b'
    */
//
    var fs = require ("fs");
    var u = require("./UtilityFunctions.js")    
    var d = require("./Dicts.js") 
    var OnLoad = require("./onLoad.js")    
    var addFood = require("./tabAddFood.js")
    var addRecipe = require("./tabAddRecipe.js")
    var addMenu = require("./tabAddMenu.js")
    var editMenu = require("./tabEditMenu.js")
    var shopping = require("./tabShopping.js")
        
    var Dict = d.Dict 
    //
    OnLoad.OnLoad()  
    
// TAB: View Menu
    // loads menu in 'edit menu' screen
        u.ID("selectViewMenu").addEventListener("change", SelectViewMenu)
        function SelectViewMenu (){
            let menuDiv = u.ID("viewMenuDiv")
            menuDiv.innerHTML="" //clear the child div
            let menuTitle = u.ID("selectViewMenu").value
            let menu = Dict[3].getMenu(menuTitle)
            if(menuTitle === "Menu"){   }               
            else {
            for (let i = 0; i < menu.meals.length; i++) {
                let meal = Dict[3].getMeal(menuTitle,i) 
                let day = d.weekday[new Date (meal.date).getDay()]
                let mealTitle = document.createElement("h3");
                u.Html(mealTitle,`mealTitle${i}`,"","display:inline-block","",`${day} ${meal.mealType}`)
                menuDiv.appendChild(mealTitle);
                if (Object.keys(meal.recipes).length > 0){
                    var showMealBtn = document.createElement("button");
                    u.Html(showMealBtn,`showMealBtn${i}`,"mealbtn","display:inline","+")
                    var hideMealBtn = document.createElement("button");  
                    u.Html(hideMealBtn,`hideMealBtn${i}`,"mealbtn","display:none","-")
                    menuDiv.appendChild(showMealBtn);
                    menuDiv.appendChild(hideMealBtn); 

                    u.ID(`showMealBtn${i}`).addEventListener("click",function(){
                        mealDiv.style="display: block"
                        u.ID(`showMealBtn${i}`).style = "display: none"
                        u.ID(`hideMealBtn${i}`).style = "display: :inline"                
                    })
                    u.ID(`hideMealBtn${i}`).addEventListener("click",function(){
                        mealDiv.style="display: none"
                        u.ID(`hideMealBtn${i}`).style = "display: none"                                
                        u.ID(`showMealBtn${i}`).style = "display: inline"
                    })
                }

                menuDiv.appendChild(document.createElement("br"));
                let mealDiv = document.createElement("div")            
                menuDiv.appendChild(mealDiv)
                u.Html(mealDiv,`mealDiv${i}`,"mealDiv","display:none")

                //
                // adds recipe
                    // adds recipe title 
                        for (let j=0; j<meal.recipes.length; j++) {
                            let recipe = Dict[3].getRecipe(menuTitle,i,j)                        
                            let recipeTitle = document.createElement("h4");    
                            if(recipe.morv === "b"){
                                u.Html(recipeTitle,`recipeTitle${i}${j}`,"","display: inline-block","",`${recipe.recipeTitle} (${recipe.serves})`)             
                            } 
                            else{
                                u.Html(recipeTitle,`recipeTitle${i}${j}`,"","display: inline-block","",`${recipe.recipeTitle} (${recipe.serves}) - ${recipe.morv} `)                                             
                            }
                            u.ID(`mealDiv${i}`).appendChild(recipeTitle); 
                    //
                    // adds + and - buttons
                        var showRecipeBtn = document.createElement("button");
                        u.Html(showRecipeBtn,`showRecipeBtn${i}${j}`,"recipebtn","display:inline","+")
                        var hideRecipeBtn = document.createElement("button");   
                        u.Html(hideRecipeBtn,`hideRecipeBtn${i}${j}`,"recipebtn","display:none","-")                        
                        mealDiv.appendChild(showRecipeBtn);
                        mealDiv.appendChild(hideRecipeBtn); 

                        u.ID(`showRecipeBtn${i}${j}`).addEventListener("click", function(){
                            u.ID(`recipeDiv${i}${j}`).style="display: block; width:50%"
                            u.ID(`showRecipeBtn${i}${j}`).style = "display: none"
                            u.ID(`hideRecipeBtn${i}${j}`).style = "display: inline"                
                        })

                        u.ID(`hideRecipeBtn${i}${j}`).addEventListener("click",function(){
                            u.ID(`recipeDiv${i}${j}`).style="display: none"
                            u.ID(`hideRecipeBtn${i}${j}`).style = "display: none"                                
                            u.ID(`showRecipeBtn${i}${j}`).style = "display: inline"
                        })
                    //
                    // add recipe Div
                        let recipeDiv = document.createElement("div")
                        u.Html(recipeDiv,`recipeDiv${i}${j}`,"recipeDiv","display:none")
                        mealDiv.appendChild(recipeDiv);
                        mealDiv.appendChild(document.createElement("br"))
                    //
                    // adds ingredients table
                        let ingredientTableDiv = document.createElement("div");      
                        ingredientTableDiv.id = `ingredientTableDiv${i}${j}`         
                        let ingredientTable = document.createElement("table");       
                        ingredientTable.id = `ingredientTable${i}${j}`              
                        
                        u.ID(`recipeDiv${i}${j}`).appendChild(ingredientTableDiv);   // Add the div to 'menuDiv'
                        u.ID(`ingredientTableDiv${i}${j}`).appendChild(ingredientTable);   // Add the table to the div                

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
                                let display = u.DisplayIngredient(ingredient.quantitySmall,ingredient.quantityLarge,ingredient.food.unit)
                                for (let x=0; x<3; x++){
                                    html.push(display[x])
                                }
                            }
                            for (let x=0; x<4; x++){
                                ids.push(`${i}${j}${k}${x}`)
                            }
                            u.CreateRow(`ingredientTable${i}${j}`,"td",html,ids,[50,10,10,30],"%")
                            u.ID(`${i}${j}${k}1`).style.fontSize="11px" 
                        }                     
                        let method = document.createElement("p"); 
                        var methodHTML = recipe.method.replace(/(?:\r\n|\r|\n)/g, '<br><br>');                        
                        u.ID(`ingredientTableDiv${i}${j}`).appendChild(method);
                        method.innerHTML = methodHTML
                    }
                }
            }
        }      

// CREATE Printable Menu
    // event listener for the print menu button
        u.ID("printMenubtn").addEventListener('click', function (event) {
            u.ShowElements("PrintMenu","block")
            GeneratePrintMenu()
            u.HideElements("mainApp")
            let menuTitle = u.ID("selectViewMenu").value.replace("/","-")
            let rand = (Math.random()*1000).toFixed(0)
            ipc.send('print-to-pdf',`${menuTitle}_menu_${rand}.pdf`)
        })
    //
    //function GeneratePrintMenu
        function GeneratePrintMenu (){
            let menuDiv = u.ID("PrintMenu")
            menuDiv.innerHTML="" //clear the child div
            let menuTitle = u.ID("selectViewMenu").value
            let menu = Dict[3].getMenu(menuTitle)
            for (let i = 0; i < menu.meals.length; i++) {
                let meal = Dict[3].getMeal(menuTitle,i) 
                let day = d.weekday[new Date (meal.date).getDay()]
                let mealTitle = document.createElement("h3");
                u.Html(mealTitle,`printMealTitle${i}`,"printMealTitle","display:block","",`${day} ${meal.mealType}`)
                menuDiv.appendChild(mealTitle);

                let mealDiv = document.createElement("div")            
                menuDiv.appendChild(mealDiv)
                u.Html(mealDiv,`printMealDiv${i}`,"mealDiv")

                //
                // adds recipe
                    // adds recipe title 
                        for (let j=0; j<meal.recipes.length; j++) {
                            let recipe = Dict[3].getRecipe(menuTitle,i,j)                        
                            let recipeTitle = document.createElement("h4"); 
                            if(recipe.morv === "b"){
                                if(recipe.recipeType === "dessert core"){
                                    u.Html(recipeTitle,`printRecipeTitle${i}${j}`,"printDessertRecipeTitle","display: block","",`${recipe.recipeTitle} (${recipe.serves})`)             
                                }
                                else {
                                u.Html(recipeTitle,`printRecipeTitle${i}${j}`,"printRecipeTitle","display: block","",`${recipe.recipeTitle} (${recipe.serves})`)             
                                }
                            } 
                            else{
                                u.Html(recipeTitle,`printRecipeTitle${i}${j}`,"","display: block","",`${recipe.recipeTitle} (${recipe.serves}) - ${recipe.morv} `)                                             
                            }
                            //
                            // add recipe Div
                                let recipeDiv = document.createElement("div")
                                u.Html(recipeDiv,`printRecipeDiv${i}${j}`,"printRecipeDiv","display:block")
                                mealDiv.appendChild(recipeDiv);
                                recipeDiv.appendChild(recipeTitle);                     
                                mealDiv.appendChild(document.createElement("br"))
                            //
                            // adds ingredients table
                                let ingredientTableDiv = document.createElement("div");       // Create a <div> element
                                ingredientTableDiv.id = `printIngredientTableDiv${i}${j}`              // give the node an u.ID
                                let ingredientTable = document.createElement("table");          // Create a <table> element
                                u.Html(ingredientTable,`printIngredientTable${i}${j}`,"printIngredientTable","display:block")
                                
                                u.ID(`printRecipeDiv${i}${j}`).appendChild(ingredientTableDiv);   // Add the div to 'menuDiv'
                                u.ID(`printIngredientTableDiv${i}${j}`).appendChild(ingredientTable);   // Add the table to the div                

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
                                        let display = u.DisplayIngredient(ingredient.quantitySmall,ingredient.quantityLarge,ingredient.food.unit)
                                        for (let x=0; x<3; x++){
                                            html.push(display[x])
                                        }
                                    }
                                    for (let x=0; x<4; x++){
                                        ids.push(`print${i}${j}${k}${x}`)
                                    }
                                    u.CreateRow(`printIngredientTable${i}${j}`,"td",html,ids,[50,10,10,30],"%")
                                    u.ID(`print${i}${j}${k}1`).style.fontSize="11px"                        
                                }
                                let method = document.createElement("p"); 
                                var methodHTML = recipe.method.replace(/(?:\r\n|\r|\n)/g, '<br><br>');                        
                                u.ID(`printIngredientTableDiv${i}${j}`).appendChild(method);
                                u.Html(method,`printMethod${i}${j}`,"printMethod","display:block",methodHTML)
                        }
            }
        }   
    //
//
// CREATE Printable Shopping Lists
    // event listener for the print menu button
        u.ID("printShoppingbtn").addEventListener('click', function (event) {
            u.ShowElements("PrintShopping","block")
            GeneratePrintShopping()
            u.HideElements("mainApp")
            let menuTitle = u.ID("selectMenuForShopping").value.replace("/","-")
            let rand = (Math.random()*1000).toFixed(0)            
            ipc.send('print-to-pdf',`${menuTitle}_shopping_${rand}.pdf`)
        })
    //
    // function GeneratePrintShopping
        function GeneratePrintShopping(){
            let shoppingDiv = u.ID("PrintShopping")
            let menuTitle = u.ID("selectMenuForShopping").value
            for (let i=0; i<d.shopEnum.length; i++){
                let shop = d.shopEnum[i]
                let shoppingTable = u.ID(`shoppingtable${shop}`)                
                if(shoppingTable.innerHTML===""){console.log("table is empty"); continue} //check if table is empty

                let printShoppingListTitle = document.createElement("h2")
                shoppingDiv.appendChild(printShoppingListTitle)
                u.Html(printShoppingListTitle,`printShoppingTitle${i}`,"printShoppingList","","",`${menuTitle} - ${shop}`)

                // create array with list of foods from shopping table with row number as a property
                    let foodList = []                
                    for(let j=0; j<shoppingTable.rows.length; j++){
                        let foodName = u.ID(`${menuTitle}${shop}row${j}col0`).innerText
                        foodList[foodName]={foodName:foodName, rowNumber:j}                      
                    }
                    let foodListKeys = Object.keys(foodList)
                    foodListKeys.sort()
                    if(foodListKeys.length>10){
                        foodListKeys.sort(u.CompareFoodType)                    
                    }          
                // print shopping list
                    let printShoppingTable = document.createElement("table")
                    shoppingDiv.appendChild(printShoppingTable)
                    u.Html(printShoppingTable,`printshoppingtable${shop}`,"printShoppingTable")
                    let rowNumber = 0
                    for (let k=0; k<foodListKeys.length; k++){
                        let foodName = foodListKeys[k]                    
                        if(foodListKeys.length>10 && k>0 && Dict[1][foodName].foodType !== Dict[1][foodListKeys[k-1]].foodType)
                        {
                            let printShoppingTableRow = u.ID(`printshoppingtable${shop}`).insertRow(rowNumber);                                             
                            printShoppingTableRow.innerHTML="<td colspan=3 style='background-color:grey'></td>"
                            rowNumber++;                        
                        }
                        let HTML=[]
                        let tableRowNumber = foodList[foodName].rowNumber                    
                        for (let x=0; x<3; x++){
                            HTML[x]=u.ID(`${menuTitle}${shop}row${tableRowNumber}col${x}`).innerText;
                        }
                        u.CreateRow(`printshoppingtable${shop}`,"td",HTML,"",[200,50,50],"px")
                        rowNumber++;
                    }
                    if(i===1){
                        let essentialsNote = document.createElement("p")
                        shoppingDiv.appendChild(essentialsNote)
                        u.Html(essentialsNote,"","essentialsNote","","","Don't forget to buy essentials: olive oil, milton, tea/coffee, tupperware, cocoa, biscuits")
                    }
            }
        }
    
//
// when user clicks elsewhere, modals close
window.onclick = function(click) {
    var multiplyModal = u.ID("multiplyUp");
    var addRecipeModal = u.ID("addRecipeToMenu");
    var addMealModal = u.ID("addMealsToMenu")    
    if (click.target == addRecipeModal) {
        addRecipeModal.style = "display none";
        editMenu.RefreshEditMenu()
        shopping.RefreshLists()                    
    }
    else if (click.target == multiplyModal) {
        multiplyModal.style = "display: none"
        editMenu.RefreshEditMenu()   
        shopping.RefreshLists()                            
    }
    else if (click.target == addMealModal) {
        addMealModal.style = "display: none"
        editMenu.RefreshEditMenu()                    
        shopping.RefreshLists()                            
    } 
}
//

    // create listeners for each button
    var HtabList=document.getElementsByClassName("htablinks")
    for (let i=0; i<HtabList.length; i++){
        let btnID = HtabList[i].id
        let tabIDlength = btnID.length-6
        let tabID = btnID.slice(0,tabIDlength)
        u.ID(btnID).addEventListener("click",function() {
            u.OpenHTab(tabID)
        })    
    }

    // open v-tab - change tab contents when you use tab
    var VtabList=document.getElementsByClassName("vtablinks")
    for (let i=0; i<VtabList.length; i++){
        let btnID = VtabList[i].id
        let tabIDlength = btnID.length-6
        let tabID = btnID.slice(0,tabIDlength)
        u.ID(btnID).addEventListener("click",function() {
            u.OpenVTab(tabID)
        })    
    }
    d.Dict[3].deleteRecipe("Ligeti / Small Choir",0,3)
     // create event listener for 'save changes' button to support t2 > 'edit recipe' functionality
    u.ID("editRecipe_btn").addEventListener("click", function(){
        Dict[2].deleteRecipe(u.ID("recipeTitle"))
        addRecipe.btn()
        u.WriteDict(2)
        u.ID("AddRecipePageTitle").innerText = "Add Recipe"  // change text of title back from 'edit recipe' to 'add recipe'
        u.ShowElements("addRecipe_btn","inline")
        u.HideElements("editRecipe_btn")
        u.OpenHTab("Admin")                            
        u.OpenVTab("t2RecipeDict")
    })  

    
// function to return to normal once pdf has printed
const ipc = require('electron').ipcRenderer
ipc.on('wrote-pdf', function (event, path) {
    u.HideElements("PrintMenu")
    u.HideElements("PrintShopping")
    u.ShowElements("mainApp","block")
    console.log(`Wrote PDF to: ${path}`)
})
