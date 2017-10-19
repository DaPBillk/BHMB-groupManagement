var Group = function(ex, name, permissions, players, disabledPermissions ,unremoveable) {
  this.id = name.toLowerCase();
  this.name = name;
  this.permissions = permissions || [];
  this.players = players || [];
  this.disabledPermissions = disabledPermissions || [];
  this.unremoveable = unremoveable;


  //TODO: Documentation.
  this.setPermission = function(permission, value, disabled) {
    if (value) {
      if (this.permissions.indexOf(permission.toLowerCase()) > -1) {
        throw new Error("Permission is already set to true.");
      }
      this.permissions.push(permission.toLowerCase());
    } else {
      if (this.permissions.indexOf(permission.toLowerCase()) > -1) {
        this.permissions.splice(this.permissions.indexOf(permission.toLowerCase()), 1);
        if (disabled) {
          this.disabledPermissions.push(permission.toLowerCase());
        }
      } else {
        throw new Error("Permission is already set to false.");
      }
    }
    if (ex.doSaving) {ex.save();}
  };

  //TODO: Documentation.
  this.hasPermission = function(permission) {
    return this.permissions.indexOf(permission.toLowerCase()) > -1;
  };

  //TODO: Documentation.
  this.addPlayer = function(player) {
    if (this.players.indexOf(player.name) > -1) {
      throw new Error("User is already in group.");
    } else {
      this.players.push(player.name);
    }
    if (ex.doSaving) {ex.save();}
  };

  //TODO: Documentation.
  this.removePlayer = function(player) {
    if (this.players.indexOf(player.name) > -1) {
      this.players.splice(this.players.indexOf(player.name),1);
    } else {
      throw new Error("User isn't in that group.");
    }
    if (ex.doSaving) {ex.save();}
  };

};

module.exports = Group;
