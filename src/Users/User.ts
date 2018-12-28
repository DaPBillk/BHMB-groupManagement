import { Player } from "@bhmb/bot";
import { UserManager } from "./UserManager";
import { Permissions, PermissionsSaveData } from "../Permissions/Permissions";

export type PlayerResolvable = User|Player|string;

export interface UserData {
  player: Player;
  permissions?: [];
}

export interface UserSaveData {
  player: string;
  permissions: PermissionsSaveData;
}

export class User {

  manager: UserManager;

  player: Player;

  permissions: Permissions;

  constructor (userData : UserData, manager : UserManager) {
    this.manager = manager;
    this.player = userData.player;
    this.permissions = new Permissions(this, {
      allowed: userData.permissions || [],
      disabled: []
    });
  }

  /**
   * Delete this user's permissions.
   */
  delete () : boolean {
    return this.manager.delete(this);
  }

  /**
   * Save
   */
  save () {
    return this.manager.save();
  }

  /**
   * Get the name of the user.
   */
  get name () {
    return this.player.name;
  }

  /**
   * Get a JSON object that can be saved to storage
   */
  get data () : UserSaveData {
    return {
      player: this.name,
      permissions: this.permissions.data
    };
  }
};