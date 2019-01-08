import { MessageBotExtension } from "@bhmb/bot";
import { GroupManager } from "./Groups/GroupManager";
import { PermissionManager } from "./Permissions/PermissionManager";
import { UserManager } from "./Users/UserManager";
import { UI } from "./UI";

export class GroupManagement {

  groups: GroupManager;

  users: UserManager;

  permissions: PermissionManager;

  extension: MessageBotExtension;

  ui: UI;

  constructor (ex : MessageBotExtension) {
    this.extension = ex;
    this.groups = new GroupManager(this);
    this.permissions = new PermissionManager(this);
    this.users = new UserManager(this);
    this.ui = new UI(this);
  }

  uninstall () {
    this.ui.uninstall();
  }

  /**
   * Save the groups and users.
   */
  save () {
    this.groups.save();
    this.users.save();
  }


}