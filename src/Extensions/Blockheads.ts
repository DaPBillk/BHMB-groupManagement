import callback from "./BlockheadsHandler";
import { ExtensionPermission } from "..";

interface BlockheadExtensionPermission extends ExtensionPermission {
  display: {
    category: "Blockheads/Moderator Commands"|"Blockheads/Administrator Commands"|"Blockheads/List Commands"|"Blockheads/World Commands",
    name: string
  }
}

export const BlockheadPermissions : BlockheadExtensionPermission[] =  [
  {
    callback,
    id: "BH.HELP",
    command: "HELP",
    ignore: {
      staff: true
    },
    display: {
      category: "Blockheads/Moderator Commands",
      name: "View the /help message"
    },
  },
  {
    callback,
    id: "BH.PLAYERS",
    command: "PLAYERS",
    ignore: {
      staff: true
    },
    display: {
      category: "Blockheads/Moderator Commands",
      name: "View the /players message"
    }
  },
  {
    callback,
    id: "BH.KICK",
    command: "KICK",
    ignore: {
      staff: true
    },
    display: {
      category: "Blockheads/Moderator Commands",
      name: "Kick any normal player"
    }
  },
  {
    callback,
    id: "BH.KICK_MOD",
    command: "KICK",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Kick any moderator"
    }
  },
  {
    callback,
    id: "BH.KICK_ADMIN",
    command: "KICK",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Kick any administrator"
    }
  },
  {
    callback,
    id: "BH.BAN",
    command: "BAN",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Moderator Commands",
      name: "Ban any normal player"
    }
  },
  {
    callback,
    id: "BH.BAN_MOD",
    command: "BAN",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Ban any moderator"
    }
  },
  {
    callback,
    id: "BH.BAN_ADMIN",
    command: "BAN",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Ban any administrator"
    }
  },
  {
    callback,
    id: "BH.BAN_NO_DEVICE",
    command: "BAN-NO-DEVICE",
    ignore: {
      staff: true
    },
    display: {
      category: "Blockheads/Moderator Commands",
      name: "Ban any normal player using /ban-no-device"
    }
  },
  {
    callback,
    id: "BH.BAN_NO_DEVICE_MOD",
    command: "BAN-NO-DEVICE",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Ban any moderator using /ban-no-device"
    }
  },
  {
    callback,
    id: "BH.BAN_NO_DEVICE_ADMIN",
    command: "BAN-NO-DEVICE",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Ban any administrator using /ban-no-device"
    }
  },
  {
    callback,
    id: "BH.UNBAN",
    command: "UNBAN",
    ignore: {
      staff: true
    },
    display: {
      category: "Blockheads/Moderator Commands",
      name: "Unban any player"
    }
  },
  {
    callback,
    id: "BH.WHITELIST",
    command: "WHITELIST",
    ignore: {
      staff: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "Whitelist any player"
    }
  },
  {
    callback,
    id: "BH.UNWHITELIST",
    command: "UNWHITELIST",
    ignore: {
      staff: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "Unwhitelist any player"
    }
  },
  {
    callback,
    id: "BH.LIST_BLACKLIST",
    command: "LIST-BLACKLIST",
    ignore: {
      staff: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "List the blacklist"
    }
  },
  {
    callback,
    id: "BH.LIST_WHITELIST",
    command: "LIST-WHITELIST",
    ignore: {
      staff: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "List the whitelist"
    }
  },
  {
    callback,
    id: "BH.LIST_ADMINLIST",
    command: "LIST-ADMINLIST",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "List the adminlist"
    }
  },
  {
    callback,
    id: "BH.LIST_MODLIST",
    command: "LIST-MODLIST",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "List the modlist"
    }
  },
  {
    callback,
    id: "BH.STOP",
    command: "STOP",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Stop the server"
    }
  },
  {
    callback,
    id: "BH.PVPON",
    command: "PVP-ON",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/World Commands",
      name: "Turn PVP on"
    }
  },
  {
    callback,
    id: "BH.PVPOFF",
    command: "PVP-OFF",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/World Commands",
      name: "Turn PVP off"
    }
  },
  {
    callback,
    id: "BH.LOADLISTS",
    command: "LOAD-LISTS",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "Reload the lists"
    }
  },
  {
    callback,
    id: "BH.MOD",
    command: "MOD",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Add others to the modlist"
    }
  },
  {
    callback,
    id: "BH.UNMOD",
    command: "UNMOD",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Remove others from the modlist"
    }
  },
  {
    callback,
    id: "BH.ADMIN",
    command: "ADMIN",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Add others to the adminlist"
    }
  },
  {
    callback,
    id: "BH.UNADMIN",
    command: "UNADMIN",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Remove others from the adminlist"
    }
  },
  {
    callback,
    id: "BH.CLEARBLACKLIST",
    command: "CLEAR-BLACKLIST",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "Clear the blacklist"
    }
  },
  {
    callback,
    id: "BH.CLEARWHITELIST",
    command: "CLEAR-WHITELIST",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "Clear the whitelist"
    }
  },
  {
    callback,
    id: "BH.CLEARMODLIST",
    command: "CLEAR-MODLIST",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "Clear the modlist"
    }
  },
  {
    callback,
    id: "BH.CLEARADMINLIST",
    command: "CLEAR-ADMINLIST",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/List Commands",
      name: "Clear the adminlist"
    }
  },
  {
    callback,
    id: "BH.SETPASSWORD",
    command: "SET-PASSWORD",
    ignore: {
      owner: true
    },
    display: {
      category: "Blockheads/World Commands",
      name: "Set the world's password."
    }
  },
  {
    callback,
    id: "BH.SETPRIVACY",
    command: "SET-PRIVACY",
    ignore: {
      owner: true
    },
    display: {
      category: "Blockheads/World Commands",
      name: "Set the privacy of the world"
    }
  },
  {
    callback,
    id: "BH.REMOVEPASSWORD",
    command: "REMOVE-PASSWORD",
    ignore: {
      owner: true
    },
    display: {
      category: "Blockheads/World Commands",
      name: "Remove the world's password"
    }
  }
];