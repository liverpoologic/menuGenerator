var d = require("./Dicts.js")
var u = require("./UtilityFunctions.js")
var Dict = d.Dict
var e = d.Dict[4]

module.exports = {
    onLoad: onLoad
}


function onLoad() {
    //event listener to load people list page when menu is selected
    u.ID("selectPeopleMenu").addEventListener("change", CreatePeopleList) 
}

function CreatePeopleList(event){
    console.log(event.target.value)
}