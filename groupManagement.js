/*
  DaPgroupManagement - V2 :o Whoa! It's like... The next version!!!!1!!!1! >_> Don't judge my comments.
  Inspired by PermissionsEX. A minecraft bukkit extension. Also from TBH suggestions. :P
*/

{
  name: "USER",
  permissions: ["BH.BAN_MOD","BH.BAN_ADMIN","BH.BAN_PLAYER"]
}
MessageBot.registerExtension("DaPgroupManagement",function(ex,world){
  var groups = {
    administrator: {
      displayName: "Administrator",
      permissions: [],
      disabledPermissions: [], //disabled permissions. You can't change these.
      members: [],
      order: 0 //for now this feature is disabled. :c Will support later on.
    },
    moderator: {
      displayName: "Moderator",
      permissions: [],
      disabledPermissions: [],
      members: [],
      order: 0
    },
    anyone: {
      displayName: "Anyone",
      permissions: [],
      disabledPermissions: [],
      members: [],
      order: 0
    }
  }; /*All groups along with their permissions.*/
  var userPermissions = {
    /*
      Purely for example.
      "DAPERSON": ["BH.BAN","BH.BAN_ADMIN","BH.BAN_MOD"]
    */
  };
  /*Hey DaP. Remember how you said on July 27th at 8:54PM in the Blockheads Devs Server "GOSH DANG IT I NEED ANOTHER PROPERTY"? You know what you need DaP? You know what you need? A display name property. ;)*/
  var permissions = [
    {
      name: "BH.HELP",
      cmd: "HELP",
      ignoreStaff: true,
      handler: permissionHandler

    },
    {
      name: "BH.PLAYERS",
      cmd: "PLAYERS",
      ignoreStaff: true,
      handler: permissionHandler
    },
    {
      name: "BH.KICK_MOD",
      cmd: "KICK",
      ignoreStaff: true,
      handler: permissionHandler
    },
    {
      name: "BH.KICK_MOD",
      cmd: "KICK",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.KICK_ADMIN",
      cmd: "KICK",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.BAN",
      cmd: "BAN",
      ignoreStaff: true,
      handler: permissionHandler
    },
    {
      name: "BH.BAN_MOD",
      cmd: "BAN",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.BAN_ADMIN",
      cmd: "BAN",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.BAN_NO_DEVICE",
      cmd: "BAN-NO-DEVICE",
      ignoreStaff:true,
      handler: permissionHandler
    },
    {
      name: "BH.BAN_NO_DEVICE_MOD",
      cmd: "BAN-NO-DEVICE",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.BAN_NO_DEVICE_ADMIN",
      cmd: "BAN-NO-DEVICE",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.UNBAN",
      cmd: "UNBAN",
      ignoreStaff: true,
      handler: permissionHandler
    },
    {
      name: "BH.WHITELIST",
      cmd: "WHITELIST",
      ignoreStaff: true,
      handler: permissionHandler
    },
    {
      name: "BH.UNWHITELIST",
      cmd: "UNWHITELIST",
      ignoreStaff: true,
      handler: permissionHandler
    },
    {
      name: "BH.LIST_BLACKLIST",
      cmd: "LIST-BLACKLIST",
      ignoreStaff: true,
      handler: permissionHandler
    },
    {
      name: "BH.LIST_WHITELIST",
      cmd: "LIST-WHITELIST",
      ignoreStaff: true,
      handler: permissionHandler
    },
    {
      name: "BH.LIST_MODLIST",
      cmd: "LIST-MODLIST",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.LIST_ADMINLIST",
      cmd: "LIST-ADMINLIST",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.STOP",
      cmd: "STOP",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.PVPON",
      cmd: "PVP-ON",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.PVPOFF",
      cmd: "PVP-OFF",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.LOADLISTS",
      cmd: "LOAD-LISTS",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.MOD",
      cmd: "MOD",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.UNMOD",
      cmd: "UNMOD",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.ADMIN",
      cmd: "ADMIN",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.UNADMIN",
      cmd: "UNADMIN",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.CLEARBLACKLIST",
      cmd: "CLEAR-BLACKLIST",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.CLEARWHITELIST",
      cmd: "CLEAR-WHITELIST",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.CLEARMODLIST",
      cmd: "CLEAR-MODLIST",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.CLEARADMINLIST",
      cmd: "CLEAR-ADMINLIST",
      ignoreAdmin: true,
      handler: permissionHandler
    },
    {
      name: "BH.SETPASSWORD",
      cmd: "SET-PASSWORD",
      handler: permissionHandler
    },
    {
      name: "BH.SETPRIVACY",
      cmd: "SET-PRIVACY",
      handler: permissionHandler
    },
    {
      name: "BH.REMOVEPASSWORD",
      cmd: "REMOVE-PASSWORD",
      handler: permissionHandler
    },
    {
      name: "BH.PRIVACY",
      cmd: "SET-PRIVACY",
      handler: permissionHandler
    }
  ]; /*Permission names, cmd usage, & cmd handler. If ignoreMod || ignoreAdmin || ignoreStaff is present then the respected group will not have the cmd handler called.*/

  /*Permissions.*/


  /**
    * Returns whether or not a user has the specified permission.
    * @param {string} username - Username to check permissions of.
    * @param {string} permission - Permission to check for.
    * @returns {boolean} - Whether the user has permission or not.
  */
  function hasPermission(username, permission) {

  };

  /**
    * Sets a permission for the specified user.
    * @param {string} username - Username to set permission for.
    * @param {string} permission - Permission to set.
    * @param {boolean} value - Value for the permission.
    * @returns {undefined}
  */
  function setUserPermission(username, permission, value) {

  };

  /**
    * Sets a permission for the specified group.
    * @param {string} groupName - The group to set permissions for.
    * @param {string} permission - Permission to set.
    * @param {boolean} value - Value for the permission.
    * @returns {undefined}
  */
  function setGroupPermission(groupName, permission, value) {

  };


  /*Group Functions.*/


  /**
    * Returns the specified group.
    * @param {string} groupName - The group to return.
    * @returns {object} - The group requested.
  */
  function getGroup(groupName) {

  };

  /**
    * Creates a group.
    * @param {string} groupName - The name of the group to create.
    * @param {Array} permissions - Permissions
    * @returns {object} - The group created.
  */
  function createGroup(groupName, permissions) {

  };

  /**
    * Deletes a group.
    * @param {string} groupName - The name of the group to delete.
    * @returns {undefined}
  */
  function deleteGroup(groupName) {

  };


  /*User functions.*/


  /**
    * Returns all permission groups a user is in.
    * @param {string} username - Username to get groups from.
    * @returns {Array} - Contains groups.
  */
  function getGroups(username) {

  };

  /**
    * Searchs for players that meet the criteria.
    * @param {object} criteria - Data to match players against.
    * @returns {Array} - Contains user objects.
  */
  function searchForPlayers(criteria) {

  };



  /*Handlers.*/

  /**
    * Permission Handler Thingy. I'm great at descriptions. You can tell right? Because I sure can't.
    * @param {string} permission - Name for the permission. ex. BH.HELP.
    * @param {string} args - Message excluding the command.
    * @param {string} raw - The raw message. Unchanged and without all that fancy stuff. *sniff* How dare you reject my args argument. :( Do you know how much work I put into that? Over 1 second! DO YOU KNOW WHAT I COULD'VE DONE WITH THAT SECOND? I COULD'VE BLINKED TWICE. TWICE!!!! >:c
  */
  function permissionHandler(permission,args,raw) {

  };

  /**
    * Chat Msg Handler.
  */

});
