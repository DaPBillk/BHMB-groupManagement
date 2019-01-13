import { Player, MessageBot } from "@bhmb/bot";
import { GroupManagement } from "../GroupManagement";

const EXTENSION_ID = "dapersonmgn/groupManagement";

const helpMessages : {
  [key: string] : string
} = {
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

export const callback = async (player : Player, args : string, bot : MessageBot, id : string) => {
  const manager = (bot.getExports(EXTENSION_ID) as {manager: GroupManagement}).manager;
  const user = manager.users.get(player);
  const targetPlayer = bot.world.getPlayer(args);
  const overview = await bot.world.getOverview();
  let lists;

  switch (id) {
    case "BH.HELP":
      let helpMessage = "\n";
      for (const permissionID in helpMessages) {
        if (user.permissions.has(permissionID) || user.groups.some(group => group.permissions.has(permissionID))) {
          helpMessage += helpMessages[permissionID]+"\n";
        }
      }
      bot.world.send(helpMessage);
    break;

    case "BH.PLAYERS":
      bot.world.send(overview.online.length === 0 ? "No players currently connected." : `There are ${overview.online.length} players connected:\n${overview.online.join("\n")}`);
    break;

    case "BH.KICK":
      if (!targetPlayer.isStaff) {
        bot.world.send(`/KICK ${targetPlayer.name}`);
      }
    break;
    case "BH.KICK_MOD":
      if (!targetPlayer.isAdmin && targetPlayer.isMod) {
        bot.world.send(`/KICK ${targetPlayer.name}`);
      }
    break;
    case "BH.KICK_ADMIN":
      if (targetPlayer.isAdmin) {
        bot.world.send(`/KICK ${targetPlayer.name}`);
      }
    break;

    case "BH.BAN":
      if (!targetPlayer.isStaff) {
        bot.world.send(`/BAN ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been added to the blacklist`);
      }
    break;
    case "BH.BAN_MOD":
      if (targetPlayer.isMod && !targetPlayer.isAdmin) {
        bot.world.send(`/BAN ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been added to the blacklist`);
      }
    break;
    case "BH.BAN_ADMIN":
    if (targetPlayer.isAdmin && !targetPlayer.isOwner) {
      bot.world.send(`/BAN ${targetPlayer.name}`);
      bot.world.send(`${targetPlayer.name} has been added to the blacklist`);
    }
    break;

    case "BH.BAN_NO_DEVICE":
      if (!targetPlayer.isStaff) {
        bot.world.send(`/BAN-NO-DEVICE ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been added to the blacklist`);
      }
    break;
    case "BH.BAN_NO_DEVICE_MOD":
      if (!targetPlayer.isAdmin && targetPlayer.isMod) {
        bot.world.send(`/BAN-NO-DEVICE ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been added to the blacklist`);
      }
    break;
    case "BH.BAN_NO_DEVICE_ADMIN":
      if (targetPlayer.isAdmin && !targetPlayer.isOwner) {
        bot.world.send(`/BAN-NO-DEVICE ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been added to the blacklist`);
      }
    break;

    case "BH.LIST_MODLIST":
    case "BH.LIST_ADMINLIST":
    case "BH.LIST_BLACKLIST":
    case "BH.LIST_WHITELIST":
      lists = await bot.world.getLists(true);
      const listType = id.split("_")[1].toLocaleLowerCase() as "modlist"|"adminlist"|"blacklist"|"whitelist";
      bot.world.send(`${listType[0].toLocaleUpperCase()}${listType.slice(1)}:\n${lists[listType].join(", ")}`);
    break;

    case "BH.UNBAN":
      lists = await bot.world.getLists(true);
      if (lists.blacklist.map(s => s.toLocaleUpperCase()).includes(targetPlayer.name.toLocaleUpperCase())) {
        bot.world.send(`${targetPlayer.name} was not on the blacklist.`);
      } else {
        bot.world.send(`/UNBAN ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been removed from the blacklist.`);
      }
    break;

    case "BH.WHITELIST":
      if (targetPlayer.isWhitelisted) {
        bot.world.send(`${targetPlayer.name} was already on the whitelist.`);
      } else {
        bot.world.send(`/WHITELIST ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been added to the whitelist.`);
      }
    break;
    case "BH.UNWHITELIST":
      if (targetPlayer.isWhitelisted) {
        bot.world.send(`/UNWHITELIST ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been removed from the whitelist.`);
      } else {
        bot.world.send(`${targetPlayer.name} was not on the whitelist.`);
      }
    break;

    case "BH.STOP":
      bot.world.send("/STOP");
    break;

    case "BH.PVPON":
      if (overview.pvp) {
        bot.world.send("PVP was already enabled.");
      } else {
        bot.world.send("/PVP-ON");
        bot.world.send("PVP is now enabled.");
      }
    break;
    case "BH.PVPOFF":
      if (overview.pvp) {
        bot.world.send("/PVP-OFF");
        bot.world.send("PVP is now disabled.");
      } else {
        bot.world.send("PVP was already disabled.");
      }
    break;

    case "BH.LOADLISTS":
      bot.world.send("/LOAD-LISTS");
      bot.world.send("Reloaded lists.");
    break;

    case "BH.MOD":
        if (targetPlayer.isMod) {
          bot.world.send(`${targetPlayer.name} was already on the modlist`);
        } else {
          bot.world.send(`/MOD ${targetPlayer.name}`);
          bot.world.send(`${targetPlayer.name} has been added to the modlist`);
        }
    break;
    case "BH.UNMOD":
      if (targetPlayer.isMod) {
        bot.world.send(`/UNMOD ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been removed from the modlist`);
      } else {
        bot.world.send(`${targetPlayer.name} was not on the modlist`);
      }
    break;

    case "BH.ADMIN":
      if (targetPlayer.isAdmin) {
        bot.world.send(`${targetPlayer.name} was already on the adminlist`);
      } else {
        bot.world.send(`/ADMIN ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been added to the adminlist`);
      }
    break;
    case "BH.UNADMIN":
      if (targetPlayer.isAdmin) {
        bot.world.send(`/UNADMIN ${targetPlayer.name}`);
        bot.world.send(`${targetPlayer.name} has been removed from the adminlist`);
      } else {
        bot.world.send(`${targetPlayer.name} was not on the adminlist`);
      }
    break;

    case "BH.CLEARWHITELIST":
      bot.world.send("/CLEAR-WHITELIST");
      bot.world.send("Whitelist cleared.");
    break;
    case "BH.CLEARADMINLIST":
      bot.world.send("/CLEAR-ADMINLIST");
      bot.world.send("Adminlist cleared.");
    break;
    case "BH.CLEARMODLIST":
      bot.world.send("/CLEAR-MODLIST");
      bot.world.send("Modlist cleared.");
    break;
    case "BH.CLEARBLACKLIST":
      bot.world.send("/CLEAR-BLACKLIST");
      bot.world.send("Blacklist cleared.");
    break;
    
    case "BH.SETPRIVACY":
      const privacy = args.toLocaleLowerCase();
      if (["public", "searchable", "private"].includes(privacy)) {
        bot.world.send(`/SET-PRIVACY ${privacy}`);
        bot.world.send(`Privacy setting has changed to ${privacy}.`);
      }
    break;

    case "BH.SETPASSWORD":
      bot.world.send(`/SET-PASSWORD ${args}`);
      bot.world.send("Password set.");
    break;
    case "BH.REMOVEPASSWORD":
      if (overview.password) {
        bot.world.send(`/REMOVE-PASSWORD ${args}`);
        bot.world.send("Removed password.");
      } else {
        bot.world.send("There was already no password set.");
      }
    break;
    

  }


};