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
  },
  {
    callback,
    id: "GM.CHECK",
    command: "GM-CHECK",
    display: {
      category: "Group Management/General Commands",
      name: "Check if a player has a permission with /GM-check"
    }
  },
  {
    callback,
    id: "GM.USER",
    command: "GM-USER",
    display: {
      category: "Group Management/General Commands",
      name: "View all the groups/user specific permissions a user has with /GM-user"
    }
  },
  {
    callback,
    id: "GM.GROUP",
    command: "GM-GROUP",
    display: {
      category: "Group Management/Group Commands",
      name: "View information about a group with /GM-group"
    }
  },
  {
    callback,
    id: "GM.ADD",
    command: "GM-ADD",
    display: {
      category: "Group Management/Group Commands",
      name: "Add others to a group with /GM-add"
    }
  },
  {
    callback,
    id: "GM.REMOVE",
    command: "GM-REMOVE",
    display: {
      category: "Group Management/Group Commands",
      name: "Remove others from a group with /GM-remove"
    }
  },
  {
    callback,
    id: "GM.GSET",
    command: "GM-GSET",
    display: {
      category: "Group Management/Permission Commands",
      name: "Set a permission of a group with /GM-gset"
    }
  },
  {
    callback,
    id: "GM.USET",
    command: "GM-USET",
    display: {
      category: "Group Management/Permission Commands",
      name: "Set a permission of a user with /GM-uset"
    }
  },
  {
    callback,
    id: "GM.CREATE",
    command: "GM-CREATE",
    display: {
      category: "Group Management/Group Commands",
      name: "Create a group with /GM-create"
    }
  },
  {
    callback,
    id: "GM.DESTORY",
    command: "GM-DESTORY",
    display: {
      category: "Group Management/Group Commands",
      name: "Destroy a group with /GM-destory"
    }
  },
  {
    callback,
    id: "GM.LIST",
    command: "GM-LIST",
    display: {
      category: "Group Management/Group Commands",
      name: "View a grouplist with /GM-list"
    }
  }
  
];