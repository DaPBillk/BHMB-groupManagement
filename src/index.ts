import { MessageBot, Player } from "@bhmb/bot";
import { GroupManagement } from "./GroupManagement";

interface ExtensionPermission {
  callback: (player: Player, args: string) => void;
  id: string;
  command: string;
  display: {
    category: string;
    name: string;
  };
  ignore?: {
    admin?: boolean,
    mod?: boolean,
    staff?: boolean
  }
};

MessageBot.registerExtension("dapersonmgn/groupManagement", ex => {

  const GM = new GroupManagement(ex);

  ex.exports.manager = GM;

  /**
   * Listener for when an extension is registered.
   * @param extension Name of the extension.
   */
  const handleExtensionRegister = (extension : string) => {
    const permissions = GM.permissions.getExtensionPermissions(extension);
    for (const permission of permissions) {
      permission.delete();
    }
  };

  /**
   * Listener for when an extension is deregistered.
   * @param extension Name of the extension.
   */
  const handleExtensionDeregister = (extension : string) => {
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
  };

  MessageBot.extensionRegistered.sub(handleExtensionRegister);
  MessageBot.extensionDeregistered.sub(handleExtensionDeregister);
  handleExistingExtensions();
});