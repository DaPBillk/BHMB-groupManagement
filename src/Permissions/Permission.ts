import { PermissionManager } from "./PermissionManager";
import { Player } from "@bhmb/bot";

export type PermissionResolvable = string|Permission;

export interface PermissionIgnoring {
  mod?: boolean,
  admin?: boolean,
  staff?: boolean,
  owner?: boolean
}

export interface PermissionData {
  extension: string;
  id: string;
  name: string;
  category: string;
  command: string;
  callback: (player: Player, args: string, id : string) => void,
  ignore?: PermissionIgnoring
};

interface InternalPermissionData {
  id: string;
  category: string;
  name: string;
  command: string;
  callback: (player : Player, args : string, id : string) => void
  ignore?: PermissionIgnoring;
};

export class Permission {

  extension: string;

  id: string;

  name: string;

  category: string;
  
  callback : (player : Player, args : string, id : string) => void;

  command: string;

  manager: PermissionManager;

  ignore?: PermissionIgnoring;

  listener?: ({player, message} : {player : Player, message : string}) => void;

  constructor (manager: PermissionManager, extension : string, data: InternalPermissionData) {
    const {id, name, category, ignore, callback, command} = data;
    this.extension = extension;
    this.id = id;
    this.name = name;
    this.category = category;
    this.ignore = ignore;
    this.callback = callback;
    this.command = command;
    this.manager = manager;
    this.listener = ({player, message} : {player : Player, message : string}) => this.handleMessage({player, message})
    manager.management.extension.world.onMessage.sub(this.listener);

  }

  handleMessage ({player, message} : {player: Player, message: string}) {
    const [command, ...argsRaw] = message.split(" ");
    const args = argsRaw.join(" ");
    const user = this.manager.management.users.get(player);
    if (this.command.toLocaleUpperCase() === command.toLocaleUpperCase().slice(1)) {
      if (user.permissions.has(this.id)) {
        if (this.ignore) {
          if (!(this.ignore.staff && player.isStaff) && !(this.ignore.admin && player.isAdmin) && !(this.ignore.mod && player.isMod) && !(this.ignore.owner && player.isOwner)) {
            this.callback(player, args, this.id);
          }
        } else {
          this.callback(player, args, this.id);
        }
      }
    }
  }

  /**
   * Delete this permission.
   */
  delete () : boolean {
    return this.manager.delete(this);
  }
};