import { UIExtensionExports } from "@bhmb/ui";
import { GroupManagement } from "../GroupManagement";
import { Group } from "../Groups/Group";
import { MessageBot } from "@bhmb/bot";
import { Permission } from "../Permissions/Permission";
import groupTabHTML from "./Groups/Tab.html";
import permissionHTML from "./Groups/Permission.html";

class UI {

  private _ui : UIExtensionExports;

  management : GroupManagement;

  namespace : string;

  constructor (management : GroupManagement) {
    this._ui = management.extension.bot.getExports("ui") as UIExtensionExports;
    this.management = management;
    this.namespace = "dapersonmgn/groupManagement/tab";
    if (this._ui) {
      this._ui.addTabGroup("Group Management", this.namespace);
    }
  }

  uninstall () {
    if (this._ui) {
      this._ui.removeTabGroup(this.namespace);
    }
  }

  addGroup (group : Group) : HTMLDivElement | undefined {
    let tab;
    if (this._ui) {
      tab = this._ui.addTab(group.name, this.namespace);
      tab.innerHTML = groupTabHTML.replace("{TITLE}", group.name);

      const permissions = MessageBot.extensions.map(extension => group.manager.management.permissions.getExtensionPermissions(extension)).reduce((pSetA, pSetB) => pSetA.concat(pSetB));
      
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
        categoryHTML += `<p class="menu-label is-unselectable" data-category="${parentCategory}">${parentCategory}</p><ul class="menu-list" data-category="${parentCategory}">`;
        for (const subCategory in categories[parentCategory]) {
          categoryHTML += `<li><a href="#" class="is-unselectable" data-subcategory="${subCategory}">${subCategory}</a></li>`;
          const columns : string[][] = [[], [], []];
          let colNum = 0;
          for (const permission of permissions) {
            if (columns.length === colNum) {
              colNum = 0;
            }
            columns[colNum].push(
              permissionHTML
                .replace("{ID}", permission.id)
                .replace("{PERMISSION}", permission.name)
                .replace("{ALLOWED}", group.permissions.has(permission) ? "checked " : "")
                .replace("{DISABLED}", group.permissions.disabled.has(permission.id) ? "disabled" : "")
            );
            colNum++;
          }
          let subCategoryTab = `<div data-subcategory="${subCategory}" class="is-invisible"><div class="columns"><div class="column">${columns[0].join("")}</div><div class="column">${columns[1].join("")}</div><div class="column">${columns[2].join("")}</div></div></div>`;
          (tab.querySelectorAll(".box")[1] as HTMLElement).innerHTML += subCategoryTab;
        }
        categoryHTML += `</ul>`;
      }
      (tab.querySelector(".menu") as HTMLElement).innerHTML = categoryHTML;



    }

    // TODO: Select this tab.
    return tab;
  }

  deleteGroup (group : Group) {
    if (group.tab) {
      this._ui.removeTab(group.tab);
      // TODO: Select first tab.
    }
  }

  refreshGroup (group : Group) {
    if (group.tab) {
      this.deleteGroup(group);
      group.tab = this.addGroup(group);
      // TODO: Target new tab..
    }
  }
}

export {
  UI
};