(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@bhmb/bot')) :
  typeof define === 'function' && define.amd ? define(['@bhmb/bot'], factory) :
  (global = global || self, factory(global['@bhmb/bot']));
}(this, function (bot) { 'use strict';

  class Permissions {
      constructor(parent, permissions) {
          const data = permissions || {
              allowed: [],
              disabled: []
          };
          this.parent = parent;
          this.allowed = new Set(data.allowed);
          this.disabled = new Set(data.disabled);
      }
      has(permissionResolvable) {
          const permission = this.resolvePermission(permissionResolvable);
          if (!permission)
              return false;
          return this.allowed.has(permission.id);
      }
      add(permissionResolvable, sudo = false, disabled = false) {
          const permission = this.resolvePermission(permissionResolvable);
          if (!permission || (this.allowed.has(permission.id) && !disabled && !this.disabled.has(permission.id)) || (this.disabled.has(permission.id) && !sudo))
              return false;
          this.allowed.add(permission.id);
          if (disabled && !this.disabled.has(permission.id)) {
              this.disabled.add(permission.id);
          }
          this.save();
          return true;
      }
      delete(permissionResolvable, sudo = false, disabled = false) {
          const permission = this.resolvePermission(permissionResolvable);
          if (!permission || (!sudo && this.disabled.has(permission.id)))
              return false;
          const deleted = this.allowed.delete(permission.id);
          const deletedDisabled = disabled ? this.disabled.delete(permission.id) : false;
          this.save();
          return deleted || deletedDisabled;
      }
      save() {
          return this.parent.save();
      }
      resolvePermission(permissionResolvable) {
          return this.parent.manager.management.permissions.get(permissionResolvable);
      }
      get data() {
          return {
              allowed: Array.from(this.allowed),
              disabled: Array.from(this.disabled)
          };
      }
  }

  class Group {
      constructor(groupData, manager) {
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
      rename(newName) {
          return this.manager.rename(this, newName);
      }
      /**
       * Delete this group, will return if the operation was successful.
       */
      delete() {
          return this.manager.delete(this);
      }
      save() {
          return this.manager.save();
      }
      /**
       * Get data about the group that can be saved in storage.
       */
      get data() {
          return {
              id: this.id,
              name: this.name,
              permissions: this.permissions.data,
              players: this.players.map(player => player.name),
              managed: this.managed
          };
      }
  }

  const SAVE_KEY = "groups";
  class GroupManager {
      constructor(management) {
          this.management = management;
          this._groups = new Map(this.management.extension.storage.get(SAVE_KEY, []).map((groupData) => [groupData.id, new Group(groupData, this)]));
      }
      /**
       * Adds a group.
       * @param groupData Data about the group to be added.
       */
      add(groupData) {
          if (!this.get(groupData.name)) {
              const id = this.nextID;
              const group = new Group(Object.assign({ id }, groupData), this);
              this._groups.set(id, group);
              this.save();
              return group;
          }
      }
      /**
       * Delete a group, will return if the operation was successful.
       * @param groupResolvable Some identifier that can resolve to the group being deleted.
       */
      delete(groupResolvable) {
          const group = this.resolveGroup(groupResolvable);
          if (!group || group.managed)
              return false;
          this._groups.delete(group.id);
          this.save();
          this.management.ui.deleteGroup(group);
          return true;
      }
      /**
       * Retrieve a group.
       * @param groupNameOrID Either the group's name or id.
       */
      get(groupNameOrID) {
          if (groupNameOrID) {
              if (typeof groupNameOrID === "string") {
                  for (const [, group] of this._groups) {
                      if (group.name === groupNameOrID) {
                          return group;
                      }
                  }
              }
              else {
                  return this._groups.get(groupNameOrID);
              }
          }
          else {
              return this._groups;
          }
      }
      /**
       * Rename a group to another name. Will return if the operation was successful.
       * @param groupResolvable Some identifier that can resolve to become the group to be renamed.
       * @param newName New name of the group.
       */
      rename(groupResolvable, newName) {
          const group = this.resolveGroup(groupResolvable);
          if (group && !this.get(newName) && !group.managed) {
              group.name = newName;
              this.save();
              this.management.ui.refreshGroup(group);
              return true;
          }
          return false;
      }
      /**
       * Resolve a group.
       * @param groupResolvable The to be resolved.
       */
      resolveGroup(groupResolvable) {
          let group;
          if (typeof groupResolvable === "string") {
              group = this.get(groupResolvable);
          }
          else if (typeof groupResolvable === "number") {
              group = this._groups.get(groupResolvable);
          }
          else {
              group = groupResolvable;
          }
          return group;
      }
      /**
       * Save the group data to storage.
       */
      save() {
          let saveData = [];
          for (const [, group] of this._groups) {
              saveData.push(group.data);
          }
          this.management.extension.storage.set(SAVE_KEY, saveData);
      }
      /**
       * Get the next group ID.
       */
      get nextID() {
          let latestID = 0;
          for (const [id] of this._groups) {
              if (id > latestID) {
                  latestID = id;
              }
          }
          return latestID + 1;
      }
  }

  class Permission {
      constructor(manager, extension, data) {
          const { id, name, category, ignore, callback, command } = data;
          this.extension = extension;
          this.id = id;
          this.name = name;
          this.category = category;
          this.ignore = ignore;
          this.callback = callback;
          this.command = command;
          this.manager = manager;
          manager.management.extension.world.onMessage.sub(this.handleMessage);
      }
      handleMessage({ player, message }) {
          const [command, ...argsRaw] = message.split(" ");
          const args = argsRaw.join(" ");
          const user = this.manager.management.users.get(player);
          if (this.command.toLocaleUpperCase() === command.toLocaleUpperCase().slice(1)) {
              if (user.permissions.has(this.id)) {
                  if (this.ignore) {
                      if (!(this.ignore.staff && player.isStaff) && !(this.ignore.admin && player.isAdmin) && !(this.ignore.mod && player.isMod)) {
                          this.callback(player, args);
                      }
                  }
                  else {
                      this.callback(player, args);
                  }
              }
          }
      }
      /**
       * Delete this permission.
       */
      delete() {
          return this.manager.delete(this);
      }
  }

  class PermissionManager {
      constructor(management) {
          this.management = management;
          this._permissions = new Map();
      }
      /**
       * Add a permission, will return if the operation was successful.
       */
      add(permissionData) {
          if (!this.get(permissionData.id)) {
              const permission = new Permission(this, permissionData.extension, {
                  id: permissionData.id,
                  name: permissionData.name,
                  category: permissionData.category,
                  ignore: permissionData.ignore,
                  command: permissionData.command,
                  callback: permissionData.callback
              });
              this._permissions.set(permission.id, permission);
              this.management.ui.addPermission(permission);
              return true;
          }
          return false;
      }
      /**
       * Delete a permission, will return in the operation was successful.
       */
      delete(permissionResolvable) {
          const id = this.resolvePermissionID(permissionResolvable);
          const permission = this._permissions.get(id);
          const deleted = this._permissions.delete(id);
          if (deleted) {
              this.management.extension.world.onMessage.unsub(permission.handleMessage);
          }
          return deleted;
      }
      /**
       * Get all permissions that belong to an extension.
       * @param extension Extension
       */
      getExtensionPermissions(extension) {
          const extensionPermissions = [];
          const e = extension.toLocaleLowerCase();
          for (const [, permission] of this._permissions) {
              if (permission.extension.toLocaleLowerCase() === e) {
                  extensionPermissions.push(permission);
              }
          }
          return extensionPermissions;
      }
      /**
       * Get a permission.
       */
      get(permissionResolvable) {
          const id = this.resolvePermissionID(permissionResolvable);
          return this._permissions.get(id);
      }
      uninstall() {
          for (const [, permission] of this._permissions) {
              this.delete(permission);
          }
      }
      resolvePermissionID(permissionResolvable) {
          return typeof permissionResolvable === "string" ? permissionResolvable : permissionResolvable.id;
      }
  }

  class User {
      constructor(userData, manager) {
          this.manager = manager;
          if (typeof userData.player === "string") {
              this.player = this.manager.management.extension.world.getPlayer(userData.player);
          }
          else {
              this.player = userData.player;
          }
          this.permissions = new Permissions(this, userData.permissions);
      }
      /**
       * Delete this user's permissions.
       */
      delete() {
          return this.manager.delete(this);
      }
      /**
       * Save
       */
      save() {
          return this.manager.save();
      }
      /**
       * Get the name of the user.
       */
      get name() {
          return this.player.name;
      }
      /**
       * Get a JSON object that can be saved to storage
       */
      get data() {
          return {
              player: this.name,
              permissions: this.permissions.data
          };
      }
  }

  const SAVE_KEY$1 = "users";
  class UserManager {
      constructor(management) {
          this.management = management;
          this._users = new Map(this.management.extension.storage.get(SAVE_KEY$1, []).map((data) => [data.player, new User(data, this)]));
      }
      get(playerResolvable) {
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
      delete(playerResolvable) {
          const user = this.resolvePlayer(playerResolvable);
          if (!user)
              return false;
          const deleted = this._users.delete(user.name);
          //TODO: Remove from UI.
          this.save();
          return deleted;
      }
      save() {
          let saveData = [];
          for (const [, user] of this._users) {
              saveData.push(user.data);
          }
          this.management.extension.storage.set(SAVE_KEY$1, saveData);
      }
      resolvePlayer(playerResolvable) {
          return this.management.extension.world.getPlayer(typeof playerResolvable === "string" ? playerResolvable : playerResolvable.name);
      }
  }

  var groupTabHTML = "<div class=\"container\">\r\n    <div class=\"box\" style=\"min-width: 35%; max-width: 35%; float: left; margin-top: 1%;\">\r\n      <aside class=\"menu\"></aside>\r\n    </div>\r\n    <div class=\"box\" style=\"min-width: 63%; max-width: 63%; float: right; margin-top: 1%;\">\r\n      <label>\r\n        <span class=\"title\">{TITLE}</span>\r\n      </label>\r\n      <label>\r\n        <span class=\"subtitle\" style=\"padding-left: 1%;\">\r\n          <a href=\"#\" data-action=\"rename\">Rename</a> - <a href=\"#\" data-action=\"delete\">Delete</a>\r\n        </span>\r\n        <span class=\"subtitle is-pulled-right\">\r\n          <a href=\"#\" data-action=\"create\">New Group</a>\r\n        </span>\r\n      </label>\r\n    </div>\r\n  </div>\r\n  ";

  var permissionHTML = "<p class=\"control\">\r\n  <label class=\"checkbox\">\r\n    <input type=\"checkbox\" data-permission=\"{ID}\" {ALLOWED}{DISABLED}>\r\n    {PERMISSION}\r\n  </label>\r\n</p>";

  class UI {
      constructor(management) {
          this._ui = management.extension.bot.getExports("ui");
          this.management = management;
          this.namespace = "dapersonmgn/groupManagement/tab";
          if (this._ui) {
              this._ui.addTabGroup("Group Management", this.namespace);
          }
      }
      uninstall() {
          if (this._ui) {
              this._ui.removeTabGroup(this.namespace);
          }
      }
      addPermission(permission) {
          const [parentCategory, subCategory] = permission.category.split("/");
          const groups = this.management.groups.get();
          for (const [, group] of groups) {
              const tab = group.tab;
              let firstSubCategory = false;
              if (!tab.querySelector(`p[data-category="${parentCategory}"]`)) {
                  //Parent category does not exist, we need to create it.
                  tab.querySelector(".menu").innerHTML += `<p class="menu-label is-unselectable" data-category="${parentCategory}">${parentCategory}</p><ul class="menu-list" data-category="${parentCategory}"></ul>`;
              }
              if (!tab.querySelector(`ul[data-category="${parentCategory}"] > li > a[data-subcategory="${subCategory}"]`)) {
                  //Subcategory doesn't exist, create it.
                  firstSubCategory = true;
                  const listEl = tab.querySelector(`ul[data-category="${parentCategory}"]`);
                  listEl.innerHTML += `<li><a href="#" class="is-unselectable" data-subcategory="${subCategory}">${subCategory}</a></li>`;
                  listEl.querySelector(`a[data-subcategory="${subCategory}"]`).addEventListener("click", event => this.subcategoryListener(event, group));
                  tab.querySelectorAll(".box")[1].innerHTML += `<div data-subcategory="${subCategory}" class="is-invisible" style="display: none;"><div class="columns" style="padding-top: 2.5%;"><div class="column"></div><div class="column"></div><div class="column"></div></div></div>`;
              }
              //Add the permission to it's tab.
              const columns = Array.from(tab.querySelectorAll(`div[data-subcategory="${subCategory}"] .column`));
              const col = columns.sort((colA, colB) => colA.querySelectorAll("input[data-permission]").length - colB.querySelectorAll("input[data-permission]").length)[0];
              col.innerHTML += permissionHTML
                  .replace("{ID}", permission.id)
                  .replace("{PERMISSION}", permission.name)
                  .replace("{ALLOWED}", group.permissions.has(permission) ? "checked " : "")
                  .replace("{DISABLED}", group.permissions.disabled.has(permission.id) ? "disabled" : "");
              if (firstSubCategory) {
                  tab.querySelector(`a[data-subcategory="${subCategory}"]`).click();
              }
          }
      }
      addGroup(group) {
          let tab;
          if (this._ui) {
              tab = this._ui.addTab(group.name, this.namespace);
              tab.innerHTML = groupTabHTML.replace("{TITLE}", group.name);
              const permissions = bot.MessageBot.extensions.map(extension => group.manager.management.permissions.getExtensionPermissions(extension)).reduce((pSetA, pSetB) => pSetA.concat(pSetB));
              const categories = {};
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
                      }
                      else {
                          //Selected.
                          isSelected = true;
                          firstSubCategorySelected = true;
                          categoryHTML += `<li><a href="#" class="is-unselectable" style="background: #182b73; color: #ffffff;" data-subcategory="${subCategory}" data-selected>${subCategory}</a></li>`;
                      }
                      const columns = [[], [], []];
                      let colNum = 0;
                      for (const permission of permissions) {
                          if (permission.category === `${parentCategory}/${subCategory}`) {
                              if (columns.length === colNum) {
                                  colNum = 0;
                              }
                              columns[colNum].push(permissionHTML
                                  .replace("{ID}", permission.id)
                                  .replace("{PERMISSION}", permission.name)
                                  .replace("{ALLOWED}", group.permissions.has(permission) ? "checked " : "")
                                  .replace("{DISABLED}", group.permissions.disabled.has(permission.id) ? "disabled" : ""));
                              colNum++;
                          }
                      }
                      let subCategoryTab = `<div data-subcategory="${subCategory}" ${isSelected ? "" : 'class="is-invisible" style="display: none;"'}><div class="columns" style="padding-top: 2.5%;"><div class="column">${columns[0].join("")}</div><div class="column">${columns[1].join("")}</div><div class="column">${columns[2].join("")}</div></div></div>`;
                      tab.querySelectorAll(".box")[1].innerHTML += subCategoryTab;
                  }
                  categoryHTML += `</ul>`;
              }
              tab.querySelector(".menu").innerHTML = categoryHTML;
              tab.addEventListener("change", event => this.changePermissionListener(event, group));
              tab.addEventListener("click", event => this.clickListener(event, group));
          }
          // TODO: Select this tab.
          return tab;
      }
      deleteGroup(group) {
          if (group.tab) {
              this._ui.removeTab(group.tab);
          }
      }
      refreshGroup(group) {
          if (group.tab) {
              this.deleteGroup(group);
              group.tab = this.addGroup(group);
          }
      }
      changePermissionListener(event, group) {
          const target = event.target;
          const permission = target.getAttribute("data-permission");
          if (target.checked) {
              group.permissions.add(permission);
          }
          else {
              group.permissions.delete(permission);
          }
      }
      deleteGroupUI(group) {
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
                  }
                  else {
                      this._ui.toggleMenu();
                  }
              }
          });
      }
      renameGroupUI(group) {
          this._ui.prompt("What would you like to rename this group to?", newName => {
              if (newName) {
                  const result = group.rename(newName);
                  if (!result) {
                      this._ui.notify("Failed to rename group.");
                  }
                  else {
                      this._ui.toggleMenu();
                  }
              }
          });
      }
      addGroupUI() {
          this._ui.prompt("What would you like to name this new group?", name => {
              if (name) {
                  const result = this.management.groups.add({
                      name
                  });
                  if (result) {
                      this._ui.toggleMenu();
                  }
                  else {
                      this._ui.notify("This group name already exists!");
                  }
              }
          });
      }
      clickListener(event, group) {
          const element = event.target;
          if (element.tagName === "A") {
              const action = element.getAttribute("data-action");
              if (action) {
                  switch (action) {
                      case "rename":
                          this.renameGroupUI(group);
                          break;
                      case "create":
                          this.addGroupUI();
                          break;
                      case "delete":
                          this.deleteGroupUI(group);
                          break;
                  }
              }
              else {
                  const subcategory = element.getAttribute("data-subcategory");
                  if (subcategory) {
                      this.subcategoryListener(event, group);
                  }
              }
          }
      }
      subcategoryListener(event, group) {
          const tab = group.tab;
          const wantedSubCategory = event.target.getAttribute("data-subcategory");
          const tabToShow = tab.querySelector(`div[data-subcategory="${wantedSubCategory}"]`);
          if (tabToShow.classList.contains("is-invisible")) {
              const oldSelectedCategory = event.target.parentElement.parentElement.querySelector("a[data-selected]");
              if (oldSelectedCategory) {
                  oldSelectedCategory.setAttribute("style", "");
                  oldSelectedCategory.removeAttribute("data-selected");
                  const tabToHide = tab.querySelector(`div[data-subcategory="${oldSelectedCategory.getAttribute("data-subcategory")}"]`);
                  tabToHide.classList.add("is-invisible");
                  tabToHide.setAttribute("style", "display: none");
              }
              event.target.setAttribute("style", "background: #182b73; color: #ffffff;");
              event.target.setAttribute("data-selected", "");
              tabToShow.classList.remove("is-invisible");
              tabToShow.setAttribute("style", "");
          }
      }
  }

  class GroupManagement {
      constructor(ex) {
          this.extension = ex;
          this.ui = new UI(this);
          this.permissions = new PermissionManager(this);
          this.groups = new GroupManager(this);
          this.users = new UserManager(this);
      }
      uninstall() {
          this.permissions.uninstall();
          this.ui.uninstall();
      }
      /**
       * Save the groups and users.
       */
      save() {
          this.groups.save();
          this.users.save();
      }
  }

  var callback = () => {
  };

  const BlockheadPermissions = [
      {
          callback,
          id: "BH.HELP",
          command: "HELP",
          ignore: {
              staff: true
          },
          display: {
              category: "Blockheads/Moderator Commands",
              name: "View the /help message"
          },
      },
      {
          callback,
          id: "BH.PLAYERS",
          command: "PLAYERS",
          ignore: {
              staff: true
          },
          display: {
              category: "Blockheads/Moderator Commands",
              name: "View the /players message"
          }
      },
      {
          callback,
          id: "BH.KICK",
          command: "KICK",
          ignore: {
              staff: true
          },
          display: {
              category: "Blockheads/Moderator Commands",
              name: "Kick any normal player"
          }
      },
      {
          callback,
          id: "BH.KICKMOD",
          command: "KICK",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Kick any moderator"
          }
      },
      {
          callback,
          id: "BH.KICKADMIN",
          command: "KICK",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Kick any administrator"
          }
      },
      {
          callback,
          id: "BH.BAN",
          command: "BAN",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Moderator Commands",
              name: "Ban any normal player"
          }
      },
      {
          callback,
          id: "BH.BANMOD",
          command: "BAN",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Ban any moderator"
          }
      },
      {
          callback,
          id: "BH.BANADMIN",
          command: "BAN",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Ban any administrator"
          }
      }
  ];

  const EXTENSION_ID = "dapersonmgn/groupManagementBeta";
  bot.MessageBot.registerExtension(EXTENSION_ID, ex => {
      const GM = new GroupManagement(ex);
      for (const permission of BlockheadPermissions) {
          const { id, command, callback, ignore } = permission;
          GM.permissions.add({
              id,
              command,
              callback,
              ignore,
              extension: EXTENSION_ID,
              category: permission.display.category,
              name: permission.display.name
          });
      }
      if (!GM.groups.get("Administrator")) {
          GM.groups.add({
              name: "Administrator",
              permissions: {
                  allowed: [],
                  disabled: []
              },
              managed: true
          });
      }
      if (!GM.groups.get("Moderator")) {
          GM.groups.add({
              name: "Moderator",
              permissions: {
                  allowed: [],
                  disabled: []
              },
              managed: true
          });
      }
      if (!GM.groups.get("Anyone")) {
          GM.groups.add({
              name: "Anyone",
              permissions: {
                  allowed: [],
                  disabled: []
              },
              managed: true
          });
      }
      if (!GM.groups.get("Unmanaged")) {
          GM.groups.add({
              name: "Unmanaged",
              permissions: {
                  allowed: [],
                  disabled: []
              }
          });
      }
      ex.exports.manager = GM;
      /**
       * Listener for when an extension is registered.
       * @param extension Name of the extension.
       */
      const handleExtensionRegister = (extension) => {
          const extensionExports = ex.bot.getExports(extension);
          if (extensionExports && extensionExports.groupManagement) {
              const permissions = extensionExports.groupManagement;
              for (const permissionData of permissions) {
                  GM.permissions.add({
                      extension,
                      category: permissionData.display.category,
                      name: permissionData.display.name,
                      id: permissionData.id,
                      command: permissionData.command,
                      callback: permissionData.callback,
                      ignore: permissionData.ignore
                  });
              }
          }
      };
      /**
       * Listener for when an extension is deregistered.
       * @param extension Name of the extension.
       */
      const handleExtensionDeregister = (extension) => {
          const permissions = GM.permissions.getExtensionPermissions(extension);
          for (const permission of permissions) {
              permission.delete();
          }
      };
      /**
       * Loads all extensions that were loaded before this extension.
       */
      const handleExistingExtensions = () => {
          const extensions = bot.MessageBot.extensions;
          for (const extension of extensions) {
              handleExtensionRegister(extension);
          }
      };
      ex.remove = () => {
          bot.MessageBot.extensionRegistered.unsub(handleExtensionRegister);
          bot.MessageBot.extensionDeregistered.unsub(handleExtensionDeregister);
          GM.ui.uninstall();
      };
      bot.MessageBot.extensionRegistered.sub(handleExtensionRegister);
      bot.MessageBot.extensionDeregistered.sub(handleExtensionDeregister);
      handleExistingExtensions();
  });

}));
//# sourceMappingURL=bundle.js.map
