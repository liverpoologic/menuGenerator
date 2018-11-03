 var params = require('./params.js');
 console.log(params)
 var els = {};
 params.tabList.forEach(htab => {
    els[htab.id] = {};
    htab.vtabs.forEach(vtab => {
       els[htab.id][vtab.id] = {};
    });
 });

 module.exports = els;