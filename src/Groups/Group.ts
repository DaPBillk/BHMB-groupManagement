import { Player, MessageBot } from "@bhmb/bot";
import { GroupManager } from "./GroupManager";
import { Permissions, PermissionsSaveData } from "../Permissions/Permissions";
import { Permission } from "../Permissions/Permission";

const html = `<div class="container">
<div class="box" style="min-width: 35%; max-width: 35%; min-height: 95%; float: left; margin-top: 1%;">
  <aside class="menu"></aside>
</div>
<div class="box" style="min-width: 63%; max-width: 63%; min-height: 95%; float: right; margin-top: 1%;">
  <label>
    <span class="title">{TITLE}</span>
  </label>
  <label>
    <span class="subtitle" style="padding-left: 1%;">
      <a href="#" data-action="rename">Rename</a> - <a href="#" data-action="delete">Delete</a>
    </span>
    <span class="subtitle is-pulled-right">
      <a href="#" data-action="create">New Group</a>
    </span>
  </label>
</div>
</div>
`; //Because apparently we get an error with tests.

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

    if (manager.management.ui) {
      this.tab = manager.management.ui.addTab(this.name, "dapersonmgn/groupManagement/tab");
      this.tab.innerHTML = html.replace("{TITLE}", this.name);
      const permissions = MessageBot.extensions.map(extension => this.manager.management.permissions.getExtensionPermissions(extension)).reduce((pSetA, pSetB) => pSetA.concat(pSetB));
      
      const categories : {
        [category : string] : {
          [subcategory : string] : Permission[]
        }
      } = {};
      for (const permission of permissions) {
        const [parentCategory, subCategory] = permission.category.split("/");
        if (!categories[parentCategory]) {
          categories[parentCategory] = {};
        }
        if (!categories[parentCategory][subCategory]) {
          categories[parentCategory][subCategory] = [];
        }
        categories[parentCategory][subCategory].push(permission);
      }

      let categoryHTML = "";

      for (const parentCategory in categories) {
        categoryHTML += `<p class="menu-label" data-category="${parentCategory}">${parentCategory}</p><ul class="menu-list" data-category="${parentCategory}">`;
        for (const subCategory in categories[parentCategory]) {
          categoryHTML += `<li><a href="#" data-subcategory="${subCategory}">${subCategory}</a></li>`;
        }
        categoryHTML += `</ul>`;
      }

      (this.tab.querySelector(".menu") as HTMLElement).innerHTML = categoryHTML;
    }

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