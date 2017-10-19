var permissionHandler = require("./BHhandler.js")

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
