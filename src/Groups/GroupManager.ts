import { Group, GroupData, GroupResolvable, GroupSaveData } from "./Group";
import { GroupManagement } from "../GroupManagement";

const SAVE_KEY = "groups";

export class GroupManager {

  management: GroupManagement;

  private _groups: Map<number, Group>;

  constructor (management : GroupManagement) {
    this.management = management;

    // console.log(this.management.extension.storage.get(SAVE_KEY, []).map((data) => {
    //   return [data];
    // }));
    
    this._groups = new Map(this.management.extension.storage.get(SAVE_KEY, []).map((groupData : GroupSaveData) => [groupData.id, new Group(groupData, this)] as [number, Group]));
  }

  /**
   * Adds a group.
   * @param groupData Data about the group to be added. 
   */
  add (groupData : GroupData) : Group|undefined {
    if (!this.get(groupData.name)) {
      const id = this.nextID;
      const group = new Group({id, ...groupData}, this);
      this._groups.set(id, group);
      this.save();
      return group;
    }
  }

  /**
   * Delete a group, will return if the operation was successful.
   * @param groupResolvable Some identifier that can resolve to the group being deleted.
   */
  delete (groupResolvable : GroupResolvable) : boolean {
    const group = this.resolveGroup(groupResolvable);
    if (!group) return false;
    this._groups.delete(group.id);
    this.save();
    //TODO: Remove from UI.
    return true;
  }

  /**
   * Retrieve a group.
   * @param groupNameOrID Either the group's name or id.
   */
  get (groupNameOrID : string|number) : Group|undefined {
    if (typeof groupNameOrID === "string") {
      for (const [, group] of this._groups) {
        if (group.name === groupNameOrID) {
          return group;
        }
      }
    } else {
      return this._groups.get(groupNameOrID);
    }
  }

  /**
   * Rename a group to another name. Will return if the operation was successful.
   * @param groupResolvable Some identifier that can resolve to become the group to be renamed.
   * @param newName New name of the group.
   */
  rename (groupResolvable : GroupResolvable, newName : string) : boolean {
    const group = this.resolveGroup(groupResolvable);
    if (group && !this.get(newName) && !group.managed) {
      group.name = newName;
      this.save();
      //TODO: UI.
      return true;
    }
    return false;
  }

  /**
   * Resolve a group.
   * @param groupResolvable The to be resolved.
   */
  private resolveGroup (groupResolvable : GroupResolvable) : Group|undefined {
    let group;

    if (typeof groupResolvable === "string") {
      group = this.get(groupResolvable);
    } else if (typeof groupResolvable === "number") {
      group = this._groups.get(groupResolvable);
    } else {
      group = groupResolvable;
    }
    return group;
  }

  /**
   * Save the group data to storage.
   */
  save () {
    let saveData : GroupSaveData[] = [];
    for (const [, group] of this._groups) {
      saveData.push(group.data);
    }
    this.management.extension.storage.set(SAVE_KEY, saveData);
  }

  /**
   * Get the next group ID.
   */
  get nextID () {
    let latestID = 0;
    for (const [id] of this._groups) {
      if (id > latestID) {
        latestID = id;
      }
    }
    return latestID + 1;
  }
}