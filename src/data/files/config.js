var remote = require('electron').remote;
var fs = require('fs');

const Config = {
   enums: {}
};

Config.addEnumItem = function(itemName, enumName) {
   let enumEnum = Object.keys(this.enums);
   if (typeof itemName != "string") {
      console.log(`invalid input: ${itemName} not a string`);
   } else if (enumEnum.indexOf(enumName) < 0) {
      console.log(`invalid input: ${enumName} not in the list of enums`);
   } else {
      this.enums[enumName].push(itemName);
   }
};

Config.deleteEnumItem = function(itemName, enumName) {
   delete this.enums[enumName][itemName];

};

var update_event = new CustomEvent('update', {
   detail: {
      global: true,
      type: 'config'
   }
});

Config.write = function(backupFlag) {
   var coreOrBackup = backupFlag === 'backup' ? 'backup' : 'core';
   var fileName = remote.getGlobal('sharedObject').fileNames[coreOrBackup].config;
   fs.writeFileSync(`./resources/${fileName}`, JSON.stringify(Config), {
      encoding: "utf8"
   });
   window.dispatchEvent(update_event);
}

Config.read = function(backupFlag) {
   var coreOrBackup = backupFlag === 'backup' ? 'backup' : 'core';
   var fileName = remote.getGlobal('sharedObject').fileNames[coreOrBackup].config;
   let input = JSON.parse(fs.readFileSync("./resources/" + fileName, {
      encoding: "utf8"
   }));
   //read in config
   for (var thing in input) {
      if (input.hasOwnProperty(thing)) {
         Config[thing] = input[thing];
      }
   }
   window.dispatchEvent(update_event);
}

Config.clear = function() {
   for (var prop in config) {
      let ea = config[prop];
      if (typeof ea != 'function') {
         delete config[prop];
      }
   }
}

module.exports = Config;