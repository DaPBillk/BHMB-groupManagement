import callback from "./GroupManagementHandler";
import { ExtensionPermission } from "..";

interface GroupManagementExtensionPermission extends ExtensionPermission {
  display: {
    category: "Group Management/General Commands"|"Group Management/Group Commands"|"Group Management/Permission Commands",
    name: string
  }
}

export const GroupManagementPermissions : GroupManagementExtensionPermission[] = [
  {
    callback,
    id: "GM.HELP",
    command: "GM-HELP",
    display: {
      category: "Group Management/General Commands",
      name: "View the /GM-help message"
    },
  }
];