var Group = require("./Group.js");

var PermissionManagement = function(ex, PermissionSystem) {
  var _this = this;
  var ui;
  this.System = PermissionSystem;
  this.ex = ex;
  this.categories = {};

  this.commandHandler = function({player, message}) {
    if (!message.startsWith("/")) {return}
    if (message.indexOf(" ") === -1) {
      message += " ";
    }
    var command = message.substring(1,message.indexOf(" "));
    var args = message.substring(message.indexOf(" ")+1);
    _this.System.permissions.forEach(function(permission,namespace){
      if (permission.command.toLowerCase() === command.toLowerCase() && _this.System.playerHasPermission(player,permission.namespace)) {
        if (permission.ignoreStaff && player.isStaff) {return}
        if (permission.ignoreAdmin && player.isAdmin) {return}
        if (permission.ignoreMod && player.isMod) {return}
        if (permission.ignoreOwner && player.isOwner) {return}
        permission.callback(_this.ex, permission.namespace, player, args, "/"+command+" "+args);
      }
    });
  };

  this.registerPermissions = function(permissions, uiCategories={}) {

    for (var categoryID in uiCategories) {
      var categoryParent = uiCategories[categoryID].substring(0,uiCategories[categoryID].indexOf("/"));
      var category = uiCategories[categoryID].substring(uiCategories[categoryID].indexOf("/")+1);
      if (!this.categories[categoryParent.toLowerCase()]) {
        this.categories[categoryParent.toLowerCase()] = {
          name: categoryParent,
          subcategories: {}
        };
      }
      if (!this.categories[categoryParent.toLowerCase()].subcategories[category.toLowerCase()]) {
        this.categories[categoryParent.toLowerCase()].subcategories[category.toLowerCase()] = {
          name: category,
          permissions: []
        };
      }
    }

    for (var permission of permissions) {
      var categoryParent = permission.category.substring(0,permission.category.indexOf("/"));
      var category = permission.category.substring(permission.category.indexOf("/")+1);
      this.System.permissions.push(permission);
      this.categories[categoryParent.toLowerCase()].subcategories[category.toLowerCase()].permissions.push(permission);
      if (ui) { //TODO: Change this to exports?
        //ok so we set a UI variable. We're a browser thing and the UI already loaded.
        ui.addPermission(permission);
      }
    }
  };

  this.setUI = function(UI) {
    //I'll admit. This isn't the best. BUT I'M CRAVING SOLUTIONS OK??
    //TODO: Find a better way to do this.
    //IDEA: Perhaps have index.js call both registerPermissions and registerPermission in the UI? >.>
    ui = UI;
  };

  this.createGroup = function(name, permissions = [], players = [], disabledPermissions = [], unremoveable=false) {
    name = name.replace(/[^a-zA-Z]/g, "");
    if (this.System.groups[name.toLowerCase()]) {throw new Error("Group already exists.");}
    this.System.groups[name.toLowerCase()] = new Group(this.ex, name, permissions, players, disabledPermissions,unremoveable);
    ex.save();
  };

  this.destroyGroup = function(name) {
    name = name.replace(/[^a-zA-Z]/g, "");
    if (this.System.groups[name.toLowerCase()].unremoveable) {
      //then we should not remove the group.
      throw new Error("Group is unremoveable.");
    } else {
      delete this.System.groups[name.toLowerCase()];
      ex.save();
    }
  };

};

module.exports = PermissionManagement;
