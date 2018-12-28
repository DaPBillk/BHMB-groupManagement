import { GroupManagement } from "../GroupManagement";
import { Permission, PermissionData, PermissionResolvable } from "./Permission";

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
    const id = permissionData.id.toLocaleLowerCase();
    if (!this.get(id)) {
      const permission = new Permission(this, permissionData.extension, {
        id: permissionData.id,
        name: permissionData.name,
        category: permissionData.category
      });
      this._permissions.set(id, permission);
      return true;
    }
    return false;
  }

  /**
   * Delete a permission, will return in the operation was successful.
   */
  delete (permissionResolvable : PermissionResolvable) : boolean {
    const id = this.resolvePermissionID(permissionResolvable);
    const deleted = this._permissions.delete(id);
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

  private resolvePermissionID (permissionResolvable : PermissionResolvable) : string {
    return typeof permissionResolvable === "string" ? permissionResolvable.toLocaleLowerCase() : permissionResolvable.id;
  }
};