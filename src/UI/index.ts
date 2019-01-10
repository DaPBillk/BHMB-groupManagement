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
          (listEl.querySelector(`a[data-subcategory="${subCategory}"]`) as HTMLLinkElement).addEventListener("click",  event => this.subcategoryListener(event, group));
          (tab.querySelectorAll(".box")[1] as HTMLDivElement).innerHTML += `<div data-subcategory="${subCategory}" data-category="${parentCategory}" class="is-invisible" style="display: none;"><div class="columns" style="padding-top: 2.5%;"><div class="column"></div><div class="column"></div><div class="column"></div></div></div>`;
      }
      //Add the permission to it's tab.
      
      const columns = Array.from(tab.querySelectorAll(`div[data-subcategory="${subCategory}"][data-category="${parentCategory}"] .column`)) as HTMLDivElement[];
      const col = columns.sort((colA, colB) => colA.querySelectorAll("input[data-permission]").length - colB.querySelectorAll("input[data-permission]").length)[0];
      col.innerHTML += permissionHTML
        .replace("{ID}", permission.id)
        .replace("{PERMISSION}", permission.name)
        .replace("{ALLOWED}", group.permissions.has(permission) ? "checked " : "")
        .replace("{DISABLED}", group.permissions.disabled.has(permission.id) ? "disabled" : "");

      (tab.querySelector(`a[data-subcategory="${subCategory}"]`) as HTMLLinkElement).click();
    }
  }

  addGroup (group : Group) : HTMLDivElement | undefined {
    let tab : HTMLDivElement | undefined;
    if (this._ui) {
      tab = this._ui.addTab(group.name, this.namespace);
      tab.innerHTML = groupTabHTML;
      (tab.querySelector(".title") as HTMLSpanElement).innerText = group.name;
      if (group.managed) {
        tab.querySelectorAll(".subtitle")[0].innerHTML = "";
      }

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
          let subCategoryTab = `<div data-subcategory="${subCategory}" data-category="${parentCategory}" ${isSelected ? "" : 'class="is-invisible" style="display: none;"'}><div class="columns" style="padding-top: 2.5%;"><div class="column">${columns[0].join("")}</div><div class="column">${columns[1].join("")}</div><div class="column">${columns[2].join("")}</div></div></div>`;
          (tab.querySelectorAll(".box")[1] as HTMLElement).innerHTML += subCategoryTab;
        }
        categoryHTML += `</ul>`;
      }
      (tab.querySelector(".menu") as HTMLElement).innerHTML = categoryHTML;
      tab.addEventListener("change", event => this.changePermissionListener(event, group));
      tab.addEventListener("click", event => this.clickListener(event, group));

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
  }

  deleteGroupUI (group : Group) {
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

  renameGroupUI (group : Group) {
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

  addGroupUI () {
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

  clickListener (event : MouseEvent, group : Group) {
    const element = event.target as HTMLLinkElement;
    if (element.tagName === "A") {
      const action = element.getAttribute("data-action");
      if (action) {
        switch (action) {
          case "rename" :
            this.renameGroupUI(group);
          break;
          case "create":
            this.addGroupUI();
          break;
          case "delete":
            this.deleteGroupUI(group);
          break;
        }
      } else {
        const subcategory = element.getAttribute("data-subcategory");
        if(subcategory) {
          this.subcategoryListener(event, group);
        }
      }
    }
  }

  subcategoryListener (event : MouseEvent, group : Group) {
    const tab = group.tab as HTMLDivElement;
    const wantedSubCategory = (event.target as HTMLElement).getAttribute("data-subcategory");
    const parentCategory = (((event.target as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement).getAttribute("data-category");
    const tabToShow = tab.querySelector(`div[data-subcategory="${wantedSubCategory}"][data-category="${parentCategory}"]`) as HTMLDivElement;
    if (tabToShow.classList.contains("is-invisible")) {
      const oldSelectedCategory = ((((event.target as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement).querySelector("a[data-selected]") as HTMLElement;
      if (oldSelectedCategory) {
        oldSelectedCategory.setAttribute("style", "");
        oldSelectedCategory.removeAttribute("data-selected");
        const tabToHide = tab.querySelector(`div[data-subcategory="${oldSelectedCategory.getAttribute("data-subcategory")}"][data-category="${((oldSelectedCategory.parentElement as HTMLElement).parentElement as HTMLElement).getAttribute("data-category")}"]`) as HTMLDivElement;
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