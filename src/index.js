const PermissionSystem = require("./permissions/System.js");
const PermissionManagement = require("./permissions/Management.js");
const BHPermissions = require("./extensions/BH.js");
const GMPermissions = require("./extensions/GM.js");
const GMUI = require("./ui/GM.js");


(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@bhmb/bot')) :
    typeof define === 'function' && define.amd ? define(['@bhmb/bot'], factory) :
    (factory(global['@bhmb/bot']));
}(this, (function (bot) { 'use strict';
    const MessageBot = bot.MessageBot;

    MessageBot.registerExtension("DaPersonMGN/groupManagement", function(ex, world) {
      //Debugging purposes.
      //window.ex = ex;

      ex.remove = function() {
        world.onMessage.unsub(ex.Management.commandHandler);
        if (!ex.bot.getExports("ui")) {return} //Only UI stuff left to remove.
        ex.bot.getExports("ui").removeTabGroup("groupManagementTab");
      };

      ex.uninstall = function() {
        ex.remove();
      };

      ex.save = function() {
        var saveData = {
          groups: ex.System.groups,
          playerPermissions: ex.System.playerPermissions
        };
        ex.storage.set("data", saveData);
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

      if (!ex.bot.getExports("ui")) { return } //Only UI stuff left.

      ex.tab = new GMUI.createTab({
        System: ex.System,
        Management: ex.Management,
        ui: ex.bot.getExports("ui")
      });

      ex.exports["GM-ui"] = ex.tab;


    });

})));
