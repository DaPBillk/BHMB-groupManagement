var PermissionSystem = function(ex) {
  this.permissions = []; //Stores all the permissions.
  this.groups = {};
  this.playerPermissions = {};

  /**
    * Whether or not a permission exists.
    * @param {string} permission - Permission to look for.
    * @returns {boolean} - Whether or not the permission exists.
  */
  this.permissionExists = function(permission) {
    for (var perm of this.permissions) {
      if (perm.namespace.toLowerCase() === permission.toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  /**
    * Returns whether or not a user has the specified permission.
    * @param {Player} player - Player.
    * @param {string} permission - Permission to check for.
    * @returns {boolean} - Whether the user has permission or not.
  */
  this.playerHasPermission = function(player, permission){
    for (var groupID in this.groups) {
      var permissions = this.groups[groupID].permissions;
      var name = groupID;
      if (permissions.indexOf(permission.toLowerCase()) > -1) { return true; }
    }
    if (player.isOwner) {return true;}
    return !!this.hasPlayerPermission(player, permission);
  };

  /**
    * Sets a permission for the specified user.
    * @param {Player} player - Player.
    * @param {string} permission - Permission to set.
    * @param {boolean} value - Value for the permission.
  */
  this.setPlayerPermission = function(player, permission, value = true) {
    var GMPlayerPermissions = this.playerPermissions[player.name];
    if (!GMPlayerPermissions) {
      this.playerPermissions[player.name] = [];
      GMPlayerPermissions = this.playerPermissions[player.name];
    }
    if (value) {
      if (GMPlayerPermissions.indexOf(permission.toLowerCase()) > -1) {return}
      GMPlayerPermissions.push(permission.toLowerCase());
    } else if (GMPlayerPermissions.indexOf(permission.toLowerCase()) > -1) {
      GMPlayerPermissions.splice(GMPlayerPermissions.indexOf(permission.toLowerCase()),1);
    }
    if (ex.doSaving) {ex.save();}
  };

  //TODO: Documentation.
  this.hasPlayerPermission = function(player, permission) {
    if (!this.permissionExists(permission)) {throw new Error("Permission doesn't exist.");}
    if (!this.playerPermissions[player.name]) {return false}
    return this.playerPermissions[player.name].indexOf(permission.toLowerCase()) > -1;
  };

};

module.exports = PermissionSystem;
