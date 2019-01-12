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
          if (this.parent.type === "Group") {
              this.parent.permissionUIAllow(permission, true);
          }
          if (disabled && !this.disabled.has(permission.id)) {
              this.disabled.add(permission.id);
              if (this.parent.type === "Group") {
                  this.parent.permissionUIDisable(permission, true);
              }
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
          if (deleted && this.parent.type === "Group") {
              this.parent.permissionUIAllow(permission, false);
          }
          if (deletedDisabled && this.parent.type === "Group") {
              this.parent.permissionUIDisable(permission, false);
          }
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
          this.manager = manager;
          this.name = groupData.name;
          this.id = groupData.id;
          this.permissions = new Permissions(this, groupData.permissions);
          this.players = new Set((groupData.players || []).map(playerOrName => typeof playerOrName === "string" ? this.manager.management.extension.world.getPlayer(playerOrName) : playerOrName));
          this.managed = groupData.managed || false;
          this.tab = manager.management.ui.addGroup(this);
          this.type = "Group";
          if (this.manager.management.users) {
              for (const player of this.players) {
                  const user = this.manager.management.users.get(player);
                  user.groups.push(this);
              }
          }
      }
      /**
       * Rename this group, will return if the operation was successful.
       * @param newName New name
       */
      rename(newName) {
          return this.manager.rename(this, newName);
      }
      /**
       * Add a player to this group. Will return if the operation was successful.
       * @param playerResolvable
       */
      addPlayer(playerResolvable) {
          const p = this.manager.management.extension.world.getPlayer(typeof playerResolvable === "string" ? playerResolvable : playerResolvable.name);
          if (this.players.has(p) || this.managed) {
              return false;
          }
          else {
              this.players.add(p);
              this.save();
              return true;
          }
      }
      /**
       * Remove a player from this group. Will return if the operation was successful.
       * @param playerResolvable
       */
      removePlayer(playerResolvable) {
          const p = this.manager.management.extension.world.getPlayer(typeof playerResolvable === "string" ? playerResolvable : playerResolvable.name);
          if (!this.managed && this.players.delete(p)) {
              this.save();
              return true;
          }
          return false;
      }
      /**
       * Change the UI to mark this permission as selected/unselected.
       * @param permission
       */
      permissionUIAllow(permission, check) {
          if (this.tab) {
              const input = this.tab.querySelector(`input[data-permission="${permission.id}"]`);
              input.checked = check;
          }
      }
      /**
       * Change the UI to mark this permission as disabled/not disabled.
       * @param permission
       */
      permissionUIDisable(permission, disable) {
          if (this.tab) {
              const input = this.tab.querySelector(`input[data-permission="${permission.id}"]`);
              input.disabled = disable;
          }
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
              players: Array.from(this.players).map(player => player.name),
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
          if (!groupData.name.includes(" ") && !this.get(groupData.name)) {
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
          if (!newName.includes(" ") && group && !this.get(newName) && !group.managed) {
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
          this.listener = ({ player, message }) => this.handleMessage({ player, message });
          manager.management.extension.world.onMessage.sub(this.listener);
      }
      handleMessage({ player, message }) {
          const [command, ...argsRaw] = message.split(" ");
          const args = argsRaw.join(" ");
          const user = this.manager.management.users.get(player);
          if (this.command.toLocaleUpperCase() === command.toLocaleUpperCase().slice(1)) {
              if (user.permissions.has(this.id) || user.groups.some(group => group.permissions.has(this.id))) {
                  if (this.ignore) {
                      if (!(this.ignore.staff && player.isStaff) && !(this.ignore.admin && player.isAdmin) && !(this.ignore.mod && player.isMod) && !(this.ignore.owner && player.isOwner)) {
                          this.callback(player, args, this.manager.management.extension.bot, this.id);
                      }
                  }
                  else {
                      this.callback(player, args, this.manager.management.extension.bot, this.id);
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
              this._permissions.set(permissionData.id, new Permission(this, permissionData.extension, {
                  id: permissionData.id,
                  name: permissionData.name,
                  category: permissionData.category,
                  ignore: permissionData.ignore,
                  command: permissionData.command,
                  callback: permissionData.callback
              }));
              this.management.ui.addPermission(this._permissions.get(permissionData.id));
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
              this.management.extension.world.onMessage.unsub(permission.listener);
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
          this.type = "User";
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
      get groups() {
          const groups = Array.from(this.manager.management.groups.get().values()).filter(group => Array.from(group.players).some(player => player.name === this.name));
          if (this.player.isAdmin) {
              groups.push(this.manager.management.groups.get("Administrator"));
          }
          if (this.player.isMod) {
              groups.push(this.manager.management.groups.get("Moderator"));
          }
          groups.push(this.manager.management.groups.get("Anyone"));
          return groups;
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

  var permissionHTML = "<p class=\"control\" style=\"padding-top: 2.5%;\">\r\n  <label class=\"checkbox\">\r\n    <input type=\"checkbox\" data-permission=\"{ID}\" {ALLOWED}{DISABLED}>\r\n    {PERMISSION}\r\n  </label>\r\n</p>";

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
              if (!tab.querySelector(`p[data-category="${parentCategory}"]`)) {
                  //Parent category does not exist, we need to create it.
                  tab.querySelector(".menu").innerHTML += `<p class="menu-label is-unselectable" data-category="${parentCategory}">${parentCategory}</p><ul class="menu-list" data-category="${parentCategory}"></ul>`;
              }
              if (!tab.querySelector(`ul[data-category="${parentCategory}"] > li > a[data-subcategory="${subCategory}"]`)) {
                  //Subcategory doesn't exist, create it.
                  const listEl = tab.querySelector(`ul[data-category="${parentCategory}"]`);
                  listEl.innerHTML += `<li><a href="#" class="is-unselectable" data-subcategory="${subCategory}">${subCategory}</a></li>`;
                  listEl.querySelector(`a[data-subcategory="${subCategory}"]`).addEventListener("click", event => this.subcategoryListener(event, group));
                  tab.querySelectorAll(".box")[1].innerHTML += `<div data-subcategory="${subCategory}" data-category="${parentCategory}" class="is-invisible" style="display: none;"><div class="columns" style="padding-top: 2.5%;"><div class="column"></div><div class="column"></div><div class="column"></div></div></div>`;
              }
              //Add the permission to it's tab.
              const columns = Array.from(tab.querySelectorAll(`div[data-subcategory="${subCategory}"][data-category="${parentCategory}"] .column`));
              const col = columns.sort((colA, colB) => colA.querySelectorAll("input[data-permission]").length - colB.querySelectorAll("input[data-permission]").length)[0];
              col.innerHTML += permissionHTML
                  .replace("{ID}", permission.id)
                  .replace("{PERMISSION}", permission.name)
                  .replace("{ALLOWED}", group.permissions.has(permission) ? "checked " : "")
                  .replace("{DISABLED}", group.permissions.disabled.has(permission.id) ? "disabled" : "");
              tab.querySelector(`a[data-subcategory="${subCategory}"]`).click();
          }
      }
      addGroup(group) {
          let tab;
          if (this._ui) {
              tab = this._ui.addTab(group.name, this.namespace);
              tab.innerHTML = groupTabHTML;
              tab.querySelector(".title").innerText = group.name;
              if (group.managed) {
                  tab.querySelectorAll(".subtitle")[0].innerHTML = "";
              }
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
                      let subCategoryTab = `<div data-subcategory="${subCategory}" data-category="${parentCategory}" ${isSelected ? "" : 'class="is-invisible" style="display: none;"'}><div class="columns" style="padding-top: 2.5%;"><div class="column">${columns[0].join("")}</div><div class="column">${columns[1].join("")}</div><div class="column">${columns[2].join("")}</div></div></div>`;
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
                  else if (name.includes(" ")) {
                      this._ui.notify("Groups cannot have a space!");
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
          const parentCategory = event.target.parentElement.parentElement.getAttribute("data-category");
          const tabToShow = tab.querySelector(`div[data-subcategory="${wantedSubCategory}"][data-category="${parentCategory}"]`);
          if (tabToShow.classList.contains("is-invisible")) {
              const oldSelectedCategory = event.target.parentElement.parentElement.parentElement.querySelector("a[data-selected]");
              if (oldSelectedCategory) {
                  oldSelectedCategory.setAttribute("style", "");
                  oldSelectedCategory.removeAttribute("data-selected");
                  const tabToHide = tab.querySelector(`div[data-subcategory="${oldSelectedCategory.getAttribute("data-subcategory")}"][data-category="${oldSelectedCategory.parentElement.parentElement.getAttribute("data-category")}"]`);
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
      /**
       * Called when the extension is to be uninstalled.
       */
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

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  const EXTENSION_ID = "dapersonmgn/groupManagementBeta";
  const helpMessages = {
      "BH.HELP": "/HELP - display this message.",
      "BH.PLAYERS": "/PLAYERS - list currently active players.",
      "BH.KICK": "/KICK player_name - kicks player_name, but they will still be allowed to reconnect.",
      "BH.BAN": "/BAN player_name_or_ip - adds player_name_or_ip to the blacklist, ban's that user's device from reconnecting with a different name, and kicks anyone who is no longer authorized.",
      "BH.BAN_NO_DEVICE": "/BAN-NO-DEVICE player_name_or_ip - works the same as the ban command, but doesn't ban the player's device.",
      "BH.UNBAN": "/UNBAN player_name_or_ip - removes player_name_or_ip from the blacklist.",
      "BH.WHITELIST": "/WHITELIST player_name_or_ip - adds player_name_or_ip to the whitelist, and kicks anyone who is no longer authorized.",
      "BH.UNWHITELIST": "/UNWHITELIST player_name_or_ip - removes player_name_or_ip from the whitelist, and kicks anyone who is no longer authorized.",
      "BH.LIST_BLACKLIST": "/LIST-BLACKLIST - lists the 50 most recent players on the blacklist.",
      "BH.LIST_WHITELIST": "/LIST-WHITELIST - lists the 50 most recent players on the whitelist.",
      "BH.LIST_MODLIST": "/LIST-MODLIST - lists the 50 most recent players on the modlist.",
      "BH.LIST_ADMINLIST": "/LIST-ADMINLIST - lists the 50 most recent players on the adminlist.",
      "BH.PVPON": "/PVP-ON - enables PVP (Player vs. Player) so players can directly hurt each other.",
      "BH.PVPOFF": "/PVP-OFF - disables PVP (Player vs. Player) so players cannot directly hurt each other",
      "BH.LOADLISTS": "/LOAD-LISTS - reloads the blacklist.txt, modlist.txt and adminlist.txt files, and kicks anyone who is no longer authorized.",
      "BH.MOD": "/MOD player_name - adds player_name to the modlist, allowing them to issue some server commands via chat.",
      "BH.UNMOD": "/UNMOD player_name - removes player_name from the modlist.",
      "BH.ADMIN": "/ADMIN player_name - adds player_name to the adminlist, allowing them to issue server commands via chat.",
      "BH.UNADMIN": "/UNADMIN player_name - removes player_name from the adminlist.",
      "BH.CLEARBLACKLIST": "/CLEAR-BLACKLIST - removes all names from the blacklist.",
      "BH.CLEARWHITELIST": "/CLEAR-WHITELIST - removes all names from the whitelist.",
      "BH.CLEARMODLIST": "/CLEAR-MODLIST - removes all names from the modlist.",
      "BH.CLEARADMINLIST": "/CLEAR-ADMINLIST - removes all names from the adminlist.",
      "BH.SETPASSWORD": "/SET-PASSWORD password - sets a new password, which all players except the owner must use in order to connect.",
      "BH.REMOVEPASSWORD": "/REMOVE-PASSWORD - removes the password, so all players may connect.",
      "BH.SETPRIVACY": "/SET-PRIVACY public/searchable/private - changes the privacy setting."
  };
  const callback = (player, args, bot$$1, id) => __awaiter(undefined, void 0, void 0, function* () {
      const manager = bot$$1.getExports(EXTENSION_ID).manager;
      const user = manager.users.get(player);
      const targetPlayer = bot$$1.world.getPlayer(args);
      const overview = yield bot$$1.world.getOverview();
      let lists;
      switch (id) {
          case "BH.HELP":
              let helpMessage = "\n";
              for (const permissionID in helpMessages) {
                  if (user.permissions.has(permissionID) || user.groups.some(group => group.permissions.has(permissionID))) {
                      helpMessage += helpMessages[permissionID] + "\n";
                  }
              }
              bot$$1.world.send(helpMessage);
              break;
          case "BH.PLAYERS":
              bot$$1.world.send(overview.online.length === 0 ? "No players currently connected." : `There are ${overview.online.length} players connected:\n${overview.online.join("\n")}`);
              break;
          case "BH.KICK":
              if (!targetPlayer.isStaff) {
                  bot$$1.world.send(`/KICK ${targetPlayer.name}`);
              }
              break;
          case "BH.KICK_MOD":
              if (!targetPlayer.isAdmin && targetPlayer.isMod) {
                  bot$$1.world.send(`/KICK ${targetPlayer.name}`);
              }
              break;
          case "BH.KICK_ADMIN":
              if (targetPlayer.isAdmin) {
                  bot$$1.world.send(`/KICK ${targetPlayer.name}`);
              }
              break;
          case "BH.BAN":
              if (!targetPlayer.isStaff) {
                  bot$$1.world.send(`/BAN ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been added to the blacklist`);
              }
              break;
          case "BH.BAN_MOD":
              if (targetPlayer.isMod && !targetPlayer.isAdmin) {
                  bot$$1.world.send(`/BAN ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been added to the blacklist`);
              }
              break;
          case "BH.BAN_ADMIN":
              if (targetPlayer.isAdmin && !targetPlayer.isOwner) {
                  bot$$1.world.send(`/BAN ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been added to the blacklist`);
              }
              break;
          case "BH.BAN_NO_DEVICE":
              if (!targetPlayer.isStaff) {
                  bot$$1.world.send(`/BAN-NO-DEVICE ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been added to the blacklist`);
              }
              break;
          case "BH.BAN_NO_DEVICE_MOD":
              if (!targetPlayer.isAdmin && targetPlayer.isMod) {
                  bot$$1.world.send(`/BAN-NO-DEVICE ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been added to the blacklist`);
              }
              break;
          case "BH.BAN_NO_DEVICE_ADMIN":
              if (targetPlayer.isAdmin && !targetPlayer.isOwner) {
                  bot$$1.world.send(`/BAN-NO-DEVICE ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been added to the blacklist`);
              }
              break;
          case "BH.LIST_MODLIST":
          case "BH.LIST_ADMINLIST":
          case "BH.LIST_BLACKLIST":
          case "BH.LIST_WHITELIST":
              lists = yield bot$$1.world.getLists(true);
              const listType = id.split("_")[1].toLocaleLowerCase();
              bot$$1.world.send(`${listType[0].toLocaleUpperCase()}${listType.slice(1)}:\n${lists[listType].join(", ")}`);
              break;
          case "BH.UNBAN":
              lists = yield bot$$1.world.getLists(true);
              if (lists.blacklist.map(s => s.toLocaleUpperCase()).includes(targetPlayer.name.toLocaleUpperCase())) {
                  bot$$1.world.send(`${targetPlayer.name} was not on the blacklist.`);
              }
              else {
                  bot$$1.world.send(`/UNBAN ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been removed from the blacklist.`);
              }
              break;
          case "BH.WHITELIST":
              if (targetPlayer.isWhitelisted) {
                  bot$$1.world.send(`${targetPlayer.name} was already on the whitelist.`);
              }
              else {
                  bot$$1.world.send(`/WHITELIST ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been added to the whitelist.`);
              }
              break;
          case "BH.UNWHITELIST":
              if (targetPlayer.isWhitelisted) {
                  bot$$1.world.send(`/UNWHITELIST ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been removed from the whitelist.`);
              }
              else {
                  bot$$1.world.send(`${targetPlayer.name} was not on the whitelist.`);
              }
              break;
          case "BH.STOP":
              bot$$1.world.send("/STOP");
              break;
          case "BH.PVPON":
              if (overview.pvp) {
                  bot$$1.world.send("PVP was already enabled.");
              }
              else {
                  bot$$1.world.send("/PVP-ON");
                  bot$$1.world.send("PVP is now enabled.");
              }
              break;
          case "BH.PVPOFF":
              if (overview.pvp) {
                  bot$$1.world.send("/PVP-OFF");
                  bot$$1.world.send("PVP is now disabled.");
              }
              else {
                  bot$$1.world.send("PVP was already disabled.");
              }
              break;
          case "BH.LOADLISTS":
              bot$$1.world.send("/LOAD-LISTS");
              bot$$1.world.send("Reloaded lists.");
              break;
          case "BH.MOD":
              if (targetPlayer.isMod) {
                  bot$$1.world.send(`${targetPlayer.name} was already on the modlist`);
              }
              else {
                  bot$$1.world.send(`/MOD ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been added to the modlist`);
              }
              break;
          case "BH.UNMOD":
              if (targetPlayer.isMod) {
                  bot$$1.world.send(`/UNMOD ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been removed from the modlist`);
              }
              else {
                  bot$$1.world.send(`${targetPlayer.name} was not on the modlist`);
              }
              break;
          case "BH.ADMIN":
              if (targetPlayer.isAdmin) {
                  bot$$1.world.send(`${targetPlayer.name} was already on the adminlist`);
              }
              else {
                  bot$$1.world.send(`/ADMIN ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been added to the adminlist`);
              }
              break;
          case "BH.UNADMIN":
              if (targetPlayer.isAdmin) {
                  bot$$1.world.send(`/UNADMIN ${targetPlayer.name}`);
                  bot$$1.world.send(`${targetPlayer.name} has been removed from the adminlist`);
              }
              else {
                  bot$$1.world.send(`${targetPlayer.name} was not on the adminlist`);
              }
              break;
          case "BH.CLEARWHITELIST":
              bot$$1.world.send("/CLEAR-WHITELIST");
              bot$$1.world.send("Whitelist cleared.");
              break;
          case "BH.CLEARADMINLIST":
              bot$$1.world.send("/CLEAR-ADMINLIST");
              bot$$1.world.send("Adminlist cleared.");
              break;
          case "BH.CLEARMODLIST":
              bot$$1.world.send("/CLEAR-MODLIST");
              bot$$1.world.send("Modlist cleared.");
              break;
          case "BH.CLEARBLACKLIST":
              bot$$1.world.send("/CLEAR-BLACKLIST");
              bot$$1.world.send("Blacklist cleared.");
              break;
          case "BH.SETPRIVACY":
              const privacy = args.toLocaleLowerCase();
              if (["public", "searchable", "private"].includes(privacy)) {
                  bot$$1.world.send(`/SET-PRIVACY ${privacy}`);
                  bot$$1.world.send(`Privacy setting has changed to ${privacy}.`);
              }
              break;
          case "BH.SETPASSWORD":
              bot$$1.world.send(`/SET-PASSWORD ${args}`);
              bot$$1.world.send("Password set.");
              break;
          case "BH.REMOVEPASSWORD":
              if (overview.password) {
                  bot$$1.world.send(`/REMOVE-PASSWORD ${args}`);
                  bot$$1.world.send("Removed password.");
              }
              else {
                  bot$$1.world.send("There was already no password set.");
              }
              break;
      }
  });

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
          id: "BH.KICK_MOD",
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
          id: "BH.KICK_ADMIN",
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
          id: "BH.BAN_MOD",
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
          id: "BH.BAN_ADMIN",
          command: "BAN",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Ban any administrator"
          }
      },
      {
          callback,
          id: "BH.BAN_NO_DEVICE",
          command: "BAN-NO-DEVICE",
          ignore: {
              staff: true
          },
          display: {
              category: "Blockheads/Moderator Commands",
              name: "Ban any normal player using /ban-no-device"
          }
      },
      {
          callback,
          id: "BH.BAN_NO_DEVICE_MOD",
          command: "BAN-NO-DEVICE",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Ban any moderator using /ban-no-device"
          }
      },
      {
          callback,
          id: "BH.BAN_NO_DEVICE_ADMIN",
          command: "BAN-NO-DEVICE",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Ban any administrator using /ban-no-device"
          }
      },
      {
          callback,
          id: "BH.UNBAN",
          command: "UNBAN",
          ignore: {
              staff: true
          },
          display: {
              category: "Blockheads/Moderator Commands",
              name: "Unban any player"
          }
      },
      {
          callback,
          id: "BH.WHITELIST",
          command: "WHITELIST",
          ignore: {
              staff: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "Whitelist any player"
          }
      },
      {
          callback,
          id: "BH.UNWHITELIST",
          command: "UNWHITELIST",
          ignore: {
              staff: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "Unwhitelist any player"
          }
      },
      {
          callback,
          id: "BH.LIST_BLACKLIST",
          command: "LIST-BLACKLIST",
          ignore: {
              staff: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "List the blacklist"
          }
      },
      {
          callback,
          id: "BH.LIST_WHITELIST",
          command: "LIST-WHITELIST",
          ignore: {
              staff: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "List the whitelist"
          }
      },
      {
          callback,
          id: "BH.LIST_ADMINLIST",
          command: "LIST-ADMINLIST",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "List the adminlist"
          }
      },
      {
          callback,
          id: "BH.LIST_MODLIST",
          command: "LIST-MODLIST",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "List the modlist"
          }
      },
      {
          callback,
          id: "BH.STOP",
          command: "STOP",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Stop the server"
          }
      },
      {
          callback,
          id: "BH.PVPON",
          command: "PVP-ON",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/World Commands",
              name: "Turn PVP on"
          }
      },
      {
          callback,
          id: "BH.PVPOFF",
          command: "PVP-OFF",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/World Commands",
              name: "Turn PVP off"
          }
      },
      {
          callback,
          id: "BH.LOADLISTS",
          command: "LOAD-LISTS",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "Reload the lists"
          }
      },
      {
          callback,
          id: "BH.MOD",
          command: "MOD",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Add others to the modlist"
          }
      },
      {
          callback,
          id: "BH.UNMOD",
          command: "UNMOD",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Remove others from the modlist"
          }
      },
      {
          callback,
          id: "BH.ADMIN",
          command: "ADMIN",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Add others to the adminlist"
          }
      },
      {
          callback,
          id: "BH.UNADMIN",
          command: "UNADMIN",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/Administrator Commands",
              name: "Remove others from the adminlist"
          }
      },
      {
          callback,
          id: "BH.CLEARBLACKLIST",
          command: "CLEAR-BLACKLIST",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "Clear the blacklist"
          }
      },
      {
          callback,
          id: "BH.CLEARWHITELIST",
          command: "CLEAR-WHITELIST",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "Clear the whitelist"
          }
      },
      {
          callback,
          id: "BH.CLEARMODLIST",
          command: "CLEAR-MODLIST",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "Clear the modlist"
          }
      },
      {
          callback,
          id: "BH.CLEARADMINLIST",
          command: "CLEAR-ADMINLIST",
          ignore: {
              admin: true
          },
          display: {
              category: "Blockheads/List Commands",
              name: "Clear the adminlist"
          }
      },
      {
          callback,
          id: "BH.SETPASSWORD",
          command: "SET-PASSWORD",
          ignore: {
              owner: true
          },
          display: {
              category: "Blockheads/World Commands",
              name: "Set the world's password."
          }
      },
      {
          callback,
          id: "BH.SETPRIVACY",
          command: "SET-PRIVACY",
          ignore: {
              owner: true
          },
          display: {
              category: "Blockheads/World Commands",
              name: "Set the privacy of the world"
          }
      },
      {
          callback,
          id: "BH.REMOVEPASSWORD",
          command: "REMOVE-PASSWORD",
          ignore: {
              owner: true
          },
          display: {
              category: "Blockheads/World Commands",
              name: "Remove the world's password"
          }
      }
  ];

  const EXTENSION_ID$1 = "dapersonmgn/groupManagementBeta";
  const helpMessages$1 = {
      "GM.HELP": "/GM-HELP - displays this message",
      "GM.CHECK": "/GM-CHECK command_name player_name - checks whether or not the player has a permission.",
      "GM.USER": "/GM-USER player_name - displays all the permissions a user has, along with what groups the user is in",
      "GM.GROUP": "/GM-GROUP group_name - display information about a group",
      "GM.ADD": "/GM-ADD group_name player_name - adds a user to a group",
      "GM.REMOVE": "/GM-REMOVE group_name player_name - removes a user from a group",
      "GM.GSET": "/GM-GSET command_name value group_name - sets a group's permission to a value",
      "GM.USET": "/GM-USET command_name value player_name - sets a user's permission to a value",
      "GM.CREATE": "/GM-CREATE group_name - creates a group",
      "GM.DESTORY": "/GM-DESTROY group_name - destroys a group",
      "GM.LIST": "/GM-LIST group_name - view the last 50 players added to a group"
  };
  const callback$1 = (player, args, bot$$1, id) => {
      const manager = bot$$1.getExports(EXTENSION_ID$1).manager;
      const argsArr = args.split(" ");
      const user = manager.users.get(player);
      switch (id) {
          case "GM.HELP":
              let helpMessage = "\n";
              for (const permissionID in helpMessages$1) {
                  if (user.permissions.has(permissionID) || user.groups.some(group => group.permissions.has(permissionID))) {
                      helpMessage += helpMessages$1[permissionID] + "\n";
                  }
              }
              bot$$1.world.send(helpMessage);
              break;
          case "GM.CHECK":
              if (argsArr.length < 2) {
                  bot$$1.world.send(`You didn't specify enough arguments.\nExample: /GM-CHECK KICK PLAYER_NAME\nThis would check if PLAYER_NAME has permission to use the KICK command.`);
              }
              else {
                  const [command, ...userArgs] = argsArr;
                  const permissions = bot.MessageBot.extensions.map(extension => manager.permissions.getExtensionPermissions(extension)).reduce((pSetA, pSetB) => pSetA.concat(pSetB));
                  const commandPermissions = permissions.filter(permission => permission.command.toLocaleUpperCase() === command.toLocaleUpperCase() || (permission.command.toLocaleUpperCase() === command.slice(1).toLocaleUpperCase() && command.startsWith("/")));
                  const targetUser = manager.users.get(userArgs.join(" "));
                  if (commandPermissions.some(permission => targetUser.permissions.has(permission) || Array.from(targetUser.groups).some(group => group.permissions.has(permission)))) {
                      bot$$1.world.send(`${targetUser.name} has the ability to use the command ${command.toLocaleUpperCase()}`);
                  }
                  else {
                      bot$$1.world.send(`${targetUser.name} cannot use the command ${command.toLocaleUpperCase()}`);
                  }
              }
              break;
          case "GM.USER":
              if (argsArr.length < 1) {
                  bot$$1.world.send("You didn't specify enough arguments.\nExample: /GM-USER PLAYER_NAME\nThis would display information about a user.");
              }
              else {
                  const targetUser = manager.users.get(args);
                  bot$$1.world.send(`\n${targetUser.name}\nHas user specific permissions to use:\n${Array.from(targetUser.permissions.allowed).map(id => `/${manager.permissions.get(id).command}`).join("\n")}\nIs in the groups:\n${targetUser.groups.map(group => group.name).join("\n")}`);
              }
              break;
          case "GM.GROUP":
              if (argsArr.length < 1) {
                  bot$$1.world.send("You didn't specify enough arguments.\nExample: /GM-GROUP Anyone\nThis would display information about the Anyone group.");
              }
              else {
                  const group = manager.groups.get(args);
                  if (!group) {
                      bot$$1.world.send("This group does not exist! Group names are CaSe SeNsItIvE!");
                  }
                  else {
                      bot$$1.world.send(`${group.name}:\nPlayers: ${group.players.size}\nThis group can use the commands:\n${Array.from(group.permissions.allowed).map(id => `${manager.permissions.get(id).command}`).join(", ")}`);
                  }
              }
              break;
          case "GM.ADD":
              if (argsArr.length < 2) {
                  bot$$1.world.send("You didn't specify enough arguments.\nExample: /GM-ADD GROUP_NAME PLAYER_NAME\nThis would add PLAYER_NAME to GROUP_NAME");
              }
              else {
                  const [groupName, ...playerNameArr] = argsArr;
                  const group = manager.groups.get(groupName);
                  if (!group) {
                      bot$$1.world.send("This group does not exist! Group names are CaSe SeNsItIvE!");
                  }
                  else {
                      const hasMorePermissions = Array.from(group.permissions.allowed).filter(id => user.permissions.has(id) || user.groups.some(group => group.permissions.has(id))).length > 0;
                      if (hasMorePermissions && !player.isOwner) {
                          bot$$1.world.send("This group has more permissions than you do! You cannot give this group to others!");
                      }
                      else if (group.managed) {
                          bot$$1.world.send(`You cannot give other players the ${group.name} group! It is managed internally by the extension!`);
                      }
                      else {
                          const playerName = playerNameArr.join(" ");
                          if (group.addPlayer(playerName)) {
                              bot$$1.world.send(`Added ${playerName.toLocaleUpperCase()} to ${group.name}.`);
                          }
                          else {
                              bot$$1.world.send(`${playerName.toLocaleUpperCase()} is already in ${group.name}!`);
                          }
                      }
                  }
              }
              break;
          case "GM.REMOVE":
              if (argsArr.length < 2) {
                  bot$$1.world.send("You didn't specify enough arguments.\nExample: /GM-REMOVE GROUP_NAME PLAYER_NAME\nThis would remove PLAYER_NAME from GROUP_NAME");
              }
              else {
                  const [groupName, ...playerNameArr] = argsArr;
                  const group = manager.groups.get(groupName);
                  if (!group) {
                      bot$$1.world.send("This group does not exist! Group names are CaSe SeNsItIvE!");
                  }
                  else {
                      const hasMorePermissions = Array.from(group.permissions.allowed).filter(id => user.permissions.has(id) || user.groups.some(group => group.permissions.has(id))).length > 0;
                      if (hasMorePermissions && !player.isOwner) {
                          bot$$1.world.send("This group has more permissions than you do! You cannot remove this group from others!");
                      }
                      else if (group.managed) {
                          bot$$1.world.send(`You cannot remove ${group.name} from other players! It is managed internally by the extension!`);
                      }
                      else {
                          const playerName = playerNameArr.join(" ");
                          if (group.removePlayer(playerName)) {
                              bot$$1.world.send(`Removed ${playerName.toLocaleUpperCase()} from ${group.name}.`);
                          }
                          else {
                              bot$$1.world.send(`${playerName.toLocaleUpperCase()} was already not in ${group.name}!`);
                          }
                      }
                  }
              }
              break;
          case "GM.GSET":
              if (argsArr.length < 3) {
                  bot$$1.world.send("You didn't specify enough arguments.\nExample: /GM-GSET COMMAND_NAME 1 GROUP_NAME\nThis would set any permission that can be activated by /COMMAND_NAME to true of the group GROUP_NAME. Alternatively if you wish to disable a permission, replace 1 with 0.");
              }
              else {
                  const [command, value, ...groupNameArr] = argsArr;
                  const groupName = groupNameArr.join(" ");
                  const group = manager.groups.get(groupName);
                  if (!group) {
                      bot$$1.world.send("This group does not exist! Group names are CaSe SeNsItIvE!");
                  }
                  else {
                      if (!["1", "0"].includes(value)) {
                          bot$$1.world.send("The value MUST be either 1 or 0.");
                      }
                      else {
                          const permissions = bot.MessageBot.extensions.map(extension => manager.permissions.getExtensionPermissions(extension)).reduce((pSetA, pSetB) => pSetA.concat(pSetB));
                          const commandPermissions = permissions.filter(permission => permission.command.toLocaleUpperCase() === command.toLocaleUpperCase() || (permission.command.toLocaleUpperCase() === command.slice(1).toLocaleUpperCase() && command.startsWith("/")));
                          if (commandPermissions.length === 0) {
                              bot$$1.world.send(`There is no registered command by the name of ${command.startsWith("/") ? command.toLocaleUpperCase() : `/${command.toLocaleUpperCase()}`}`);
                          }
                          else {
                              if (value === "1") {
                                  for (const permission of commandPermissions)
                                      group.permissions.add(permission);
                                  bot$$1.world.send(`\n${command.startsWith("/") ? command.toLocaleUpperCase() : `/${command.toLocaleUpperCase()}`} is now enabled for the group ${group.name}.`);
                              }
                              else {
                                  for (const permission of commandPermissions)
                                      group.permissions.delete(permission);
                                  bot$$1.world.send(`\n${command.startsWith("/") ? command.toLocaleUpperCase() : `/${command.toLocaleUpperCase()}`} is now disabled for the group ${group.name}.`);
                              }
                          }
                      }
                  }
              }
              break;
          case "GM.USET":
              break;
          case "GM.CREATE":
              break;
          case "GM.DESTROY":
              break;
          case "GM.LIST":
              break;
      }
  };

  const GroupManagementPermissions = [
      {
          callback: callback$1,
          id: "GM.HELP",
          command: "GM-HELP",
          display: {
              category: "Group Management/General Commands",
              name: "View the /GM-help message"
          },
      },
      {
          callback: callback$1,
          id: "GM.CHECK",
          command: "GM-CHECK",
          display: {
              category: "Group Management/General Commands",
              name: "Check if a player has permission to use a command with /GM-check"
          }
      },
      {
          callback: callback$1,
          id: "GM.USER",
          command: "GM-USER",
          display: {
              category: "Group Management/General Commands",
              name: "View all the groups/user specific permissions a user has with /GM-user"
          }
      },
      {
          callback: callback$1,
          id: "GM.GROUP",
          command: "GM-GROUP",
          display: {
              category: "Group Management/Group Commands",
              name: "View information about a group with /GM-group"
          }
      },
      {
          callback: callback$1,
          id: "GM.ADD",
          command: "GM-ADD",
          display: {
              category: "Group Management/Group Commands",
              name: "Add others to a group with /GM-add"
          }
      },
      {
          callback: callback$1,
          id: "GM.REMOVE",
          command: "GM-REMOVE",
          display: {
              category: "Group Management/Group Commands",
              name: "Remove others from a group with /GM-remove"
          }
      },
      {
          callback: callback$1,
          id: "GM.GSET",
          command: "GM-GSET",
          display: {
              category: "Group Management/Permission Commands",
              name: "Set a permission of a group with /GM-gset"
          }
      },
      {
          callback: callback$1,
          id: "GM.USET",
          command: "GM-USET",
          display: {
              category: "Group Management/Permission Commands",
              name: "Set a permission of a user with /GM-uset"
          }
      },
      {
          callback: callback$1,
          id: "GM.CREATE",
          command: "GM-CREATE",
          display: {
              category: "Group Management/Group Commands",
              name: "Create a group with /GM-create"
          }
      },
      {
          callback: callback$1,
          id: "GM.DESTORY",
          command: "GM-DESTORY",
          display: {
              category: "Group Management/Group Commands",
              name: "Destroy a group with /GM-destory"
          }
      },
      {
          callback: callback$1,
          id: "GM.LIST",
          command: "GM-LIST",
          display: {
              category: "Group Management/Group Commands",
              name: "View a grouplist with /GM-list"
          }
      }
  ];

  const EXTENSION_ID$2 = "dapersonmgn/groupManagementBeta";
  bot.MessageBot.registerExtension(EXTENSION_ID$2, ex => {
      const GM = new GroupManagement(ex);
      for (const permission of BlockheadPermissions) {
          const { id, command, callback, ignore } = permission;
          GM.permissions.add({
              id,
              command,
              callback,
              ignore,
              extension: EXTENSION_ID$2,
              category: permission.display.category,
              name: permission.display.name
          });
      }
      for (const permission of GroupManagementPermissions) {
          const { id, command, callback, ignore } = permission;
          GM.permissions.add({
              id,
              command,
              callback,
              ignore,
              extension: EXTENSION_ID$2,
              category: permission.display.category,
              name: permission.display.name
          });
      }
      if (!GM.groups.get("Administrator")) {
          GM.groups.add({
              name: "Administrator",
              permissions: {
                  allowed: ["BH.HELP", "BH.PLAYERS", "BH.KICK_MOD", "BH.KICK_ADMIN", "BH.KICK", "BH.BAN_MOD", "BH.BAN_ADMIN", "BH.BAN", "BH.BAN_NO_DEVICE_MOD", "BH.BAN_NO_DEVICE_ADMIN", "BH.BAN_NO_DEVICE", "BH.UNBAN", "BH.WHITELIST", "BH.UNWHITELIST", "BH.LIST_MODLIST", "BH.LIST_BLACKLIST", "BH.LIST_WHITELIST", "BH.LIST_ADMINLIST", "BH.LOADLISTS", "BH.STOP", "BH.PVPON", "BH.PVPOFF", "BH.MOD", "BH.UNMOD", "BH.ADMIN", "BH.UNADMIN", "BH.CLEARMODLIST", "BH.CLEARADMINLIST", "BH.CLEARWHITELIST", "BH.CLEARBLACKLIST"],
                  disabled: ["BH.HELP", "BH.PLAYERS", "BH.KICK_MOD", "BH.KICK_ADMIN", "BH.KICK", "BH.BAN_MOD", "BH.BAN_ADMIN", "BH.BAN", "BH.BAN_NO_DEVICE_MOD", "BH.BAN_NO_DEVICE_ADMIN", "BH.BAN_NO_DEVICE", "BH.UNBAN", "BH.WHITELIST", "BH.UNWHITELIST", "BH.LIST_MODLIST", "BH.LIST_BLACKLIST", "BH.LIST_WHITELIST", "BH.LIST_ADMINLIST", "BH.LOADLISTS", "BH.STOP", "BH.PVPON", "BH.PVPOFF", "BH.MOD", "BH.UNMOD", "BH.ADMIN", "BH.UNADMIN", "BH.CLEARMODLIST", "BH.CLEARADMINLIST", "BH.CLEARWHITELIST", "BH.CLEARBLACKLIST"]
              },
              managed: true
          });
      }
      if (!GM.groups.get("Moderator")) {
          GM.groups.add({
              name: "Moderator",
              permissions: {
                  allowed: ["BH.HELP", "BH.PLAYERS", "BH.KICK", "BH.BAN", "BH.BAN_NO_DEVICE", "BH.UNBAN", "BH.WHITELIST", "BH.UNWHITELIST", "BH.LIST_BLACKLIST", "BH.LIST_WHITELIST"],
                  disabled: ["BH.HELP", "BH.PLAYERS", "BH.KICK", "BH.BAN", "BH.BAN_NO_DEVICE", "BH.UNBAN", "BH.WHITELIST", "BH.UNWHITELIST", "BH.LIST_BLACKLIST", "BH.LIST_WHITELIST"]
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
      ex.uninstall = () => {
          GM.uninstall();
          bot.MessageBot.extensionRegistered.unsub(handleExtensionRegister);
          bot.MessageBot.extensionDeregistered.unsub(handleExtensionDeregister);
      };
      bot.MessageBot.extensionRegistered.sub(handleExtensionRegister);
      bot.MessageBot.extensionDeregistered.sub(handleExtensionDeregister);
      handleExistingExtensions();
  });

}));
//# sourceMappingURL=bundle.js.map
