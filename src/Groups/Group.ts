import { Player } from "@bhmb/bot";
import { GroupManager } from "./GroupManager";
import { Permissions, PermissionsSaveData } from "../Permissions/Permissions";

export interface GroupData {
  name: string;
  permissions?: PermissionsSaveData;
  players?: (Player|string)[];
  managed?: boolean;
};

export interface GroupConstructorData extends GroupData {
  id: number;
};

export interface GroupSaveData {
  id: number;
  name: string;
  permissions: PermissionsSaveData
  players: string[],
  managed: boolean
};

export type GroupResolvable = Group|string|number;

export class Group {

  id: number;

  name: string;

  permissions: Permissions;

  players: Player[];

  managed: boolean;

  manager: GroupManager;

  tab?: HTMLDivElement;

  constructor (groupData : GroupConstructorData, manager : GroupManager) {
    this.name = groupData.name;
    this.id = groupData.id;
    this.permissions = new Permissions(this, groupData.permissions);
    this.players = (groupData.players || []).map(playerOrName => typeof playerOrName === "string" ? this.manager.management.extension.world.getPlayer(playerOrName) : playerOrName);
    this.managed = groupData.managed || false;
    this.manager = manager;

    this.tab = manager.management.ui.addGroup(this);

  }

  /**
   * Rename this group, will return if the operation was successful.
   * @param newName New name
   */
  rename (newName : string) : boolean {
    return this.manager.rename(this, newName);
  }

  /**
   * Delete this group, will return if the operation was successful.
   */
  delete () : boolean {
    return this.manager.delete(this);
  }

  save () {
    return this.manager.save();
  }

  /**
   * Get data about the group that can be saved in storage.
   */
  get data () : GroupSaveData {
    return {
      id: this.id,
      name: this.name,
      permissions: this.permissions.data,
      players: this.players.map(player => player.name),
      managed: this.managed
    };
  }
}