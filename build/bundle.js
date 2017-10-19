/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = "<p class=\"control\">\r\n  <label class=\"checkbox\">\r\n    <input type=\"checkbox\" data-permission=\"{ID}\">\r\n    {PERMISSION}\r\n  </label>\r\n</p>\r\n"

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const MessageBot = __webpack_require__(2);
const PermissionSystem = __webpack_require__(3);
const PermissionManagement = __webpack_require__(4);
const BHPermissions = __webpack_require__(6);
const GMPermissions = __webpack_require__(8);
const GMUI = __webpack_require__(10);


(function (global, factory) {
     true ? factory(__webpack_require__(13)) :
    typeof define === 'function' && define.amd ? define(['@bhmb/bot'], factory) :
    (factory(global['@bhmb/bot']));
}(this, (function (bot) { 'use strict';
    const MessageBot = bot.MessageBot;

    MessageBot.registerExtension("DaPersonMGN/groupManagement", function(ex, world) {
      //Debugging purposes.
      window.ex = ex;

      ex.remove = function() {
        world.onMessage.unsub(ex.Management.commandHandler);
        if (!ex.bot.getExports("ui") || ex.bot.isNode) {return} //Only UI stuff left to remove.
        ex.bot.getExports("ui").removeTabGroup("groupManagementTab");
      };

      ex.uninstall = function() {
        ex.remove();
        //TODO: REMOVE STORAGE.
      };

      ex.save = function() {
        var saveData = {
          groups: ex.System.groups,
          playerPermissions: ex.System.playerPermissions
        };
        ex.storage.set("data", JSON.stringify(saveData));
      };


      ex.load = function() {
        ex.doSaving = false;
        var data = ex.storage.get("data");
        if (!data) {
          ex.Management.createGroup("Administrator",[
            "BH.HELP","BH.PLAYERS","BH.KICK_MOD","BH.KICK_ADMIN","BH.KICK","BH.BAN_MOD","BH.BAN_ADMIN","BH.BAN","BH.BAN_NO_DEVICE_MOD","BH.BAN_NO_DEVICE_ADMIN","BH.BAN_NO_DEVICE","BH.UNBAN","BH.WHITELIST","BH.UNWHITELIST","BH.LIST_MODLIST","BH.LIST_BLACKLIST","BH.LIST_WHITELIST","BH.LIST_ADMINLIST","BH.LOADLISTS","BH.STOP","BH.PVPON","BH.PVPOFF","BH.MOD","BH.UNMOD","BH.ADMIN","BH.UNADMIN","BH.CLEARMODLIST","BH.CLEARADMINLIST","BH.CLEARWHITELIST","BH.CLEARBLACKLIST"
          ],[],[
            "BH.HELP","BH.PLAYERS","BH.KICK_MOD","BH.KICK_ADMIN","BH.KICK","BH.BAN_MOD","BH.BAN_ADMIN","BH.BAN","BH.BAN_NO_DEVICE_MOD","BH.BAN_NO_DEVICE_ADMIN","BH.BAN_NO_DEVICE","BH.UNBAN","BH.WHITELIST","BH.UNWHITELIST","BH.LIST_MODLIST","BH.LIST_BLACKLIST","BH.LIST_WHITELIST","BH.LIST_ADMINLIST","BH.LOADLISTS","BH.STOP","BH.PVPON","BH.PVPOFF","BH.MOD","BH.UNMOD","BH.ADMIN","BH.UNADMIN","BH.CLEARMODLIST","BH.CLEARADMINLIST","BH.CLEARWHITELIST","BH.CLEARBLACKLIST"
          ], true);
          ex.Management.createGroup("Moderator",[
            "BH.HELP","BH.PLAYERS","BH.KICK","BH.BAN","BH.BAN_NO_DEVICE","BH.UNBAN","BH.WHITELIST","BH.UNWHITELIST","BH.LIST_BLACKLIST","BH.LIST_WHITELIST"
          ],[],[
            "BH.HELP","BH.PLAYERS","BH.KICK","BH.BAN","BH.BAN_NO_DEVICE","BH.UNBAN","BH.WHITELIST","BH.UNWHITELIST","BH.LIST_BLACKLIST","BH.LIST_WHITELIST"
          ], true);
          ex.Management.createGroup("Anyone",[],[],[], true);
          ex.save();
          return;
        }
        data = JSON.parse(data);
        for (var groupID in data.groups) {
          ex.Management.createGroup(data.groups[groupID].name, data.groups[groupID].permissions, data.groups[groupID].players, data.groups[groupID].disabledPermissions, data.groups[groupID].unremoveable);
        }
        for (var playerName in data.playerPermissions) {
          for (var permission of data.playerPermissions[playerName]) {
            ex.System.setPlayerPermission(world.getPlayer(playerName), permission.toUpperCase());
          }
        }
        ex.doSaving = true;
      };

      ex.System = new PermissionSystem(ex);
      ex.Management = new PermissionManagement(ex, ex.System);
      ex.doSaving = true; //Whether or not to save.

      ex.load();

      world.onMessage.sub(ex.Management.commandHandler);

      ex.Management.registerPermissions(BHPermissions,{
        "Blockheads/Administrator Commands": "Blockheads/Administrator Commands",
        "Blockheads/Moderator Commands": "Blockheads/Moderator Commands",
        "Blockheads/List Commands": "Blockheads/List Commands",
        "Blockheads/World Commands": "Blockheads/World Commands"
      });

      ex.Management.registerPermissions(GMPermissions,{
        "Group Management/General Commands": "Group Management/General Commands",
        "Group Management/Group Commands": "Group Management/Group Commands",
        "Group Management/Permission Commands": "Group Management/Permission Commands",
      });

      ex.System.setPlayerPermission(world.getPlayer("DAPERSONPAD"),"BH.HELP");

      ex.exports["registerPermissions"] =  ex.Management.registerPermissions;
      ex.exports["System"] = ex.System;
      ex.exports["Management"] = ex.Management;

      if (!ex.bot.getExports("ui") || ex.bot.isNode) { return } //Only UI stuff left.

      ex.tab = new GMUI.createTab({
        System: ex.System,
        Management: ex.Management,
        ui: ex.bot.getExports("ui")
      });

      ex.exports["GM-ui"] = ex.tab;


    });

})));


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = window['@bhmb/bot'].MessageBot;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

