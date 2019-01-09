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

  addPermission (permission : Permission) {
    const [parentCategory, subCategory] = permission.category.split("/");
    const groups = this.management.groups.get() as Map<number, Group>;
    for (const [, group] of groups) {
      const tab = group.tab as HTMLDivElement;
      if (!tab.querySelector(`p[data-category="${parentCategory}"]`)) {
        //Parent category does not exist, we need to create it.
        (tab.querySelector(".menu") as HTMLElement).innerHTML += `<p class="menu-label is-unselectable" data-category="${parentCategory}">${parentCategory}</p><ul class="menu-list" data-category="${parentCategory}"></ul>`;
      }
      if (!tab.querySelector(`ul[data-category="${parentCategory}"] > li > a[data-subcategory="${subCategory}"]`)) {
          //Subcategory doesn't exist, create it.
          const listEl = tab.querySelector(`ul[data-category="${parentCategory}"]`) as HTMLUListElement;
          listEl.innerHTML += `<li><a href="#" class="is-unselectable" data-subcategory="${subCategory}">${subCategory}</a></li>`;
          
      }
      //Add the permission to it's tab.
    }
  }

  addGroup (group : Group) : HTMLDivElement | undefined {
    let tab : HTMLDivElement | undefined;
    console.log(123);
    if (this._ui) {
      console.log(group);
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
      let firstSubCategorySelected = false;
      let isSelected = false;
      for (const parentCategory in categories) {
        categoryHTML += `<p class="menu-label is-unselectable" data-category="${parentCategory}">${parentCategory}</p><ul class="menu-list" data-category="${parentCategory}">`;
        for (const subCategory in categories[parentCategory]) {
          if (firstSubCategorySelected) {
            //Normal.
            isSelected = false;
            categoryHTML += `<li><a href="#" class="is-unselectable" data-subcategory="${subCategory}">${subCategory}</a></li>`;
          } else {
            //Selected.
            isSelected = true;
            firstSubCategorySelected = true;
            categoryHTML += `<li><a href="#" class="is-unselectable" style="background: #182b73; color: #ffffff;" data-subcategory="${subCategory}" data-selected>${subCategory}</a></li>`; 
          }
          const columns : string[][] = [[], [], []];
          let colNum = 0;
          for (const permission of permissions) {
            if (permission.category === `${parentCategory}/${subCategory}`) {
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
          }
          let subCategoryTab = `<div data-subcategory="${subCategory}" ${isSelected ? "" : 'class="is-invisible" style="display: none;"'}><div class="columns" style="padding-top: 2.5%;"><div class="column">${columns[0].join("")}</div><div class="column">${columns[1].join("")}</div><div class="column">${columns[2].join("")}</div></div></div>`;
          (tab.querySelectorAll(".box")[1] as HTMLElement).innerHTML += subCategoryTab;
        }
        categoryHTML += `</ul>`;
      }
      (tab.querySelector(".menu") as HTMLElement).innerHTML = categoryHTML;
      (tab.querySelector('a[data-action="rename"]') as HTMLElement).addEventListener("click", event => this.renameGroupListener(event, group));
      (tab.querySelector('a[data-action="delete"]') as HTMLElement).addEventListener("click", event => this.deleteGroupListener(event, group));
      (tab.querySelector('a[data-action="create"]') as HTMLElement).addEventListener("click", () => this.addGroupListener());
      tab.addEventListener("change", event => this.changePermissionListener(event, group));
      Array.from((tab.querySelectorAll("a[data-subcategory]") as NodeListOf<HTMLElement>)).map(element => element.addEventListener("click", event => this.subcategoryListener(event, group)));

    }

    // TODO: Select this tab.
    return tab;
  }

  deleteGroup (group : Group) {
    if (group.tab) {
      this._ui.removeTab(group.tab);
    }
  }

  refreshGroup (group : Group) {
    if (group.tab) {
      this.deleteGroup(group);
      group.tab = this.addGroup(group);
    }
  }

  changePermissionListener (event : Event, group : Group) {
    const target = event.target as HTMLInputElement;
    const permission = target.getAttribute("data-permission") as string;
    if (target.checked) {
      group.permissions.add(permission);
    } else {
      group.permissions.delete(permission);
    }
    console.log(permission);
  }

  deleteGroupListener (_ : MouseEvent, group : Group) {
    this._ui.alert("Are you sure?", [
      {
        text: "Yes",
        style: "is-danger"
      },
      {
        text: "Cancel"
      }
    ], response => {
      if (response === "Yes") {
        const result = group.delete();
        if (!result) {
          this._ui.notify("Failed to delete group.");
        } else {
          this._ui.toggleMenu();
        }
      }
    });
  }

  renameGroupListener (_ : MouseEvent, group : Group) {
    this._ui.prompt("What would you like to rename this group to?", newName => {
      if (newName) {
        const result = group.rename(newName);
        if (!result) {
          this._ui.notify("Failed to rename group.");
        } else {
          this._ui.toggleMenu();
        }
      }
    });
  }

  addGroupListener () {
    this._ui.prompt("What would you like to name this new group?", name => {
      if (name) {
        const result = this.management.groups.add({
          name
        });
        if (result) {
          this._ui.toggleMenu();
        } else {
          this._ui.notify("This group name already exists!");
        }
      }
    });
  }

  subcategoryListener (event : MouseEvent, group : Group) {
    const tab = group.tab as HTMLDivElement;
    const wantedSubCategory = (event.target as HTMLElement).getAttribute("data-subcategory");
    const tabToShow = tab.querySelector(`div[data-subcategory="${wantedSubCategory}"]`) as HTMLDivElement;
    if (tabToShow.classList.contains("is-invisible")) {
      const oldSelectedCategory = (((event.target as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement).querySelector("a[data-selected]") as HTMLElement;
      if (oldSelectedCategory) {
        oldSelectedCategory.setAttribute("style", "");
        oldSelectedCategory.removeAttribute("data-selected");
        const tabToHide = tab.querySelector(`div[data-subcategory="${oldSelectedCategory.getAttribute("data-subcategory")}"]`) as HTMLDivElement;
        tabToHide.classList.add("is-invisible");
        tabToHide.setAttribute("style", "display: none");
      }
      (event.target as HTMLElement).setAttribute("style", "background: #182b73; color: #ffffff;");
      (event.target as HTMLElement).setAttribute("data-selected", "");
      tabToShow.classList.remove("is-invisible");
      tabToShow.setAttribute("style", "");
    }
  }

}

export {
  UI
};