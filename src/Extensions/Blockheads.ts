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
      category: "Blockheads/Administrator Commands",
      name: "View the /players message"
    }
  }
];