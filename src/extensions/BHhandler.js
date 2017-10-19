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
