import { MessageBotExtension } from "@bhmb/bot";
import { GroupManager } from "./Groups/GroupManager";
import { PermissionManager } from "./Permissions/PermissionManager";

export class GroupManagement {

  groups: GroupManager;

  users: any;

  permissions: PermissionManager;

  extension: MessageBotExtension;

  constructor (ex : MessageBotExtension) {
    this.extension = ex;
    this.groups = new GroupManager(this);
    this.permissions = new PermissionManager(this);
  }

  /**
   * Save the groups and users.
   */
  save () {
    this.groups.save();
    this.users.save();
  }


}