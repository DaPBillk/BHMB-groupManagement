import { GroupManagement } from "../GroupManagement";
import { Permission, PermissionData, PermissionResolvable } from "./Permission";
import { Player } from "@bhmb/bot";

export class PermissionManager {

  management: GroupManagement;

  private _permissions: Map<string, Permission>;

  constructor (management : GroupManagement) {
    this.management = management;
    this._permissions = new Map();
  }

  /**
   * Add a permission, will return if the operation was successful.
   */
  add (permissionData : PermissionData) : boolean {
    if (!this.get(permissionData.id)) {
      this._permissions.set(permissionData.id, new Permission(this, permissionData.extension, {
        id: permissionData.id,
        name: permissionData.name,
        category: permissionData.category,
        ignore: permissionData.ignore,
        command: permissionData.command,
        callback: permissionData.callback
      }));
      this.management.ui.addPermission(this._permissions.get(permissionData.id) as Permission);
      return true;
    }
    return false;
  }

  /**
   * Delete a permission, will return in the operation was successful.
   */
  delete (permissionResolvable : PermissionResolvable) : boolean {
    const id = this.resolvePermissionID(permissionResolvable);
    const permission = this._permissions.get(id) as Permission;
    const deleted = this._permissions.delete(id);
    if (deleted) {
      this.management.extension.world.onMessage.unsub(permission.listener as ({player, message} : {player: Player, message: string}) => void);
    }
    return deleted;
  }

  /**
   * Get all permissions that belong to an extension.
   * @param extension Extension
   */
  getExtensionPermissions (extension : string) : Permission[] {
    const extensionPermissions = [];
    const e = extension.toLocaleLowerCase();
    for (const [, permission] of this._permissions) {
      if (permission.extension.toLocaleLowerCase() === e) {
        extensionPermissions.push(permission);
      }
    }
    return extensionPermissions;
  }

  /**
   * Get a permission.
   */
  get (permissionResolvable : PermissionResolvable) : Permission|undefined {
    const id = this.resolvePermissionID(permissionResolvable);
    return this._permissions.get(id);
  }

  uninstall () {
    for (const [, permission] of this._permissions) {
      this.delete(permission);
    }
  }

  private resolvePermissionID (permissionResolvable : PermissionResolvable) : string {
    return typeof permissionResolvable === "string" ? permissionResolvable : permissionResolvable.id;
  }
};