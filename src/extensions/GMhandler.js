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
