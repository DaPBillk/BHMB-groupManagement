import { Player, MessageBot } from "@bhmb/bot";
import { GroupManagement } from "../GroupManagement";
import { Permission } from "../Permissions/Permission";
import { Group } from "../Groups/Group";

const EXTENSION_ID = "dapersonmgn/groupManagementBeta";

const helpMessages : {
  [key: string] : string
} = {
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

export const callback = (player : Player, args : string, bot : MessageBot, id : string) => {
  const manager = (bot.getExports(EXTENSION_ID) as {manager: GroupManagement}).manager;
  const argsArr = args.split(" ");
  const user = manager.users.get(player);
  
  switch (id) {
    case "GM.HELP":
      let helpMessage = "\n";
      for (const permissionID in helpMessages) {
        if (user.permissions.has(permissionID) || user.groups.some(group => group.permissions.has(permissionID))) {
          helpMessage += helpMessages[permissionID]+"\n";
        }
      }
      bot.world.send(helpMessage);
    break;
    
    case "GM.CHECK":
      if (argsArr.length < 2) {
        bot.world.send(`You didn't specify enough arguments.\nExample: /GM-CHECK KICK PLAYER_NAME\nThis would check if PLAYER_NAME has permission to use the KICK command.`);
      } else {
        const [command, ...userArgs] = argsArr;
        const permissions = MessageBot.extensions.map(extension => manager.permissions.getExtensionPermissions(extension)).reduce((pSetA, pSetB) => pSetA.concat(pSetB));
        const commandPermissions = permissions.filter(permission => permission.command.toLocaleUpperCase() === command.toLocaleUpperCase() || (permission.command.toLocaleUpperCase() === command.slice(1).toLocaleUpperCase() && command.startsWith("/")));
        const targetUser = manager.users.get(userArgs.join(" "));
        if (commandPermissions.some(permission => targetUser.permissions.has(permission) || Array.from(targetUser.groups).some(group => group.permissions.has(permission)))) {
          bot.world.send(`\n${targetUser.name} has the ability to use the command ${command.toLocaleUpperCase()}`);
        } else {
          bot.world.send(`\n${targetUser.name} cannot use the command ${command.toLocaleUpperCase()}`);
        }
      }
    break;

    case "GM.USER":
      if (argsArr.length < 1) {
        bot.world.send("You didn't specify enough arguments.\nExample: /GM-USER PLAYER_NAME\nThis would display information about a user.");
      } else {
        const targetUser = manager.users.get(args);
        bot.world.send(`\n${targetUser.name}\nHas user specific permissions to use:\n${Array.from(targetUser.permissions.allowed).map(id => `/${(manager.permissions.get(id) as Permission).command}`).join("\n")}\nIs in the groups:\n${targetUser.groups.map(group => group.name).join("\n")}`);
      }
    break;

    case "GM.GROUP":
      if (argsArr.length < 1) {
        bot.world.send("You didn't specify enough arguments.\nExample: /GM-GROUP Anyone\nThis would display information about the Anyone group.")
      } else {
        const group = manager.groups.get(args) as Group;
        if (!group) {
          bot.world.send("This group does not exist! Group names are CaSe SeNsItIvE!");
        } else {
          bot.world.send(`\n${group.name}:\nPlayers: ${group.players.size}\nThis group can use the commands:\n${Array.from(group.permissions.allowed).map(id => `${(manager.permissions.get(id) as Permission).command}`).join(", ")}`);
        }
      }
    break;

    case "GM.ADD":
      if (argsArr.length < 2) {
        bot.world.send("You didn't specify enough arguments.\nExample: /GM-ADD GROUP_NAME PLAYER_NAME\nThis would add PLAYER_NAME to GROUP_NAME");
      } else {
        const [groupName, ...playerNameArr] = argsArr;
        const group = manager.groups.get(groupName) as Group;
        if (!group) {
          bot.world.send("This group does not exist! Group names are CaSe SeNsItIvE!");
        } else {
          const hasMorePermissions = Array.from(group.permissions.allowed).filter(id => user.permissions.has(id) || user.groups.some(group => group.permissions.has(id))).length > 0;
          if (hasMorePermissions && !player.isOwner) {
            bot.world.send("This group has more permissions than you do! You cannot give this group to others!");
          } else if (group.managed) {
            bot.world.send(`You cannot give other players the ${group.name} group! It is managed internally by the extension!`);
          } else {
            const playerName = playerNameArr.join(" ");
            if (group.addPlayer(playerName)) {
              bot.world.send(`Added ${playerName.toLocaleUpperCase()} to ${group.name}.`)
            } else {
              bot.world.send(`\n${playerName.toLocaleUpperCase()} is already in ${group.name}!`);
            }
          }
        }
      }
    break;

    case "GM.REMOVE":
      if (argsArr.length < 2) {
        bot.world.send("You didn't specify enough arguments.\nExample: /GM-REMOVE GROUP_NAME PLAYER_NAME\nThis would remove PLAYER_NAME from GROUP_NAME");
      } else {
        const [groupName, ...playerNameArr] = argsArr;
        const group = manager.groups.get(groupName) as Group;
        if (!group) {
          bot.world.send("This group does not exist! Group names are CaSe SeNsItIvE!");
        } else {
          const hasMorePermissions = Array.from(group.permissions.allowed).filter(id => user.permissions.has(id) || user.groups.some(group => group.permissions.has(id))).length > 0;
          if (hasMorePermissions && !player.isOwner) {
            bot.world.send("This group has more permissions than you do! You cannot remove this group from others!");
          } else if (group.managed) {
            bot.world.send(`You cannot remove ${group.name} from other players! It is managed internally by the extension!`);
          } else {
            const playerName = playerNameArr.join(" ");
            if (group.removePlayer(playerName)) {
              bot.world.send(`Removed ${playerName.toLocaleUpperCase()} from ${group.name}.`)
            } else {
              bot.world.send(`\n${playerName.toLocaleUpperCase()} was already not in ${group.name}!`);
            }
          }
        } 
      }
    break;

    case "GM.GSET":
      if (argsArr.length < 3) {
        bot.world.send("You didn't specify enough arguments.\nExample: /GM-GSET COMMAND_NAME 1 GROUP_NAME\nThis would set any permission that can be activated by /COMMAND_NAME to true of the group GROUP_NAME. Alternatively if you wish to disable a permission already true, replace 1 with 0.");
      } else {
        const [command, value, ...groupNameArr] = argsArr;
        const groupName = groupNameArr.join(" ");
        const group = manager.groups.get(groupName) as Group;
        if (!group) {
          bot.world.send("This group does not exist! Group names are CaSe SeNsItIvE!");
        } else {
          if (!["1", "0"].includes(value)) {
            bot.world.send("The value MUST be either 1 or 0.");
          } else {
            const permissions = MessageBot.extensions.map(extension => manager.permissions.getExtensionPermissions(extension)).reduce((pSetA, pSetB) => pSetA.concat(pSetB));
            const commandPermissions = permissions.filter(permission => permission.command.toLocaleUpperCase() === command.toLocaleUpperCase() || (permission.command.toLocaleUpperCase() === command.slice(1).toLocaleUpperCase() && command.startsWith("/")));
            if (commandPermissions.length === 0) {
              bot.world.send(`There is no registered command by the name of ${command.startsWith("/") ? command.toLocaleUpperCase() : `/${command.toLocaleUpperCase()}`}`);
            } else {
              if (value === "1") {
                group.permissions.add(commandPermissions[0]);
                bot.world.send(`\n${command.startsWith("/") ? command.toLocaleUpperCase() : `/${command.toLocaleUpperCase()}`} is now enabled for the group ${group.name}.`);
              } else {
                group.permissions.delete(commandPermissions[0]);
                bot.world.send(`\n${command.startsWith("/") ? command.toLocaleUpperCase() : `/${command.toLocaleUpperCase()}`} is now disabled for the group ${group.name}.`);
              }
            }
          }
        }
      }
    break;

    case "GM.USET":
      if (argsArr.length < 3) {
        bot.world.send("You didn't specify enough arguments.\nExample: /GM-USET COMMAND_NAME 1 PLAYER_NAME\nThis would set any permission that can be activated by /COMMAND_NAME to true of the user PLAYER_NAME. Alternatively if you wish to disable a permission already true, replace 1 with 0.");
      } else {
        const [command, value, ...playerNameArr] = argsArr;
        const userName = playerNameArr.join(" ");
        const user = manager.users.get(userName);
        if (!["1", "0"].includes(value)) {
          bot.world.send("The value MUST be either 1 or 0.");
        } else {
          const permissions = MessageBot.extensions.map(extension => manager.permissions.getExtensionPermissions(extension)).reduce((pSetA, pSetB) => pSetA.concat(pSetB));
          const commandPermissions = permissions.filter(permission => permission.command.toLocaleUpperCase() === command.toLocaleUpperCase() || (permission.command.toLocaleUpperCase() === command.slice(1).toLocaleUpperCase() && command.startsWith("/")));
          if (value === "1") {
            user.permissions.add(commandPermissions[0]);
            bot.world.send(`\n${command.startsWith("/") ? command.toLocaleUpperCase() : `/${command.toLocaleUpperCase()}`} is now enabled for the user ${user.name}.`);
          } else {
            user.permissions.delete(commandPermissions[0]);
            bot.world.send(`\n${command.startsWith("/") ? command.toLocaleUpperCase() : `/${command.toLocaleUpperCase()}`} is now disabled for the user ${user.name}.`);
          }
        }
        
      }
    break;
    
    case "GM.CREATE":
      if (argsArr.length < 1) {
        bot.world.send("You didn't specify enough arguments.\nExample: /GM-CREATE TEST\nThis would create a group named TEST. Groups are CaSe SeNsItIvE and cannot contain spaces!");
      } else {
        if (manager.groups.get(args)) {
          bot.world.send("This group already exists! Choose another name.");
        } else if (args.includes(" ")) {
          bot.world.send("Group names cannot include spaces!");
        } else {
          manager.groups.add({ name: args });
          bot.world.send(`The group ${args} was created!`);
        }
      }
    break;

    case "GM.DESTROY":
      if (argsArr.length < 1) {
        bot.world.send("You didn't specify enough arguments.\nExample: /GM-DESTROY TEST\nThis would delete any group named TEST. Groups are CaSe SeNsItIvE!");
      } else {
        const group = manager.groups.get(args) as Group;
        if (group) {
          group.delete();
          bot.world.send(`Deleted the group ${group.name}.`);
        } else {
          bot.world.send("This group does not exist.");
        }
      }
    break;

    case "GM.LIST":
      if (argsArr.length < 1) {
        bot.world.send("You didn't specify enough arguments.\nExample: /GM-LIST TEST\nThis would list the last 50 players of the group TEST.");
      } else {
        const group = manager.groups.get(args) as Group;
        if (group) {
          bot.world.send(`\n${group.name}:\n${Array.from(group.players).slice(-50).reverse().map(player => player.name).join(", ")}`);
        } else {
          bot.world.send("This group does not exist.");
        }
      }
    break;
  }
};