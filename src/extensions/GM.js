var permissionHandler = require("./GMhandler.js");
module.exports = [
  {
    namespace: "GM.HELP",
    command: "GM-HELP",
    displayName: "View the /GM-help message",
    category: "Group Management/General Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.CHECK",
    command: "GM-CHECK",
    displayName: "Check if a player has a permission",
    category: "Group Management/General Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.USER",
    command: "GM-USER",
    displayName: "View all the permissions/groups of a player",
    category: "Group Management/General Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.GROUP",
    command: "GM-GROUP",
    displayName: "View all the permissions of a group",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.ADD",
    command: "GM-ADD",
    displayName: "Add others to a group",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.REMOVE",
    command: "GM-REMOVE",
    displayName: "Removes others from a group",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.GSET",
    command: "GM-GSET",
    displayName: "Set permissions for groups",
    category: "Group Management/Permission Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.USET",
    command: "GM-USET",
    displayName: "Set permissions for users",
    category: "Group Management/Permission Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.CREATE",
    command: "GM-CREATE",
    displayName: "Create groups",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.DESTORY",
    command: "GM-DESTROY",
    displayName: "Destroy groups",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
  {
    namespace: "GM.LIST",
    command: "GM-LIST",
    displayName: "View a grouplist",
    category: "Group Management/Group Commands",
    callback: permissionHandler
  },
];