var PermissionSystem = function(ex) {
  this.permissions = []; //Stores all the permissions.
  this.groups = {};
  this.playerPermissions = {};

  /**
    * Whether or not a permission exists.
    * @param {string} permission - Permission to look for.
    * @returns {boolean} - Whether or not the permission exists.
  */
  this.permissionExists = function(permission) {
    for (var perm of this.permissions) {
      if (perm.namespace.toLowerCase() === permission.toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  /**
    * Returns whether or not a user has the specified permission.
    * @param {Player} player - Player.
    * @param {string} permission - Permission to check for.
    * @returns {boolean} - Whether the user has permission or not.
  */
  this.playerHasPermission = function(player, permission){
    for (var groupID in this.groups) {
      var permissions = this.groups[groupID].permissions;
      var name = groupID;
      if (permissions.indexOf(permission.toLowerCase()) > -1) { return true; }
    }
    if (player.isOwner) {return true;}
    return !!this.hasPlayerPermission(player, permission);
  };

  /**
    * Sets a permission for the specified user.
    * @param {Player} player - Player.
    * @param {string} permission - Permission to set.
    * @param {boolean} value - Value for the permission.
  */
  this.setPlayerPermission = function(player, permission, value = true) {
    var GMPlayerPermissions = this.playerPermissions[player.name];
    if (!GMPlayerPermissions) {
      this.playerPermissions[player.name] = [];
      GMPlayerPermissions = this.playerPermissions[player.name];
    }
    if (value) {
      if (GMPlayerPermissions.indexOf(permission.toLowerCase()) > -1) {return}
      GMPlayerPermissions.push(permission.toLowerCase());
    } else if (GMPlayerPermissions.indexOf(permission.toLowerCase()) > -1) {
      GMPlayerPermissions.splice(GMPlayerPermissions.indexOf(permission.toLowerCase()),1);
    }
    if (ex.doSaving) {ex.save();}
  };

  //TODO: Documentation.
  this.hasPlayerPermission = function(player, permission) {
    if (!this.permissionExists(permission)) {throw new Error("Permission doesn't exist.");}
    if (!this.playerPermissions[player.name]) {return false}
    return this.playerPermissions[player.name].indexOf(permission.toLowerCase()) > -1;
  };

};

module.exports = PermissionSystem;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var Group = __webpack_require__(5);

var PermissionManagement = function(ex, PermissionSystem) {
  var _this = this;
  var ui;
  this.System = PermissionSystem;
  this.ex = ex;
  this.categories = {};

  this.commandHandler = function({player, message}) {
    if (!message.startsWith("/")) {return}
    if (message.indexOf(" ") === -1) {
      message += " ";
    }
    var command = message.substring(1,message.indexOf(" "));
    var args = message.substring(message.indexOf(" ")+1);
    _this.System.permissions.forEach(function(permission,namespace){
      if (permission.command.toLowerCase() === command.toLowerCase() && _this.System.playerHasPermission(player,permission.namespace)) {
        if (permission.ignoreStaff && player.isStaff) {return}
        if (permission.ignoreAdmin && player.isAdmin) {return}
        if (permission.ignoreMod && player.isMod) {return}
        if (permission.ignoreOwner && player.isOwner) {return}
        permission.callback(_this.ex, permission.namespace, player, args, "/"+command+" "+args);
      }
    });
  };

  this.registerPermissions = function(permissions, uiCategories={}) {

    for (var categoryID in uiCategories) {
      var categoryParent = uiCategories[categoryID].substring(0,uiCategories[categoryID].indexOf("/"));
      var category = uiCategories[categoryID].substring(uiCategories[categoryID].indexOf("/")+1);
      if (!this.categories[categoryParent.toLowerCase()]) {
        this.categories[categoryParent.toLowerCase()] = {
          name: categoryParent,
          subcategories: {}
        };
      }
      if (!this.categories[categoryParent.toLowerCase()].subcategories[category.toLowerCase()]) {
        this.categories[categoryParent.toLowerCase()].subcategories[category.toLowerCase()] = {
          name: category,
          permissions: []
        };
      }
    }

    for (var permission of permissions) {
      var categoryParent = permission.category.substring(0,permission.category.indexOf("/"));
      var category = permission.category.substring(permission.category.indexOf("/")+1);
      this.System.permissions.push(permission);
      this.categories[categoryParent.toLowerCase()].subcategories[category.toLowerCase()].permissions.push(permission);
      if (ui) { //TODO: Change this to exports?
        //ok so we set a UI variable. We're a browser thing and the UI already loaded.
        ui.addPermission(permission);
      }
    }
  };

  this.setUI = function(UI) {
    //I'll admit. This isn't the best. BUT I'M CRAVING SOLUTIONS OK??
    //TODO: Find a better way to do this.
    //IDEA: Perhaps have index.js call both registerPermissions and registerPermission in the UI? >.>
    ui = UI;
  };

  this.createGroup = function(name, permissions = [], players = [], disabledPermissions = [], unremoveable=false) {
    name = name.replace(/[^a-zA-Z]/g, "");
    if (this.System.groups[name.toLowerCase()]) {throw new Error("Group already exists.");}
    this.System.groups[name.toLowerCase()] = new Group(this.ex, name, permissions, players, disabledPermissions,unremoveable);
    ex.save();
  };

  this.destroyGroup = function(name) {
    name = name.replace(/[^a-zA-Z]/g, "");
    if (this.System.groups[name.toLowerCase()].unremoveable) {
      //then we should not remove the group.
      throw new Error("Group is unremoveable.");
    } else {
      delete this.System.groups[name.toLowerCase()];
      ex.save();
    }
  };

};

module.exports = PermissionManagement;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

var Group = function(ex, name, permissions, players, disabledPermissions ,unremoveable) {
  this.id = name.toLowerCase();
  this.name = name;
  this.permissions = permissions || [];
  this.players = players || [];
  this.disabledPermissions = disabledPermissions || [];
  this.unremoveable = unremoveable;


  //TODO: Documentation.
  this.setPermission = function(permission, value, disabled) {
    if (value) {
      if (this.permissions.indexOf(permission.toLowerCase()) > -1) {
        throw new Error("Permission is already set to true.");
      }
      this.permissions.push(permission.toLowerCase());
    } else {
      if (this.permissions.indexOf(permission.toLowerCase()) > -1) {
        this.permissions.splice(this.permissions.indexOf(permission.toLowerCase()), 1);
        if (disabled) {
          this.disabledPermissions.push(permission.toLowerCase());
        }
      } else {
        throw new Error("Permission is already set to false.");
      }
    }
    if (ex.doSaving) {ex.save();}
  };

  //TODO: Documentation.
  this.hasPermission = function(permission) {
    return this.permissions.indexOf(permission.toLowerCase()) > -1;
  };

  //TODO: Documentation.
  this.addPlayer = function(player) {
    if (this.players.indexOf(player.name) > -1) {
      throw new Error("User is already in group.");
    } else {
      this.players.push(player.name);
    }
    if (ex.doSaving) {ex.save();}
  };

  //TODO: Documentation.
  this.removePlayer = function(player) {
    if (this.players.indexOf(player.name) > -1) {
      this.players.splice(this.players.indexOf(player.name),1);
    } else {
      throw new Error("User isn't in that group.");
    }
    if (ex.doSaving) {ex.save();}
  };

};

module.exports = Group;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var permissionHandler = __webpack_require__(7)

module.exports = [
  {
    namespace: "BH.HELP",
    command: "HELP",
    ignoreStaff: true,
    displayName: "View the /help message",
    category: "Blockheads/Moderator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.PLAYERS",
    command: "PLAYERS",
    ignoreStaff: true,
    displayName: "View the /players message",
    category: "Blockheads/Moderator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.KICK",
    command: "KICK",
    ignoreStaff: true,
    displayName: "Kick any normal player",
    category: "Blockheads/Moderator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.KICK_MOD",
    command: "KICK",
    ignoreAdmin: true,
    displayName: "Kick any moderator",
    category: "Blockheads/Moderator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.KICK_ADMIN",
    command: "KICK",
    ignoreAdmin: true,
    displayName: "Kick any administrator",
    category: "Blockheads/Administrator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.BAN",
    command: "BAN",
    ignoreStaff: true,
    displayName: "Ban any normal player",
    category: "Blockheads/Moderator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.BAN_MOD",
    command: "BAN",
    ignoreAdmin: true,
    displayName: "Ban any moderator",
    category: "Blockheads/Administrator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.BAN_ADMIN",
    command: "BAN",
    ignoreAdmin: true,
    displayName: "Ban any administrator",
    category: "Blockheads/Administrator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.BAN_NO_DEVICE",
    command: "BAN-NO-DEVICE",
    ignoreStaff: true,
    displayName: "Ban any normal player using /ban-no-device",
    category: "Blockheads/Moderator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.BAN_NO_DEVICE_MOD",
    command: "BAN-NO-DEVICE",
    ignoreAdmin: true,
    displayName: "Ban any moderator using /ban-no-device",
    category: "Blockheads/Administrator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.BAN_NO_DEVICE_ADMIN",
    command: "BAN-NO-DEVICE",
    ignoreAdmin: true,
    displayName: "Ban any administrator using /ban-no-device",
    category: "Blockheads/Administrator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.UNBAN",
    command: "UNBAN",
    ignoreStaff: true,
    displayName: "Unban any player",
    category: "Blockheads/Moderator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.WHITELIST",
    command: "WHITELIST",
    ignoreStaff: true,
    displayName: "Whitelist any player",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.UNWHITELIST",
    command: "UNWHITELIST",
    ignoreStaff: true,
    displayName: "Unwhitelist any player",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.LIST_BLACKLIST",
    command: "LIST-BLACKLIST",
    ignoreStaff: true,
    displayName: "List the blacklist",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.LIST_WHITELIST",
    command: "LIST-WHITELIST",
    ignoreStaff: true,
    displayName: "List the whitelist",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.LIST_MODLIST",
    command: "LIST-MODLIST",
    ignoreAdmin: true,
    displayName: "List the modlist",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.LIST_ADMINLIST",
    command: "LIST-ADMINLIST",
    ignoreAdmin: true,
    displayName: "List the adminlist",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.STOP",
    command: "STOP",
    ignoreAdmin: true,
    displayName: "Stop the server",
    category: "Blockheads/World Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.PVPON",
    command: "PVP-ON",
    ignoreAdmin: true,
    displayName: "Turn PVP on",
    category: "Blockheads/World Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.PVPOFF",
    command: "PVP-OFF",
    ignoreAdmin: true,
    displayName: "Turn PVP off",
    category: "Blockheads/World Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.LOADLISTS",
    command: "LOAD-LISTS",
    ignoreAdmin: true,
    displayName: "Reload the lists",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.MOD",
    command: "MOD",
    ignoreAdmin: true,
    displayName: "Add others to the modlist",
    category: "Blockheads/Administrator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.UNMOD",
    command: "UNMOD",
    ignoreAdmin: true,
    displayName: "Remove others from the modlist",
    category: "Blockheads/Administrator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.ADMIN",
    command: "ADMIN",
    ignoreAdmin: true,
    displayName: "Add others to the adminlist",
    category: "Blockheads/Administrator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.UNADMIN",
    command: "UNADMIN",
    ignoreAdmin: true,
    displayName: "Remove others from the adminlist",
    category: "Blockheads/Administrator Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.CLEARBLACKLIST",
    command: "CLEAR-BLACKLIST",
    ignoreAdmin: true,
    displayName: "Clear the blacklist",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.CLEARWHITELIST",
    command: "CLEAR-WHITELIST",
    ignoreAdmin: true,
    displayName: "Clear the whitelist",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.CLEARMODLIST",
    command: "CLEAR-MODLIST",
    ignoreAdmin: true,
    displayName: "Clear the modlist",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.CLEARADMINLIST",
    command: "CLEAR-ADMINLIST",
    ignoreAdmin: true,
    displayName: "Clear the adminlist",
    category: "Blockheads/List Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.SETPASSWORD",
    command: "SET-PASSWORD",
    ignoreOwner: true,
    displayName: "Set the world's password",
    category: "Blockheads/World Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.SETPRIVACY",
    command: "SET-PRIVACY",
    ignoreOwner: true,
    displayName: "Set the privacy of the world",
    category: "Blockheads/World Commands",
    callback: permissionHandler
  },
  {
    namespace: "BH.REMOVEPASSWORD",
    command: "REMOVE-PASSWORD",
    ignoreOwner: true,
    displayName: "Remove the world's password",
    category: "Blockheads/World Commands",
    callback: permissionHandler
  }
];


/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = function(ex, namespace, player, args, raw) {
  console.log(ex,namespace,player,args,raw);
  var world = ex.world;
  switch (namespace) {
    case "BH.HELP":
      var helpMsgs = {
          "BH.HELP": "/HELP - display this message.",
          "BH.PLAYERS": "/PLAYERS - list currently active players.",
          "BH.KICK": "/KICK player_name - kicks player_name, but they will still be allowed to reconnect.",
          "BH.BAN": "/BAN player_name_or_ip - adds player_name_or_ip to the blacklist, ban's that user's device from reconnecting with a different name, and kicks anyone who is no longer authorized.",
          "BH.BAN_NO_DEVICE": "/BAN-NO-DEVICE player_name_or_ip - works the same as the ban command, but doesn't ban the player's device.",
          "BH.UNBAN": "/UNBAN player_name_or_ip - removes player_name_or_ip from the blacklist.",
          "BH.WHITELIST": "/WHITELIST player_name_or_ip - adds player_name_or_ip to the whitelist, and kicks anyone who is no longer authorized.",
          "BH.UNWHITELIST": "/UNWHITELIST player_name_or_ip - removes player_name_or_ip from the whitelist, and kicks anyone who is no longer authorized.",
          "BH.LIST_BLACKLIST": "/LIST-BLACKLIST - lists the 50 most recent players on the blacklist.",
          "BH.LIST_WHITELIST": "/LIST-WHITELIST - lists the 50 most recent players on the whitelist.",
          "BH.LIST_MODLIST": "/LIST-MODLIST - lists the 50 most recent players on the modlist.",
          "BH.LIST_ADMINLIST": "/LIST-ADMINLIST - lists the 50 most recent players on the adminlist.",
          "BH.PVPON": "/PVP-ON - enables PVP (Player vs. Player) so players can directly hurt each other.",
          "BH.PVPOFF": "/PVP-OFF - disables PVP (Player vs. Player) so players cannot directly hurt each other",
          "BH.LOADLISTS": "/LOAD-LISTS - reloads the blacklist.txt, modlist.txt and adminlist.txt files, and kicks anyone who is no longer authorized.",
          "BH.MOD": "/MOD player_name - adds player_name to the modlist, allowing them to issue some server commands via chat.",
          "BH.UNMOD": "/UNMOD player_name - removes player_name from the modlist.",
          "BH.ADMIN": "/ADMIN player_name - adds player_name to the adminlist, allowing them to issue server commands via chat.",
          "BH.UNADMIN": "/UNADMIN player_name - removes player_name from the adminlist.",
          "BH.CLEARBLACKLIST": "/CLEAR-BLACKLIST - removes all names from the blacklist.",
          "BH.CLEARWHITELIST": "/CLEAR-WHITELIST - removes all names from the whitelist.",
          "BH.CLEARMODLIST": "/CLEAR-MODLIST - removes all names from the modlist.",
          "BH.CLEARADMINLIST": "/CLEAR-ADMINLIST - removes all names from the adminlist.",
          "BH.SETPASSWORD": "/SET-PASSWORD password - sets a new password, which all players except the owner must use in order to connect.",
          "BH.REMOVEPASSWORD": "/REMOVE-PASSWORD - removes the password, so all players may connect.",
          "BH.SETPRIVACY": "/SET-PRIVACY public/searchable/private - changes the privacy setting."
      };
      var helpStr = "\n";
      for (var cmd in helpMsgs) {
        if (ex.System.playerHasPermission(player,cmd)) {
          helpStr += helpMsgs[cmd] + "\n";
        }
      }

      ex.bot.send(helpStr);
    break;
    case "BH.PLAYERS":
      if (world.overview.online.length === 0) {
        ex.bot.send("No players currently connected.");
        return;
      }
      ex.bot.send("There are "+world.overview.online.length+" players connected: \n"+world.overview.online.join("\n"));
    break;
    case "BH.KICK":
      if (player.isStaff || player.isOwner) {
        return;
      }
      ex.bot.send(raw);
    break;
    case "BH.KICK_MOD":
      if (player.isAdmin || !player.isMod || player.isOwner) {
        return;
      }
      ex.bot.send(raw);
    break;
    case "BH.KICK_ADMIN":
      if (!player.isAdmin || player.isOwner) {
        return;
      }
      ex.bot.send(raw);
    break;
    case "BH.BAN":
      if (player.isStaff || player.isOwner) {
        return;
      }
      ex.bot.send(raw);
      ex.bot.send(args.toLowerCase()+" has been added to the blacklist");
    break;
    case "BH.BAN_MOD":
      if (player.isAdmin || !player.isMod || player.isOwner) {
        return;
      }
      ex.bot.send(raw);
      ex.bot.send(args.toLowerCase()+" has been added to the blacklist");
    break;
    case "BH.BAN_ADMIN":
      if (!player.isAdmin || player.isOwner) {
        return;
      }
      ex.bot.send(raw);
      ex.bot.send(args.toLowerCase()+" has been added to the blacklist");
    break;
    case "BH.BAN_NO_DEVICE":
      if (player.isStaff || player.isOwner) {
        return;
      }
      ex.bot.send(raw);
      ex.bot.send(args.toLowerCase()+" has been added to the blacklist");
    break;
    case "BH.BAN_NO_DEVICE_MOD":
      if (player.isAdmin || !player.isMod) {
        return;
      }
      ex.bot.send(raw);
      ex.bot.send(args.toLowerCase()+" has been added to the blacklist");
    break;
    case "BH.BAN_NO_DEVICE_ADMIN":
      if (!player.isAdmin || player.isOwner) {
        return;
      }
      ex.bot.send(raw);
      ex.bot.send(args.toLowerCase()+" has been added to the blacklist");
    break;
    case "BH.LIST_MODLIST":
    case "BH.LIST_ADMINLIST":
    case "BH.LIST_BLACKLIST":
    case "BH.LIST_WHITELIST":
      var listType = permission.substring(permission.indexOf("_")+1,permission.length-4);
      ex.bot.send(listType.substring(0,1).toUpperCase()+listType.slice(1).toLowerCase()+"list:\n"+world.lists[listType.toLowerCase()+"list"].join(", "));
    break;
    case "BH.UNBAN":
      if (world.lists.blacklist.indexOf(args.toUpperCase()) === -1) {
        ex.bot.send(args+" was not on the blacklist");
      } else {
        //user is on the blacklist.
        ex.bot.send(raw);
        ex.bot.send(args+" has been removed from the blacklist");
      }
    break;
    case "BH.WHITELIST":
    case "BH.UNWHITELIST":
      var undoing = permission.indexOf("UN") > -1;
      var player = player;
      if (undoing) {
        //we're unwhitelisting a user.
        if (player.isWhitelisted) {
          ex.bot.send(raw);
          ex.bot.send(args+" has been removed from the whitelist");
        } else {
          ex.bot.send(args+" was not on the whitelist.");
        }
      } else {
        //we're whitelisting a user.
        if (player.isWhitelisted) {
          ex.bot.send(args+" was already on the whitelist");
        } else {
          ex.bot.send(raw);
          ex.bot.send(args+" has been added to the whitelist.");
        }
      }
    break;
    case "BH.STOP":
      ex.bot.send(raw);
    break;
    case "BH.PVPON":
    case "BH.PVPOFF":
      var undoing = permission.indexOf("OFF") > -1;
      if (undoing) {
        //we're removing pvp.
        if (world.overview.pvp) {
          ex.bot.send(raw);
          ex.bot.send("PVP is now disabled.");
        } else {
          ex.bot.send("PVP was already disabled.");
        }
      } else {
        //we're turning pvp on.
        if (world.overview.pvp) {
          ex.bot.send("PVP was already enabled.");
        } else {
          ex.bot.send(raw);
          ex.bot.send("PVP is now enabled.");
        }
      }
    break;
    case "BH.LOADLISTS":
      ex.bot.send(raw);
      ex.bot.send("Reloaded lists.");
    break;
    case "BH.MOD":
    case "BH.UNMOD":
    case "BH.ADMIN":
    case "BH.UNADMIN":
      var undoing = permission.indexOf("UN") > -1;
      var rank;
      if (undoing) {
        rank = permission.substring(permission.indexOf("UN")+2);
      } else {
        rank = permission.substring(3);
      }
      var player = player;
      if (player["is"+rank.toUpperCase().slice(0,1)+rank.toLowerCase().slice(1)]()) {
        if (undoing) {
          ex.bot.send(raw);
          ex.bot.send(args+" has been removed from the "+rank.toLowerCase()+"list");
        } else {
          ex.bot.send(args+" was already on the "+rank.toLowerCase()+"list");
        }
      } else {
        //user isn't in the list.
        if (undoing) {
          ex.bot.send(args+" was not on the "+rank.toLowerCase()+"list");
        } else {
          ex.bot.send(raw);
          ex.bot.send(args+" has been added to the "+rank.toLowerCase()+"list");
        }
      }
    break;
    case "BH.CLEARWHITELIST":
    case "BH.CLEARADMINLIST":
    case "BH.CLEARMODLIST":
    case "BH.CLEARBLACKLIST":
      var listType = permission.substring(8);
      ex.bot.send(raw);
      ex.bot.send(listType.slice(0,1).toUpperCase()+listType.slice(1).toLowerCase()+" cleared.");
    break;
    case "BH.SETPRIVACY":
      var privacy = args.toLowerCase();
      if (["public","searchable","private"].indexOf(privacy) > -1) {
        ex.bot.send(raw);
        ex.bot.send("Privacy setting has been changed to "+privacy+".");
      }
    break;
    case "BH.SETPASSWORD":
      if (args.length > 0) {
        ex.bot.send(raw);
        ex.bot.send("Password set.");
      }
    break;
    case "BH.REMOVEPASSWORD":
      if (world.overview.password) {
        ex.bot.send(raw);
      } else {
        ex.bot.send("There was already no password set.");
      }
    break;
    default:
      throw new Error("Namespace not found. How the heck was this called.");
    break;
  }
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var permissionHandler = __webpack_require__(9);
module.exports = [
  {
    namespace: "GM.HELP",
    command: "GM-HELP",
    displayName: "View the /GM-help message",
    category: "Group Management/General Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.CHECK",
    command: "GM-CHECK",
    displayName: "Check if a player has a permission",
    category: "Group Management/General Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.USER",
    command: "GM-USER",
    displayName: "View all the permissions/groups of a player",
    category: "Group Management/General Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.GROUP",
    command: "GM-GROUP",
    displayName: "View all the permissions of a group",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.ADD",
    command: "GM-ADD",
    displayName: "Add others to a group",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.REMOVE",
    command: "GM-REMOVE",
    displayName: "Removes others from a group",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.GSET",
    command: "GM-GSET",
    displayName: "Set permissions for groups",
    category: "Group Management/Permission Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.USET",
    command: "GM-USET",
    displayName: "Set permissions for users",
    category: "Group Management/Permission Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.CREATE",
    command: "GM-CREATE",
    displayName: "Create groups",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.DESTORY",
    command: "GM-DESTROY",
    displayName: "Destroy groups",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.LIST",
    command: "GM-LIST",
    displayName: "View a grouplist",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
];


/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = function(ex, namespace, player, args, raw) {
  //console.log(namespace, raw);
  var Management = ex.bot.getExports("dapersonmgn/groupManagement").Management;
  var ui = ex.bot.getExports("dapersonmgn/groupManagement")["GM-ui"];
  switch (namespace) {
    case "GM.HELP":
      var helpMsgs = {
        "GM.HELP": "/GM-HELP - displays this message",
        "GM.CHECK": "/GM-CHECK permission_id player_name - checks whether or not the player has a permission",
        "GM.USER": "/GM-USER player_name - displays all the permissions a user has, along with what groups the user is in",
        "GM.GROUP": "/GM-GROUP group_name - displays all the permissions a group has",
        "GM.ADD": "/GM-ADD group_name player_name - adds a user to a group",
        "GM.REMOVE": "/GM-REMOVE group_name player_name - removes a user from a group",
        "GM.GSET": "/GM-GSET permission_id value group_name - sets a group's permission to a value",
        "GM.USET": "/GM-USET permission_id value player_name - sets a user's permission to a value",
        "GM.CREATE": "/GM-CREATE group_name - creates a group",
        "GM.DESTORY": "/GM-DESTROY group_name - destroys a group",
        "GM.LIST": "/GM-LIST group_name - view the last 50 players added to a group"
      };
      var helpStr = "\n";
      for (var cmd in helpMsgs) {
        if (ex.System.playerHasPermission(player,cmd)) {
          helpStr += helpMsgs[cmd] + "\n";
        }
      }
      ex.bot.send(helpStr);
    break;
    case "GM.CHECK":
      if (args.split(" ").length < 2) {
        ex.bot.send("You didn't specify enough arguments.");
        return
      }
      var permissionID = args.split(" ")[0];
      var player = ex.world.getPlayer(args.split(" ").slice(1).join(" "));
      if (Management.System.permissionExists(permissionID)) {
        if (Management.System.playerHasPermission(player, permissionID)) {
          ex.bot.send("The player specified has the permission "+permissionID.toUpperCase());
        } else {
          ex.bot.send("The player specified does not have the permission "+permissionID.toUpperCase());
        }
      } else {
        ex.bot.send("That permission ID doesn't exist.");
      }

    break;
    case "GM.USER":
      if (args.length === 0) {
        args = player.name;
      }
      var player = ex.world.getPlayer(args);
      var playerPermissions = [];
      var playerGroups = [];
      for (var permission of Management.System.permissions) {
        if (Management.System.playerHasPermission(player, permission.namespace)) {
          playerPermissions.push(permission.namespace);
        }
      }
      for (var groupID in Management.System.groups) {
        if (Management.System.groups[groupID].players.indexOf(player.name) > -1) {
          playerGroups.push(Management.System.groups[groupID].name);
        }
      }
      ex.bot.send("\n"+player.name+"\n"+"Permissions: "+playerPermissions.join(", ")+"\nGroups: "+playerGroups.join(", "));
    break;
    case "GM.GROUP":
      if (args.split(" ").length < 1) {
        ex.bot.send("You didn't specify enough arguments.");
        return
      }
      var group = Management.System.groups[args.toLowerCase()];
      if (!group) {
        ex.bot.send("Group not found.");
        return;
      }
      ex.bot.send("\n"+group.name+"\n"+"Permissions: "+group.permissions.join(", ")+"\nPlayer Count: "+group.players.length);
    break;
    case "GM.ADD":
      if (args.split(" ").length < 2) {
        ex.bot.send("You didn't specify enough arguments.");
        return
      }
      var group = Management.System.groups[args.split(" ")[0].toLowerCase()];
      if (!group) {
        ex.bot.send("Group not found.");
        return;
      }
      var player = ex.world.getPlayer(args.split(" ").slice(1).join(" "));
      if (group.players.indexOf(player.name) > -1) {
        ex.bot.send("Player is already in the group.");
      } else {
        group.addPlayer(player);
        ex.bot.send("Added player to the group.");
      }
    break;
    case "GM.REMOVE":
      if (args.split(" ").length < 2) {
        ex.bot.send("You didn't specify enough arguments.");
        return
      }
      var group = Management.System.groups[args.split(" ")[0].toLowerCase()];
      if (!group) {
        ex.bot.send("Group not found.");
        return;
      }
      var player = ex.world.getPlayer(args.split(" ").slice(1).join(" "));
      if (group.players.indexOf(player.name) === -1) {
        ex.bot.send("Player isn't in the group.");
      } else {
        group.removePlayer(player);
        ex.bot.send("Removed player from the group.");
      }
    break;
    case "GM.GSET":
      if (args.split(" ").length < 3) {
        ex.bot.send("You didn't specify enough arguments.");
        return
      }
      var permissionID = args.split(" ")[0];
      var permissionValue = args.split(" ")[1].toUpperCase();
      var group = Management.System.groups[args.split(" ")[2]];
      if (!group) {
        ex.bot.send("Group doesn't exist.");
        return
      }
      if (group.disabledPermissions.indexOf(permissionID.toLowerCase()) !== -1) {
        ex.bot.send("This permission cannot be set to anything else. This permission is disabled.");
        return
      }
      if (!Management.System.permissionExists(permissionID)) {
        ex.bot.send("Permission doesn't exist.");
      } else {
        if (permissionValue === "TRUE") {
          if (group.hasPermission(permissionID)) {
            ex.bot.send("This permission is already set to true.");
          } else {
            group.setPermission(permissionID,true);
            if (ui) {
              var permissionInputs = ui.groupTabs[group.id].querySelectorAll("input[data-permission='"+permissionID.toUpperCase()+"']");
              for (var permissionInput of permissionInputs) {
                permissionInput.checked = true;
              }
            }
            ex.bot.send("This permission has been set to true.");
          }
        } else if (permissionValue === "FALSE") {
          if (group.hasPermission(permissionID)) {
            group.setPermission(permissionID, false);
            if (ui) {
              var permissionInputs = ui.groupTabs[group.id].querySelectorAll("input[data-permission='"+permissionID.toUpperCase()+"']");
              for (var permissionInput of permissionInputs) {
                permissionInput.checked = false;
              }
            }
            ex.bot.send("This permission has been set to false.");
          } else {
            ex.bot.send("This permission is already set to false.");
          }
        } else {
          ex.bot.send("Incorrect value. Please use true or false.")
        }
      }
    break;
    case "GM.USET":
      if (args.split(" ").length < 3) {
        ex.bot.send("You didn't specify enough arguments.");
        return
      }
      var permissionID = args.split(" ")[0];
      var permissionValue = args.split(" ")[1].toUpperCase();
      var player = ex.world.getPlayer(args.split(" ").slice(2).join(" ").toLowerCase());
      if (!Management.System.permissionExists(permissionID)) {
        ex.bot.send("Permission doesn't exist.");
      } else {
        if (permissionValue === "TRUE") {
          if (Management.System.hasPlayerPermission(player, permissionID)) {
            ex.bot.send("This permission is already set to true.");
          } else {
            Management.System.setPlayerPermission(player, permissionID, true);
            ex.bot.send("Permission has been set to true.");
          }
        } else if (permissionValue === "FALSE") {
          if (Management.System.hasPlayerPermission(player, permissionID)) {
            Management.System.setPlayerPermission(player, permissionID, false);
            ex.bot.send("This permission has been set to false.");
          } else {
            ex.bot.send("This permission is already set to false.");
          }
        } else {
          ex.bot.send("Incorrect value. Please use true or false.")
        }
      }
    break;
    case "GM.CREATE":
    if (args.split(" ").length < 1) {
      ex.bot.send("You didn't specify enough arguments.");
      return
    }
    var groupName = args.toLowerCase().replace(/[^a-zA-Z]/g, "");
    if (Management.System.groups[groupName]) {
      ex.bot.send("Group already exists.");
      return
    }
    //we never created it? whaaat.
    Management.createGroup(groupName);
    if (ui) {
      ui.addGroupTab(Management.System.groups[groupName.toLowerCase()]);
    }
    ex.bot.send("Added group.");
    break;
    case "GM.DESTORY":
      if (args.split(" ").length < 1) {
        ex.bot.send("You didn't specify enough arguments.");
        return
      }
      var group = Management.System.groups[args.toLowerCase()];
      if (!group) {
        ex.bot.send("This group doesn't exist.");
        return;
      }
      if (group.unremoveable) {
        ex.bot.send("This group cannot be removed.");
        return;
      }
      try {
        Management.destroyGroup(group.name);
      } catch (err) {
        ex.bot.send("This group cannot be removed.");
      }
      if (ui) {
        ui.removeGroupTab(group);
      }
      ex.bot.send("Removed group.");
    break;
    case "GM.LIST":
      if (args.split(" ").length < 1) {
        ex.bot.send("You didn't specify enough arguments.");
        return
      }
      var group = Management.System.groups[args.toLowerCase()];
      if (!group) {
        ex.bot.send("This group doesn't exist.");
        return;
      }
      var players = group.players.slice(-50);
      ex.bot.send(group.name+":\n"+players.join(", "));
    break;
  }
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var ui = {};

ui.createTab = function(GM) {
  var _this = this;
  this.ui = GM.ui;
  this.System = GM.System;
  this.Management = GM.Management;

  var parentTab = this.ui.addTabGroup("Group Management", "groupManagementTab");

  this.groupTabs = {};

  this.addPermission = function(permission) {
    var categoryParent = permission.category.substring(0, permission.category.indexOf("/"));
    var category = permission.category.substring(permission.category.indexOf("/")+1);
    for (var tabID in this.groupTabs) {
      var tab = this.groupTabs[tabID];
      //check if category already exists.
      if (!tab.querySelector("p[data-category='"+categoryParent.toLowerCase()+"']")) { //Jk. This doesn't break.
        tab.querySelector(".menu").innerHTML += "<p class='menu-label' data-category='"+categoryParent.toLowerCase()+"'>"+this.Management.categories[categoryParent.toLowerCase()].name+"</p><ul class='menu-list' data-category='"+categoryParent.toLowerCase()+"'></ul>";
      }
      //now we should add the subcategory.

      if (!tab.querySelector("ul[data-category='"+categoryParent.toLowerCase()+"']").querySelector("a[data-id='"+category.toLowerCase()+"']")) {
        tab.querySelector("ul[data-category='"+categoryParent.toLowerCase()+"']").innerHTML += "<li><a href='#' data-id='"+category.toLowerCase()+"'>"+this.Management.categories[categoryParent.toLowerCase()].subcategories[category.toLowerCase()].name+"</a></li>"
        tab.querySelector(".groupManagementPermissionEditing").innerHTML += "<div data-tab='"+category.toLowerCase()+"' class='groupManagementHidden'><div class='columns'><div class='column'></div><div class='column'></div></div></div>";
      }
      //now add the permission.

      var permissionTab = tab.querySelector("div[data-tab='"+category.toLowerCase()+"']");
      var column1 = permissionTab.querySelector(".column").querySelectorAll("p").length;
      var column2 = permissionTab.querySelectorAll(".column")[1].querySelectorAll("p").length;

      if (column1 === column2) {
        permissionTab.querySelector(".column").innerHTML += __webpack_require__(0).replace("{PERMISSION}",permission.displayName).replace("{ID}",permission.namespace.toUpperCase());
      } else if (column1 > column2) {
        permissionTab.querySelectorAll(".column")[1].innerHTML += __webpack_require__(0).replace("{PERMISSION}",permission.displayName).replace("{ID}",permission.namespace.toUpperCase());
      } else {
        permissionTab.querySelector(".column").innerHTML += __webpack_require__(0).replace("{PERMISSION}",permission.displayName).replace("{ID}",permission.namespace.toUpperCase());
      }

    }
  };

  this.addGroupTab = function(groupObj) {
    if (this.groupTabs[groupObj.id]) {
      throw new Error("Tab Group already exists.");
    }
    this.groupTabs[groupObj.id] = this.ui.addTab(groupObj.name, "groupManagementTab");
    var gTab = this.groupTabs[groupObj.id];
    gTab.innerHTML = "<style>"+__webpack_require__(11)+"</style>" + __webpack_require__(12);

    gTab.querySelector(".title").textContent = groupObj.name;
    for (var categoryParent in this.Management.categories) {
      var categoryHTML = "";
      categoryHTML += "<p class='menu-label' data-category='"+categoryParent+"'>"+this.Management.categories[categoryParent].name+"</p><ul class='menu-list' data-category='"+categoryParent+"'>";
      for (var subcategoryID in this.Management.categories[categoryParent].subcategories) {
        categoryHTML += "<li><a href='#' data-id='"+subcategoryID+"'>"+this.Management.categories[categoryParent].subcategories[subcategoryID].name+"</a></li>";
        //we also need to add a new div to the tab because containers for permissions and stuff. >.>
        gTab.querySelector(".groupManagementPermissionEditing").innerHTML += "<div data-tab='"+subcategoryID+"' class='groupManagementHidden'><div class='columns'><div class='column'></div><div class='column'></div></div></div>";
        var colNum = 0;

        for (var permission of this.Management.categories[categoryParent].subcategories[subcategoryID].permissions) {
          if (colNum > 1) {
            colNum = 0;
          }
          gTab.querySelector("div[data-tab='"+subcategoryID+"']").querySelectorAll(".column")[colNum].innerHTML += __webpack_require__(0).replace("{PERMISSION}",permission.displayName).replace("{ID}",permission.namespace);
          if (groupObj.permissions.indexOf(permission.namespace.toLowerCase()) > -1) {
            gTab.querySelector("input[data-permission='"+permission.namespace+"']").setAttribute("checked","");
          }

          if (groupObj.disabledPermissions.indexOf(permission.namespace.toLowerCase()) > -1) {
            gTab.querySelector("input[data-permission='"+permission.namespace+"']").setAttribute("disabled","");
          }
          colNum++;
        }
      }
      categoryHTML += "</ul>";
      gTab.querySelector(".menu").innerHTML += categoryHTML;
    }

    gTab.addEventListener("click",function(e){
      var el = e.target;
      if (el.tagName === "A") {
        if (el.getAttribute("data-id")) {
          //sidemenu. >.>
          gTab.querySelector("div[data-tab='"+ gTab.querySelector(".is-active").getAttribute("data-id") +"']").setAttribute("class","groupManagementHidden");
          gTab.querySelector(".is-active").removeAttribute("class");
          el.setAttribute("class","is-active");
          gTab.querySelector("div[data-tab='"+el.getAttribute("data-id")+"']").removeAttribute("class");
        } else if (el.getAttribute("data-action")){
          if (el.getAttribute("data-action") === "delete") {
            if (groupObj.unremoveable) {
              _this.ui.alert("Group cannot be removed.");
              return;
            }
            _this.ui.alert("Are you sure you want to delete this group?",[
              {
                text: "Delete",
                style: "danger",
              },
              {
                text: "Cancel"
              }
            ], function(action){
              if (action === "Cancel") {return}
              _this.Management.destroyGroup(groupObj.id);
              _this.removeGroupTab(groupObj);
            });
          } else if (el.getAttribute("data-action") === "rename") {
            //rename
            if (groupObj.unremoveable) {
              _this.ui.alert("Group cannot be renamed.");
              return;
            }
            _this.ui.prompt("What's the new group name?", function(groupName){
              //TODO: What the heck. What is cancel???
              try {
                _this.Management.createGroup(groupName, groupObj.permissions, groupObj.players, groupObj.disabledPermissions);
                _this.Management.destroyGroup(groupObj.name);
                gTab.querySelector(".title").textContent = groupName;
                _this.ui.notify("Group renamed!",5);
              } catch (err) {
                //group already exists.
                _this.ui.notify("Group already exists.",5);
              }
            });
          } else {
            //new group.
            _this.ui.prompt("What's the new group name?", function(groupName){
              groupName = groupName.replace(/[^a-zA-Z]/g, "");
              try {
                _this.Management.createGroup(groupName);
                _this.addGroupTab(_this.System.groups[groupName]);
                _this.ui.notify("Group created!",5);
              } catch (err) {
                //group already exists.
                _this.ui.notify("Group already exists.",5);
              }
            });
          }
        }
      }
    });

    gTab.addEventListener("change", function(e){
      var el = e.target;
      if (el.tagName === "INPUT") {
        if (el.getAttribute("data-permission")) {
          //permission change.
          groupObj.setPermission(el.getAttribute("data-permission"), el.checked);
        }
      }
    });

    if (!gTab.querySelector("li > a")) {return}
    gTab.querySelector("li > a").setAttribute("class","is-active");
    gTab.querySelector("div[data-tab='"+ gTab.querySelector("li > a").getAttribute("data-id") +"']").removeAttribute("class");


  };

  this.removeGroupTab = function(groupObj) {
    this.ui.removeTab(this.groupTabs[groupObj.id]);
    delete this.groupTabs[groupObj.id];
  };

  for (var groupID in this.System.groups) {
    this.addGroupTab(this.System.groups[groupID]);
  }

  this.Management.setUI(this);

};

module.exports = ui;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = ".groupManagementPermissions {\r\n  min-width:35%;\r\n  max-width:35%;\r\n  min-height:95%;\r\n  float: left;\r\n  margin-top:10px;\r\n}\r\n\r\n.groupManagementPermissionEditing {\r\n  min-width: 63%;\r\n  max-width: 63%;\r\n  min-height:95%;\r\n  float: right;\r\n  margin-top:10px;\r\n}\r\n\r\n.groupManagementPermissions .is-active {\r\n  background: #182b73;\r\n}\r\n\r\n.groupManagementPermissionEditing .control {\r\n  padding: 5%;\r\n}\r\n\r\n.groupManagementHidden {\r\n  display: none;\r\n}\r\n"

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = "<div class=\"container\" style=\"height:100%;\">\r\n  <div class=\"box groupManagementPermissions\">\r\n    <aside class=\"menu\">\r\n    </aside>\r\n  </div>\r\n  <div class=\"box groupManagementPermissionEditing\">\r\n    <label><span class=\"title\"></span></label>\r\n\r\n    <label>\r\n      <span class=\"subtitle\" style=\"padding-left:5px;\">\r\n        <a href=\"#\" data-action=\"rename\">Rename</a>\r\n         -\r\n         <a href=\"#\" data-action=\"delete\">Delete</a>\r\n       </span>\r\n\r\n       <span class=\"subtitle is-pulled-right\">\r\n         <a href=\"#\" data-action=\"create\">\r\n           New Group\r\n         </a>\r\n       </span>\r\n     </label>\r\n\r\n    <hr />\r\n\r\n  </div>\r\n</div>\r\n"

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = window['@bhmb/bot'];

/***/ })
/******/ ]);