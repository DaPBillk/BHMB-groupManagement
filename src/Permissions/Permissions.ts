import { PermissionResolvable, Permission } from "./Permission";
import { Group } from "../Groups/Group";
import { User } from "../Users/User";

export interface PermissionsSaveData {
  allowed: string[],
  disabled: string[]
}

export class Permissions {

  allowed: Set<string>;

  disabled: Set<string>;

  parent: Group|User;
  
  constructor (parent : Group|User, permissions? : {allowed: string[], disabled: string[]}) {
    const data = permissions || {
      allowed: [],
      disabled: []
    };

    this.parent = parent;
    this.allowed = new Set(data.allowed);
    this.disabled = new Set(data.disabled);
  }

  has (permissionResolvable : PermissionResolvable) {
    const permission = this.resolvePermission(permissionResolvable);
    if (!permission) return false;
    return this.allowed.has(permission.id);
  }

  add (permissionResolvable : PermissionResolvable, sudo : boolean = false, disabled : boolean = false) : boolean {
    const permission = this.resolvePermission(permissionResolvable);
    if (!permission || this.allowed.has(permission.id) || (this.disabled.has(permission.id) && !sudo)) return false;
    this.allowed.add(permission.id);
    if (disabled && !this.disabled.has(permission.id)) {
      this.disabled.add(permission.id);
    }
    this.save();
    return true;
  }

  delete (permissionResolvable : PermissionResolvable, sudo : boolean = false, disabled : boolean = false) : boolean {
    const permission = this.resolvePermission(permissionResolvable);
    if (!permission || (!sudo && this.disabled.has(permission.id))) return false;
    const deleted = this.allowed.delete(permission.id);
    const deletedDisabled = disabled ? this.disabled.delete(permission.id) : false;
    this.save();
    return deleted || deletedDisabled;
  }

  save () {
    return this.parent.save();
  }

  private resolvePermission (permissionResolvable : PermissionResolvable) : Permission | undefined {
    return this.parent.manager.management.permissions.get(permissionResolvable);
  }

  get data () : PermissionsSaveData {
    return {
      allowed: Array.from(this.allowed),
      disabled: Array.from(this.disabled)
    };
  }
}