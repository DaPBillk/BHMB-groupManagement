import { PermissionManager } from "./PermissionManager";
import { Player } from "@bhmb/bot";

export type PermissionResolvable = string|Permission;

export interface PermissionData {
  extension: string;
  id: string;
  name: string;
  category: string;
  command: string;
  callback: (player: Player, args: string) => void
};

interface InternalPermissionData {
  id: string;
  category: string;
  name: string;
};

export class Permission {

  extension: string;

  id: string;

  name: string;

  category: string;

  manager: PermissionManager;

  constructor (manager: PermissionManager, extension : string, data: InternalPermissionData) {
    const {id, name, category} = data;
    this.extension = extension;
    this.id = id;
    this.name = name;
    this.category = category;
    this.manager = manager;
  }

  /**
   * Delete this permission.
   */
  delete () : boolean {
    return this.manager.delete(this);
  }
};