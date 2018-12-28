import { GroupManagement } from "../GroupManagement";
import { PlayerResolvable, User, UserSaveData } from "./User";

const SAVE_KEY = "users";

export class UserManager {
  management: GroupManagement;

  private _users: Map<string, User>;

  constructor (management : GroupManagement) {
    this.management = management;
    this._users = new Map(this.management.extension.storage.get(SAVE_KEY, []));
  }

  get (playerResolvable : PlayerResolvable) {
    const player = this.resolvePlayer(playerResolvable);
    let user = this._users.get(player.name);
    if (!user) {
      //Create user.
      user = new User({
        player
      }, this);
      this._users.set(player.name, user);
    }
    return user;
  }

  delete (playerResolvable : PlayerResolvable) : boolean {
    const user = this.resolvePlayer(playerResolvable);
    if (!user) return false;
    const deleted = this._users.delete(user.name);
    //TODO: Remove from UI.
    this.save();
    return deleted;
  }

  save () {
    let saveData : [string, UserSaveData][] = [];
    for (const [name, user] of this._users) {
      saveData.push([name, user.data]);
    }
    this.management.extension.storage.set(SAVE_KEY, saveData);
  }

  private resolvePlayer (playerResolvable : PlayerResolvable) {
    return this.management.extension.world.getPlayer(typeof playerResolvable === "string" ? playerResolvable : playerResolvable.name);
  }

}