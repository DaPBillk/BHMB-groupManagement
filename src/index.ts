import { MessageBot, Player } from "@bhmb/bot";
import { GroupManagement } from "./GroupManagement";
import { BlockheadPermissions } from "./Extensions/Blockheads";
import { GroupManagementPermissions } from "./Extensions/GroupManagement";

export interface ExtensionPermission {
  callback: (player: Player, args: string, bot : MessageBot, id: string) => void;
  id: string;
  command: string;
  display: {
    category: string;
    name: string;
  };
  ignore?: {
    admin?: boolean,
    mod?: boolean,
    staff?: boolean,
    owner?: boolean
  }
};

const EXTENSION_ID = "dapersonmgn/groupManagement";

MessageBot.registerExtension(EXTENSION_ID, ex => {
  const GM = new GroupManagement(ex);
  
  for (const permission of BlockheadPermissions) {
    const {id, command, callback, ignore} = permission;
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

  for (const permission of GroupManagementPermissions) {
    const {id, command, callback, ignore} = permission;
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
  const handleExtensionRegister = (extension : string) => {
    const extensionExports = ex.bot.getExports(extension);
    if (extensionExports && extensionExports.groupManagement) {

      const permissions : ExtensionPermission[] = extensionExports.groupManagement;
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
  const handleExtensionDeregister = (extension : string) => {
    const permissions = GM.permissions.getExtensionPermissions(extension);
    for (const permission of permissions) {
      permission.delete();
    }
  };

  /**
   * Loads all extensions that were loaded before this extension.
   */
  const handleExistingExtensions = () => {
    const extensions = MessageBot.extensions;
    for (const extension of extensions) {
      handleExtensionRegister(extension);
    }
  };

  ex.remove = () => {
    MessageBot.extensionRegistered.unsub(handleExtensionRegister);
    MessageBot.extensionDeregistered.unsub(handleExtensionDeregister);
    GM.ui.uninstall();
  };

  ex.uninstall = () => {
    GM.uninstall();
    MessageBot.extensionRegistered.unsub(handleExtensionRegister);
    MessageBot.extensionDeregistered.unsub(handleExtensionDeregister);
  };

  MessageBot.extensionRegistered.sub(handleExtensionRegister);
  MessageBot.extensionDeregistered.sub(handleExtensionDeregister);
  handleExistingExtensions();
});