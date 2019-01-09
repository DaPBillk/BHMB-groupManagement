import callback from "./BlockheadsHandler";
import { ExtensionPermission } from "..";

export const BlockheadPermissions : ExtensionPermission[] =  [
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
    id: "BH.KICKMOD",
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
    id: "BH.KICKADMIN",
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
    id: "BH.BANMOD",
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
    id: "BH.BANADMIN",
    command: "BAN",
    ignore: {
      admin: true
    },
    display: {
      category: "Blockheads/Administrator Commands",
      name: "Ban any administrator"
    }
  }
];