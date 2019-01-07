import { MessageBotExtension } from "@bhmb/bot";
import { UIExtensionExports } from "@bhmb/ui";
import { GroupManager } from "./Groups/GroupManager";
import { PermissionManager } from "./Permissions/PermissionManager";
import { UserManager } from "./Users/UserManager";

export class GroupManagement {

  groups: GroupManager;

  users: UserManager;

  permissions: PermissionManager;

  extension: MessageBotExtension;

  ui?: UIExtensionExports;

  constructor (ex : MessageBotExtension) {
    this.extension = ex;
    this.groups = new GroupManager(this);
    this.permissions = new PermissionManager(this);
    this.users = new UserManager(this);
    this.ui = ex.bot.getExports("ui") as UIExtensionExports;

    if (this.ui) {
      this.ui.addTabGroup("Group Management", "dapersonmgn/groupManagement/tab");
    }

  }

  /**
   * Save the groups and users.
   */
  save () {
    this.groups.save();
    this.users.save();
  }


}