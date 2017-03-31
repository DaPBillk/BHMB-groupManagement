var DaPgroupManagement = MessageBotExtension("DaPgroupManagement");
(function (ex) {


   //HEY. DAP. YOU UH. YOU KNOW THE HTML CODE THING? YOU SHOULD FIX IT. OH AND ADD A DEV GUIDE IN THE SOURCE CODE OR ON THE GITHUB REPOSITORY. IDK. BUT LIKE. CAPS LOCK. IT'S AMAZING.
    ex.setAutoLaunch(true);
    ex.groupPermissionDict = ["KICK", "UNBAN", "BAN", "BAN-NO-DEVICE", "BANKICKADMINS", "BANKICKMODS", "MOD", "UNMOD", "ADMIN", "UNADMIN", "STOP", "HELP", "WHITELIST", "UNWHITELIST", "LISTMOD", "LISTBAN", "LISTADMIN", "LISTWHITELIST", "PVPON", "PVPOFF", "LOADLIST", "SETPASSWORD", "REMOVEPASSWORD", "SETPRIVACY", "CLEARMOD", "CLEARADMIN", "CLEARBAN", "CLEARWHITELIST", "GROUPADD", "GROUPDELETE"];
    ex.groupPermissionDisplay = ["Kick", "Unban", "Ban", "Ban-no-device", "Ability to ban/kick Administrators", "Ability to ban/kick Moderators", "Mod", "Unmod", "Admin", "Unadmin", "Stop", "Help", "Whitelist", "Unwhitelist", "List Moderators *", "List Banned Users *", "List Administrators *", "List Whitelist *", "PVP-ON", "PVP-OFF", "LOAD-LIST", "SET-PASSWORD", "REMOVE-PASSWORD", "Set Privacy", "Clear Moderator List", "Clear Admin List", "Clear Ban List", "Clear Whitelist","Add-Group", "Remove-Group"];

    //nts: extend this so I can add other commands from other extensions later. So I guess we need to modify this later for the ability to add more extensions. 2.0. release maybe? :P Plottwist, someone is reading this and says "DAP. DA HECK IS WRONG WITH YOU. @_@"

    ex.commandAlias = {
        "HELP": "HELP",
        "PLAYERS": "PLAYERS",
        "KICK": "KICK",
        "BAN": "BAN",
        "BAN-NO-DEVICE": "BAN-NO-DEVICE",
        "UNBAN": "UNBAN",
        "WHITELIST": "WHITELIST",
        "UNWHITELIST": "UNWHITELIST",
        "LIST-BLACKLIST": "LISTBAN",
        "LIST-WHITELIST": "LISTWHITELIST",
        "LIST-MODLIST": "LISTMOD",
        "LIST-ADMINLIST": "LISTADMIN",
        "PVP-ON": "PVPON",
        "PVP-OFF": "PVPOFF",
        "LOAD-LISTS": "LOADLIST",
        "MOD": "MOD",
        "UNMOD": "UNMOD",
        "ADMIN": "ADMIN",
        "UNADMIN": "UNADMIN",
        "CLEAR-BLACKLIST": "CLEARBAN",
        "CLEAR-WHITELIST": "CLEARWHITELIST",
        "CLEAR-MODLIST": "CLEARMOD",
        "CLEAR-ADMINLIST": "CLEARADMIN",
        "SET-PASSWORD": "SETPASSWORD",
        "REMOVE-PASSWORD": "REMOVEPASSWORD",
        "SET-PRIVACY": "SETPRIVACY",
        "ADD-GROUP": "GROUPADD",
        "REMOVE-GROUP": "GROUPDELETE"
    };

    ex.extensionCmdAlias = [];

    ex.uninstall = function() {
      ex.storage.clearNamespace(ex.id);
    };



    ex.loadStorage = function () {
        ex.users = {};
        ex.groups = {
            moderator: ["KICK", "UNBAN", "BAN", "BAN-NO-DEVICE", "HELP", "WHITELIST", "UNWHITELIST", "LISTWHITELIST", "LISTBAN"],
            administrator: ["KICK", "UNBAN", "BAN", "BAN-NO-DEVICE", "BANKICKADMINS", "BANKICKMODS", "MOD", "UNMOD", "ADMIN", "UNADMIN", "STOP", "HELP", "WHITELIST", "UNWHITELIST", "LISTMOD", "LISTBAN", "LISTADMIN", "LISTWHITELIST", "PVPON", "PVPOFF", "LOADLIST", "CLEARMOD", "CLEARADMIN", "CLEARBAN", "CLEARWHITELIST"],
            anyone: []
        };
        ex.groupDisplayNames = {
            moderator: "Moderator",
            administrator: "Administrator",
            anyone: "Anyone"
        };
        var storedData = ex.storage.getObject(`${ex.id}GroupPermissions`);
        if (storedData) {
            ex.groups = storedData;

        }
        var groupNames = ex.storage.getObject(`${ex.id}DisplayNames`);
        if (groupNames) {
            ex.groupDisplayNames = groupNames;
        }
        var storedUsers = ex.storage.getObject(`${ex.id}Users`);
        if (storedUsers) {
            ex.users = storedUsers;
        }

    };

    ex.fixGroups = function (name) {
        var username = name.toLowerCase();
        if (!ex.users[username]) {
            ex.users[username] = ["anyone"];
        }
        if (ex.bot.world.isAdmin(username) && ex.users[username].indexOf("administrator") == -1) {
            ex.users[username].push("administrator");
        }
        if (ex.bot.world.isMod(username) && ex.users[username].indexOf("moderator") == -1) {
            ex.users[username].push("moderator");
        }
        if (!ex.bot.world.isAdmin(username) && ex.users[username].indexOf("administrator") != -1) {
            ex.users[username].splice(ex.users[username].indexOf("administrator"), 1);
        }
        if (!ex.bot.world.isMod(username) && ex.users[username].indexOf("moderator") != -1) {
            ex.users[username].splice(ex.users[username].indexOf("moderator"), 1);
        }
        if (ex.users[username].indexOf("anyone") == -1) {
            ex.users[username].push("anyone");
        }
    };


    ex.addGroupEl = document.createElement("span");
    ex.addGroupEl.textContent = "New UserGroup";

    ex.doesGroupExist = function (groupName) {
        if (groupName.length === 0 || groupName.replace(/\s/g, '').length === 0) {
            return true;
        }
        var WHITELISTED = ["ADMINISTRATOR", "MODERATOR", "ANYONE", "NEW USERGROUP"];
        if (WHITELISTED.indexOf(groupName.toUpperCase()) !== -1) {d
            return true;
        }
        return !!ex.groups[groupName.toUpperCase()]; //Thanks to Bibliophile for this. :)
    };

    ex.userHasPermission = function (username, permission) {
        for (var group of ex.users[username.toLowerCase()]) {

            if (ex.groups[group].indexOf(permission) !== -1) {
                return true;
            }

        }
        return false;
    };

    ex.canUserUse = function (username, command) {
        if (ex.commandAlias[command]) {
            return ex.userHasPermission(username.toLowerCase(), ex.commandAlias[command]);
        }

        for (var x of ex.extensionCmdAlias) { //Mutiple extensions may have the same cmd. Ugh. However if this comment still exists then I had no problem with this.
          if (x.cmd === command) {
            return ex.userHasPermission(username.toLowerCase(), x.permName);
          }
        }
    };



    var help = {
        "HELP": "/HELP - display this message.",
        "PLAYERS": "/PLAYERS - list currently active players.",
        "KICK": "/KICK player_name - kicks player_name, but they will still be allowed to reconnect.",
        "BAN": "/BAN player_name_or_ip - adds player_name_or_ip to the blacklist, ban's that user's device from reconnecting with a different name, and kicks anyone who is no longer authorized.",
        "BAN-NO-DEVICE": "/BAN-NO-DEVICE player_name_or_ip - works the same as the ban command, but doesn't ban the player's device.",
        "UNBAN": "/UNBAN player_name_or_ip - removes player_name_or_ip from the blacklist.",
        "WHITELIST": "/WHITELIST player_name_or_ip - adds player_name_or_ip to the whitelist, and kicks anyone who is no longer authorized.",
        "UNWHITELIST": "/UNWHITELIST player_name_or_ip - removes player_name_or_ip from the whitelist, and kicks anyone who is no longer authorized.",
        "LIST-BLACKLIST": "/LIST-BLACKLIST - lists the 50 most recent players on the blacklist.",
        "LIST-WHITELIST": "/LIST-WHITELIST - lists the 50 most recent players on the whitelist.",
        "LIST-MODLIST": "/LIST-MODLIST - lists the 50 most recent players on the modlist.",
        "LIST-ADMINLIST": "/LIST-ADMINLIST - lists the 50 most recent players on the adminlist.",
        "PVP-ON": "/PVP-ON - enables PVP (Player vs. Player) so players can directly hurt each other.",
        "PVP-OFF": "/PVP-OFF - disables PVP (Player vs. Player) so players cannot directly hurt each other",
        "LOAD-LISTS": "/LOAD-LISTS - reloads the blacklist.txt, modlist.txt and adminlist.txt files, and kicks anyone who is no longer authorized.",
        "MOD": "/MOD player_name - adds player_name to the modlist, allowing them to issue some server commands via chat.",
        "UNMOD": "/UNMOD player_name - removes player_name from the modlist.",
        "ADMIN": "/ADMIN player_name - adds player_name to the adminlist, allowing them to issue server commands via chat.",
        "UNADMIN": "/UNADMIN player_name - removes player_name from the adminlist.",
        "CLEAR-BLACKLIST": "/CLEAR-BLACKLIST - removes all names from the blacklist.",
        "CLEAR-WHITELIST": "/CLEAR-WHITELIST - removes all names from the whitelist.",
        "CLEAR-MODLIST": "/CLEAR-MODLIST - removes all names from the modlist.",
        "CLEAR-ADMINLIST": "/CLEAR-ADMINLIST - removes all names from the adminlist.",
        "SET-PASSWORD": "/SET-PASSWORD password - sets a new password, which all players except the owner must use in order to connect.",
        "REMOVE-PASSWORD": "/REMOVE-PASSWORD - removes the password, so all players may connect.",
        "SET-PRIVACY": "/SET-PRIVACY public/searchable/private - changes the privacy setting.",
        "ADD-GROUP": "/ADD-GROUP group_name player_name - adds player_name to group_name granting any permissions group_name has.",
        "REMOVE-GROUP": "/REMOVE-GROUP group_name player_name - removes player_name from group_name taking back any permissions group_name has granted."
    };

    ex.userAddGroup = function (groupName, username) {
        if (!ex.users[username]) {
            ex.users[username] = ["anyone"];
        }
        if (ex.users[username].indexOf(groupName) !== -1) {
            return false;
        }
        ex.users[username].push(groupName);
        ex.save();
        return true;
    };

    ex.userRemoveGroup = function (groupName, username) {
        if (!ex.users[username]) {
            return false;
        }
        if (ex.users[username].indexOf(groupName) !== -1) {
            ex.users[username] = ex.users[username].splice(ex.users[username].indexOf(groupName), 1);
            return true;
        }
        return false;
    };

    function sendMsg(msg, sender) {

        if (sender.toUpperCase() === "SERVER") {
            ex.console.write(msg);
        } else {
            ex.bot.send(msg);
        }
    };


    function cmdAddGroup(args, sender) {
        var reservedGroups = ["administrator", "moderator", "anyone"];
        var groupName = args.split(" ")[0].toLowerCase();

        if (args.split(" ").length > 1) {
            var username = args.substring(args.indexOf(" ") + 1);

            if (reservedGroups.indexOf(groupName) !== -1) {
                sendMsg(`${groupName} is a reserved group! Failed to add user.`, sender); //can't add a user to the admin group, mod group, or any group.
                return;
            }

            var name;
            for (var x in ex.bot.world.players) {
              if (x.toLowerCase() === username.toLowerCase()) {
                name = x;
                break;
              }
            }
            if (!name) {
              sendMsg(`${username} doesn't exist.`,sender);
              return;
            }

            if (!ex.groups[groupName.toLowerCase()]) {
              sendMsg(`${groupName} doesn't exist.`,sender);
              return;
            }




            if (ex.userAddGroup(groupName, username.toLowerCase())) {

                sendMsg(`Successfully added ${username} to ${groupName}.`, sender);
            } else {

                sendMsg(`${username} is already in the group ${groupName}`, sender);
            }

        } else {
            sendMsg("Invalid syntax! /ADD-GROUP group_name player_name", sender);
        }
    };

    function cmdRemoveGroup(args, sender) {
        var reservedGroups = ["administrator", "moderator", "anyone"];
        var groupName = args.split(" ")[0];
        if (args.split(" ").length > 1) {
            var username = args.substring(args.indexOf(" ") + 1);
            if (reservedGroups.indexOf(groupName) !== -1) {
                sendMsg(`${groupName} is a reserved group! Failed to remove group from user.`, sender); //can't remove a user to the admin group, mod group, or any group.
                return;
            }

            var name;
            for (var x in ex.bot.world.players) {
              if (x.toLowerCase() === username.toLowerCase()) {
                name = x;
                break;
              }
            }
            if (!name) {
              sendMsg(`${username} doesn't exist.`,sender);
              return;
            }

            if (!ex.groups[groupName.toLowerCase()]) {
              sendMsg(`${groupName} doesn't exist.`,sender);
              return;
            }

            if (ex.userRemoveGroup(groupName, username.toLowerCase())) {
                sendMsg(`Successfully removed ${username} from ${groupName}.`, sender);
            } else {
                sendMsg(`${username} is not in the group ${groupName}`, sender);
            }
        } else {
            sendMsg("Invalid syntax! /REMOVE-GROUP group_name player_name", sender);
        }
    };

    ex.modifiedPermission = function (e) {

        var htmlElm = e.target || e.srcElement;
        if (htmlElm.tagName === "INPUT" && htmlElm.getAttribute("type") === "checkbox") {
            var groupName = htmlElm.getAttribute("data-groupName");
            var permissionName = htmlElm.getAttribute("name").substring(ex.id.length + 1);

            if (ex.groups[groupName].indexOf(permissionName) === -1) {
                ex.groups[groupName].push(permissionName);
            } else {
                ex.groups[groupName].splice(ex.groups[groupName].indexOf(permissionName), 1);
            }
            ex.save();
        }
    };

    ex.save = function () {
        ex.storage.set(`${ex.id}GroupPermissions`, ex.groups);
        ex.storage.set(`${ex.id}Users`, ex.users);
        ex.storage.set(`${ex.id}DisplayNames`, ex.groupDisplayNames);
    };

    ex.renameUserGroup = function (e) {
        var oldName = e.getAttribute("name").substring(`${ex.id}_name_`.length);
        var newName = e.value;
        if (!ex.doesGroupExist(newName.toLowerCase())) {
            e.setAttribute("name", `${ex.id}_name_${newName.toLowerCase()}`);
            ex.groups[newName.toLowerCase()] = ex.groups[oldName];
            ex.groupDisplayNames[newName.toLowerCase()] = newName;
            e.setAttribute("value",newName);
            delete ex.groupDisplayNames[oldName];
            delete ex.groups[oldName];

            e.parentNode.setAttribute(`data-${ex.id}_tab`,`tab-${newName.toLowerCase()}`);


            var oldTab = ex.tab.permissions.querySelector(`nav > span[data-tabname="${oldName}"]`);
            oldTab.setAttribute("data-tabname", newName.toLowerCase());
            oldTab.textContent = newName;

            for (var x of e.parentNode.querySelectorAll("li > input")) {
                x.setAttribute("data-groupname",newName.toLowerCase());
            }

            ex.tab.permissions.querySelector("nav[data-selectedtab]").setAttribute("data-selectedtab",newName.toLowerCase());
            ex.ui.notify("UserGroup name successfully changed.", 4);
            ex.save();
        } else {
            e.value = ex.tab.permissions.querySelector(`span[data-tabname="${oldName}"]`).textContent;
            ex.ui.notify("UserGroup name already exists.", 3);
        }
    };

    ex.deleteUserGroup = function (e) {
        ex.ui.alert("Do you really want to delete this UserGroup?", [
            {
                text: "Delete", action: function () {
                    var tabName = e.target.parentNode.getAttribute(`data-${ex.id}_tab`).toLowerCase();
                    tabName = tabName.substring(tabName.indexOf("-") + 1);

                    var newSpan = ex.tab.permissions.querySelectorAll("nav span[data-tabname]");
                    var num = 0;
                    for (var x of newSpan) {
                        if (ex.tab.permissions.querySelector(`div[data-${ex.id}_tab=tab-${x.getAttribute("data-tabname")}]`) === e.target.parentNode) {
                            newSpan = newSpan[num - 1];
                            break;
                        }
                        num++;
                    }
                    newSpan.setAttribute("selected", "true");

                    ex.tab.permissions.querySelector("nav").setAttribute("data-selectedtab", newSpan.getAttribute("data-tabname"));
                    ex.tab.permissions.querySelector(`div[data-${ex.id}_tab="tab-${newSpan.getAttribute("data-tabname")}"]`).className = "";

                    ex.tab.permissions.querySelector(`nav span[data-tabname="${tabName}"]`).remove();
                    e.target.parentNode.remove();

                    delete ex.groups[tabName];
                    delete ex.groupDisplayNames[tabName];

                    ex.save();
                }
            },
            { text: "Cancel" }

        ]);
    };

    ex.addGroup = function () {
        if (Object.keys(ex.groups).length > 7) {
          ex.ui.alert("You can't have more then 5 custom groups! This might be raised later on. Sorry. >_<",
        [
          {text:"Ok"}
        ]);
          return;
        }
        ex.ui.alert(`What would you like this group to be called?<br /><input onchange="${ex.id}.alertValue = this.value;"></input>`, [
            {
                text: "Add Group", action: function () {
                    if (!ex.doesGroupExist(ex.alertValue.toLowerCase())) {
                        if (ex.alertValue.indexOf(" ") !== -1) {
                            ex.ui.notify("Spaces cannot be used in UserGroup names.");
                            return;
                        }
                        if (ex.alertValue.indexOf("<") !== -1 || ex.alertValue.indexOf(">") !== -1) {
                          ex.ui.notify("< and > cannot be used in UserGroup names. This will be changed soon!");
                          return;
                        }
                        ex.groups[ex.alertValue.toLowerCase()] = [];
                        ex.groupDisplayNames[ex.alertValue.toLowerCase()] = ex.alertValue;
                        ex.tab.permissions.getElementsByTagName("nav")[0].querySelector("span:last-child").remove();
                        var groupBox = document.createElement("span");
                        groupBox.textContent = ex.alertValue;
                        groupBox.setAttribute("data-tabName", ex.alertValue.toLowerCase());
                        ex.tab.permissions.getElementsByTagName("nav")[0].appendChild(groupBox);
                        ex.tab.permissions.getElementsByTagName("nav")[0].appendChild(ex.addGroupEl);
                        var divBox = document.createElement("div");
                        divBox.setAttribute(`data-${ex.id}_tab`, "tab-" + ex.alertValue.toLowerCase());
                        divBox.innerHTML = `
                            <br />
				            UserGroup name: <input name="${ex.id}_name_${ex.alertValue.toLowerCase()}" value="${ex.alertValue}" onchange="${ex.id}.renameUserGroup(this)" /> <br />
                            ${ex.getPermissionListHTML(ex.alertValue.toLowerCase())}
                            <strong>*</strong> - Be warned! These critical commands will display text in chat visible to all users, not just the player who sent the command!<br />
                            <a href="#">Delete UserGroup</a>
                        `;
                        divBox.querySelector("a").addEventListener("click", ex.deleteUserGroup);
                        for (var x of ex.extensionCmdAlias) {
                          ex.addNewGroupPermissionUI(divBox.querySelector("ul"),ex.id+"_"+x.permName,x.displayName);
                        }
                        document.getElementById(ex.id + "_tab").appendChild(divBox);


                        var tabSelected = ex.tab.permissions.getElementsByTagName("nav")[0].getAttribute("data-selectedTab");
                        ex.tab.permissions.querySelector(`div[data-${ex.id}_tab=tab-${tabSelected.toString()}]`).className = "h";
                        ex.tab.permissions.getElementsByTagName("nav")[0].setAttribute("data-selectedTab", ex.alertValue.toLowerCase());
                        ex.tab.permissions.querySelector("span[selected=true]").setAttribute("selected", "false");
                        ex.tab.permissions.querySelector(`span[data-tabname="${ex.alertValue.toLowerCase()}"]`).setAttribute("selected", "true");


                        ex.save();
                    } else {
                        ex.ui.notify("UserGroup name already exists or you specified an invalid UserGroup name.", 6);
                    }
                }
            },
            { text: "Cancel" }
        ]);

    };

    ex.getPermissionListHTML = function (groupName) {

        var finalDecision = "";
        if (["ADMINISTRATOR", "MODERATOR"].indexOf(groupName.toUpperCase()) !== -1) {
            finalDecision = " disabled";
        }
        var permissions = ex.groups[groupName];
        var htmlList = "<ul>";
        var checked;
        var disabledPerms = {
            moderator: ["KICK", "UNBAN", "BAN", "BAN-NO-DEVICE", "PLAYERS", "HELP", "WHITELIST", "UNWHITELIST", "LISTWHITELIST", "LISTBAN"],
            administrator: ["KICK", "UNBAN", "BAN", "BAN-NO-DEVICE", "MOD", "UNMOD", "ADMIN", "UNADMIN", "STOP", "PLAYERS", "HELP", "WHITELIST", "UNWHITELIST", "LISTMOD", "LISTBAN", "LISTADMIN", "LISTWHITELIST", "PVPON", "PVPOFF", "LOADLIST", "CLEARMOD", "CLEARADMIN", "CLEARBAN", "CLEARWHITELIST","BANKICKADMINS","BANKICKMODS"],
            anyone: []
        };
        for (var x in ex.groupPermissionDict) {
            checked = "";

            if (permissions.indexOf(ex.groupPermissionDict[x]) !== -1) {

                if (disabledPerms[groupName]) {
                    if (disabledPerms[groupName].indexOf(ex.groupPermissionDict[x]) !== -1) {
                        checked = `checked ${finalDecision}`;
                    } else {
                        checked = `checked`;
                    }
                } else {
                    checked = "checked";
                }

            }
            htmlList += `<li><input type="checkbox" data-groupName="${groupName}" name="${ex.id}_${ex.groupPermissionDict[x]}" ${checked}/>${ex.groupPermissionDisplay[x]}</li>`;
        }


        return htmlList + "</ul>";
    };

    ex.getDisplayName = function (name) {
        return ex.groupDisplayNames[name.toLowerCase()];
    };


    ex.getOtherGroupDivs = function () {
        var notOther = ["ADMINISTRATOR", "MODERATOR", "ANYONE"];
        var str = "";

        for (var x in ex.groups) {
            if (notOther.indexOf(x.toUpperCase()) === -1) {
                str += `
        	        <div data-${ex.id}_tab="tab-${x}" class="h"> <br />
			            UserGroup name: <input name="${ex.id}_name_${x}" value="${ex.getDisplayName(x)}" onchange="${ex.id}.renameUserGroup(this)" /> <br />
                        ${ex.getPermissionListHTML(x)}
                        <strong>*</strong> - Be warned! These critical commands will display text in chat visible to all users, not just the player who sent the command!<br />
                        <a href="#">Delete UserGroup</a>
			        </div>
                `;
            }
        }
        return str;
    };

    ex.getOtherGroupSpans = function () {
        var notOther = ["ADMINISTRATOR", "MODERATOR", "ANYONE"];
        var str = "";
        for (var x in ex.groups) {
            if (notOther.indexOf(x.toUpperCase()) === -1) {
                str += `<span data-tabName="${x}">${ex.getDisplayName(x)}</span>`;
            }
        }
        return str;
    };

    ex.userInfo = function() {
      var val = ex.tab.users.querySelector("input").value.toUpperCase();
      var name;
      for (var x in ex.bot.world.players) {
        if (x.toUpperCase() === val) {
          name = x;
          break;
        }
      }
      if (name) {
        ex.tab.users.querySelector(`div[data-${ex.id}_usertab=users] > span`).setAttribute("class","");
        ex.tab.users.querySelector(`div[data-${ex.id}_usertab=users] > span > h4`).textContent = name;
        var groupList = ex.tab.users.querySelector(`div[data-${ex.id}_usertab=users] > span > ul`);
        groupList.innerHTML = "";
        if (!ex.users[name]) {
          ex.fixGroups(name.toLowerCase());
        }
        for (var x of ex.users[name.toLowerCase()]) {
          var li = document.createElement("li");
          li.textContent = ex.getDisplayName(x);
          groupList.appendChild(li);
        }
      }
    };


    ex.createTab = function () {
        ex.ui.addTabGroup("Group Management", ex.id + "_TAB");
        ex.tab = {
            permissions: ex.ui.addTab("Permissions", ex.id + "_TAB"),
            users: ex.ui.addTab("Users", ex.id + "_TAB")
        };
        ex.tab.permissions.innerHTML = `
		<style>

      #${ex.id}_tab {
          width:100%;
      }

			#${ex.id}_tab nav {
				width:100%;
				height: 40px;
				display: -webkit-flex;
				display: flex;
				flex-flow: row wrap;
			}

			#${ex.id}_tab nav span {
				background: #182B73;
				height:100%;
				min-width: 10vw;
				color:white;
				display: -webkit-flex;
				display: flex;
				margin:2px;
				-webkit-justify-content: center;
				justify-content: center;
				align-items: center;
				flex-grow: 1;
			}

      #${ex.id}_tab ul {
          -moz-column-count:2;
          -moz-column-gap: 20px;
          -webkit-column-count:2;
          -webkit-column-gap: 20px;
          column-count: 2;
          column-gap: 20px;
      }


			#${ex.id}_tab nav span[selected=true] {
				background: #E7E7E7;
				color: #000;
				/*From Bib's Server Currency Extension. https://github.com/Bibliofile/BHMB-Server-Currency/blob/master/tab.html#L39-L40 */
			}

			#${ex.id}_tab h {
				display:none;
			}

			#${ex.id}_tab div[data-${ex.id}_tab^="tab-"] {
				background:#E7E7E7;
        height:80vh;
			}

			#${ex.id}_tab .h {
				display:none;
			}

		</style>
		<div id="${ex.id}_tab">
			<nav data-selectedTab="administrator">
				<span selected=true data-tabName="administrator">Administrator</span>
				<span data-tabName="moderator">Moderator</span>
				<span data-tabName="anyone">Anyone</span>
                ${ex.getOtherGroupSpans()}
				<span>New UserGroup</span>
			</nav>
			<div data-${ex.id}_tab="tab-administrator" class=""> <br />
				UserGroup name: <input name="${ex.id}_name_administrator" value="Administrator" disabled/> <br />
                ${ex.getPermissionListHTML("administrator")}
                <strong>*</strong> - Be warned! These critical commands will display text in chat visible to all users, not just the player who sent the command! Unless the command sender is a admin/mod and has this permission.
			</div>
			<div data-${ex.id}_tab="tab-moderator" class="h"> <br />
				UserGroup name: <input name="${ex.id}_name_moderator" value="Moderator" disabled/> <br />
                ${ex.getPermissionListHTML("moderator")}
                <strong>*</strong> - Be warned! These critical commands will display text in chat visible to all users, not just the player who sent the command! Unless the command sender is a admin/mod and has this permission.
			</div>
			<div data-${ex.id}_tab="tab-anyone" class="h"> <br />
				UserGroup name: <input name="${ex.id}_name_anyone" value="Anyone" disabled/> <br />
                ${ex.getPermissionListHTML("anyone")}
                <strong>*</strong> - Be warned! These critical commands will display text in chat visible to all users, not just the player who sent the command! Unless the command sender is a admin/mod and has this permission.
			</div>
            ${ex.getOtherGroupDivs()}
		</div>
	    `;

        var deleteQueryElements = ex.tab.permissions.querySelectorAll('a[href="#"]');

        for (var x of deleteQueryElements) {
            x.addEventListener("click", ex.deleteUserGroup);
        }

        ex.tab.permissions.addEventListener("click", ex.modifiedPermission);

        ex.tab.permissions.getElementsByTagName("nav")[0].addEventListener("click", function (e) {

            var targ = e.target || e.srcElement || e.toElement;
            var newTabSelected = targ.getAttribute("data-tabname");
            if (newTabSelected != null) {
                newTabSelected = newTabSelected.toString();
                var tabSelected = ex.tab.permissions.getElementsByTagName("nav")[0].getAttribute("data-selectedTab").toString();
                ex.tab.permissions.getElementsByTagName("nav")[0].setAttribute("data-selectedTab", newTabSelected);
                ex.tab.permissions.querySelector("span[selected=true]").setAttribute("selected", "false");
                targ.setAttribute("selected", "true");
                ex.tab.permissions.querySelector(`div[data-${ex.id}_tab=tab-${tabSelected}]`).className = "h";
                ex.tab.permissions.querySelector(`div[data-${ex.id}_tab=tab-${newTabSelected}]`).className = "";
            } else {
                if (targ.tagName === "SPAN") {
                    ex.addGroup();
                }
            }

        });

        ex.tab.users.innerHTML = `
            <style>
              #${ex.id}_userTab {
                  width:100%;
              }

              #${ex.id}_userTab nav {
                width:100%;
                height: 40px;
                display: -webkit-flex;
                display: flex;
                flex-flow: row wrap;
              }

              #${ex.id}_userTab nav span {
                background: #182B73;
                height:100%;
                min-width: 10vw;
                color:white;
                display: -webkit-flex;
                display: flex;
                margin:2px;
                -webkit-justify-content: center;
                justify-content: center;
                align-items: center;
                flex-grow: 1;
              }

              #${ex.id}_userTab nav span[selected=true] {
                background: #E7E7E7;
                color: #000;
                /*From Bib's Server Currency Extension. https://github.com/Bibliofile/BHMB-Server-Currency/blob/master/tab.html#L39-L40 */
              }

              #${ex.id}_userTab input {
                margin-top:10px;
                margin-left:10px;
              }

              #${ex.id}_userTab .h {
        				display:none;
        			}

              #${ex.id}_userTab p {
                margin-left:10px;
              }

              #${ex.id}_userTab li {
                margin-left:15px;
              }

            </style>

            <div id="${ex.id}_userTab">
                <nav>
                  <span selected>Users</span>
                  <!--<span>Logs</span>-->
                </nav>
                <div data-${ex.id}_userTab="users">
                  <input placeholder="Type a username"></input>
                  <span class="h">
                    <h4 class="subtitle"></h4>
                    <p>I am in the groups...</p>
                    <ul>

                    </ul>
                  </span>
                </div>
            </div>
        `;

        var users = [];
        for (var x in ex.bot.world.players) {
          users.push(x);
        }

        var input = ex.tab.users.querySelector("input");

        new Awesomplete(input,{
          list: users,
          maxItems: 7,
          minChars: 1
        }); //issue maybe? New users cannot be found.

        input.addEventListener("awesomplete-selectcomplete",ex.userInfo);
        input.addEventListener("keyup",ex.userInfo);

    };



        ex.commandHandler = function (name, command, args) {
          ex.fixGroups(name.toLowerCase());
          var cmd = command.toUpperCase();

          if (name === "SERVER") {
              switch (cmd) {
                  case "ADD-GROUP":
                      cmdAddGroup(args, name);
                      break;
                  case "REMOVE-GROUP":
                      cmdRemoveGroup(args, name);
                      break;
              }
              return;
          }
          if (ex.canUserUse(name, cmd) || ex.bot.world.isOwner(name)) {
              //for now we hardcode in the commands. Fix soon.
              console.log("CAN USE");
              switch (cmd) {
                  case "ADD-GROUP":
                      cmdAddGroup(args, name);
                      break;
                  case "REMOVE-GROUP":
                      cmdRemoveGroup(args, name);
                      break;

                  case "BAN":
                  case "KICK":
                  case "BAN-NO-DEVICE":

                      if (ex.bot.world.isOwner(args)) {
                          sendMsg("Sorry, you do no have permission to issue that command.", name);
                          return;
                      }
                      //NTS REFINE THIS SECTION
                      if (!ex.bot.world.isAdmin(name)) {
                          if (ex.bot.world.isMod(name)) {
                              if (ex.bot.world.isStaff(args)) {
                                  //OH MY GOSH. IT'S A STAFF MEMBER. I'M YOUR BIGGEST FAN. @ _ @ No ban ples
                                  if (ex.bot.world.isAdmin(args)) {
                                      if (ex.userHasPermission(name, "BANKICKADMIN")) {
                                          sendMsg(`/${cmd} ${args}`, name);
                                      } else {
                                          sendMsg("Sorry, you do no have permission to issue that command.", name);
                                      }
                                  } else {
                                      if (ex.userHasPermission(name, "BANKICKMOD")) {
                                          sendMsg(`/${cmd} ${args}`, name);
                                      } else {
                                          sendMsg("Sorry, you do no have permission to issue that command.", name);
                                      }
                                  }
                              }
                              // no else. Do nothing. Cmd issued. Whatever. GG.
                          } else {
                              if (ex.bot.world.isStaff(args)) {
                                  //OH MY GOSH. IT'S A STAFF MEMBER. I'M YOUR BIGGEST FAN. @ _ @ No ban ples
                                  if (ex.bot.world.isAdmin(args)) {
                                      if (ex.userHasPermission(name, "BANKICKADMIN")) {
                                          sendMsg(`/${cmd} ${args}`, name);
                                      } else {
                                          sendMsg("Sorry, you do no have permission to issue that command.", name);
                                      }
                                  } else {
                                      if (ex.userHasPermission(name, "BANKICKMOD")) {
                                          sendMsg(`/${cmd} ${args}`);
                                      } else {
                                          sendMsg("Sorry, you do no have permission to issue that command.", name);
                                      }
                                  }
                              } else {
                                  sendMsg(`/${cmd} ${args}`, name);
                              }
                          }
                      }

                      break;
                  case "MOD":
                  case "UNMOD":
                  case "ADMIN":
                  case "UNADMIN":
                  case "PVP-ON":
                  case "PVP-OFF":
                  case "LOAD-LISTS":

                      if (!ex.bot.world.isAdmin(name)) {
                          sendMsg(`/${cmd} ${args}`, name);
                      }
                      break;

                  case "STOP":

                      if (!ex.bot.world.isAdmin(name)) {
                          sendMsg(`/stop`, name);
                      }
                      break;
                  case "HELP":

                      var helpStr = "\n";
                      for (var x in help) {
                          if (ex.canUserUse(name.toLowerCase(), x)) {
                              helpStr += help[x] + "\n";
                          }
                      }
                      sendMsg(helpStr, name);
                      break;
                  case "WHITELIST":
                  case "UNWHITELIST":
                  case "UNBAN":

                      if (!ex.bot.world.isStaff(name)) {
                          sendMsg(`/${cmd} ${args}`, name);
                      }
                      break;

                  case "LIST-MODLIST":

                      if (!ex.bot.world.isAdmin(name)) {
                          var str = "Modlist:\n";
                          for (var x of ex.bot.world.lists.mod) {
                              str += x.toLowerCase() + ", ";
                          }
                          sendMsg(str, name);
                      }
                      break;
                  case "LIST-ADMINLIST":

                      if (!ex.bot.world.isAdmin(name)) {
                          var str = "Adminlist:\n";
                          for (var x of ex.bot.world.lists.admin) {
                              str += x.toLowerCase() + ", ";
                          }
                          sendMsg(str, name);
                      }
                      break;
                  case "LIST-BLACKLIST":

                      if (!ex.bot.world.isStaff(name)) {
                          var str = "Blacklist:\n";
                          for (var x of ex.bot.world.lists.black) {
                              str += x.toLowerCase() + ", ";
                          }
                          sendMsg(str, name);
                      }
                      break;
                  case "LIST-WHITELIST":

                      if (!ex.bot.world.isStaff(name)) {
                          var str = "Whitelist:\n";
                          for (var x of ex.bot.world.lists.white) {
                              str += x.toLowerCase() + ", ";
                          }
                          sendMsg(str, name);
                      }
                      break;
                  case "SET-PRIVACY":
                      if (!ex.bot.world.isOwner(name)) {
                          var privacySet = args.toUpperCase();
                          switch (privacySet) {
                              case "PUBLIC":
                                  if (ex.bot.world.lists.white.length > 0) {
                                      sendMsg("Error: This world is whitelisted, and whitelisted worlds can only be serachable or private. Privacy setting has been left unchanged.", name);
                                  } else {
                                      sendMsg("Privacy setting changed to public.", name);
                                  }
                                  break;
                              case "PRIVATE":
                                  sendMsg(`/SET-PRIVACY ${args}`, name);
                                  sendMsg("Privacy setting changed to private.", name);
                                  break;
                              case "SEARCHABLE":
                                  sendMsg(`/SET-PRIVACY ${args}`, name);
                                  sendMsg("Privacy setting changed to searchable.", name);
                                  break;
                          }
                      }
                      break;
                  case "SET-PASSWORD":

                      if (!ex.bot.world.isOwner(name)) {
                          sendMsg(`/SET-PASSWORD ${args}`, name);
                          sendMsg("Password set.", name);
                      }
                      break;
                  case "REMOVE-PASSWORD":

                      if (!ex.bot.world.isOwner(name)) {
                          ex.api.getHomepage(true).then((data) => {
                              var passwordProtected = new DOMParser().parseFromString(data, "text/html").querySelectorAll("table > tbody > tr > td:not(.right):not(.left)")[8].textContent;
                              if (passwordProtected === "No") {
                                  sendMsg("There was already no password set.", name);
                              } else {
                                  sendMsg("Password removed.", name);
                              }
                          });
                          sendMsg(`/REMOVE-PASSWORD`, name);

                      } else {

                      }
                      break;
                  case "PLAYERS":
                      //For now this doesn't exist... EVER.
                      break;

                  default:
                      //well I was given permissions to use the cmd.. So maybe.. Just maybe.. There's an extension that has a cmd handler thingy for me? :o - DaP 2k17 (Probably questioning his own sanity)
                      //custom cmds.
                      for (var x of ex.extensionCmdAlias) {
                        if (x.cmd === cmd && ex.userHasPermission(name.toLowerCase(), x.permName)) {
                          try {
                            x.callback(name,command,args);
                          } catch (e) {

                          }
                        }
                      }
                      break;
              }
          }
    };

    ex.removeGroupPermissionUI = function(id) {
      console.log(id);
      var perms = ex.tab.permissions.querySelectorAll(`div[data-${ex.id}_tab] > ul > li > input`);
      var list;
      for (var x of perms) {


        if (x.getAttribute("name") === ex.id+"_"+id) {

          x.parentElement.remove();
        }
      }
    };


    ex.addGroupPermissionUI = function(id,displayName,ignoreAdmin = false,ignoreMod = false,ignoreAny = false) {
      console.log(id);
      var divs = ex.tab.permissions.querySelectorAll(`div[data-${ex.id}_tab]`);
      var li;
      var input;

      for (var x of divs) {

        li = document.createElement("li");
        input = document.createElement("input");
        input.setAttribute("type","checkbox");
        var group = x.getAttribute(`data-${ex.id}_tab`).substring(4);

        input.setAttribute("data-groupname",group);
        input.setAttribute("name",id);
        if (ignoreAdmin && group === "administrator" || ignoreMod && group === "moderator" || ignoreAny && group === "anyone") {
          input.setAttribute("disabled","");
          input.setAttribute("checked","");
        }
        if (ex.groups[group].indexOf(id.substring(ex.id.length+1)) != -1) {
          input.setAttribute("checked","");
        }
        li.appendChild(input);
        li.innerHTML += displayName;
        x.querySelector("ul").appendChild(li);

      }
    };

    ex.addNewGroupPermissionUI = function(list,id,displayName) {
      li = document.createElement("li");
      input = document.createElement("input");
      input.setAttribute("type","checkbox");
      var group = list.parentElement.getAttribute(`data-${ex.id}_tab`).substring(4);
      input.setAttribute("data-groupname",group);
      input.setAttribute("name",id);
      if (ex.groups[group].indexOf(id.substring(ex.id.length+1)) != -1) {
        input.setAttribute("checked","");
      }
      li.appendChild(input);
      li.innerHTML += displayName;
      list.appendChild(li);
    };

    ex.registerExtension = function(id) {
      console.log("registering... "+id);
      if (window[id]) {
        var ext = window[id];
        var config = ext.permissionConfig;
        if (!config) {
          return;
        }
        if (!config.id || !config.cmds) {
          return;
        }
        if (!typeof config.id === "string" || !Array.isArray(config.cmds)) {
          return;
        }


        for (var x of config.cmds) {
          var cmd = x.cmd;
          var disableMod = false;
          var disableAdmin = false;
          var disableAny = false;

          if (x.cmd.startsWith("/")) {
            cmd = x.cmd.substring(1);
          }
          var permName = `${config.id}_${cmd.toUpperCase()}`;
          if (x.disableMod && typeof x.disableMod === "boolean") {
            disableMod = x.disableMod;
            if (ex.groups["moderator"].indexOf(permName) === -1) {
              ex.groups["moderator"].push(permName);
            }
          }
          if (x.disableAdmin && typeof x.disableAdmin === "boolean") {
            disableAdmin = x.disableAdmin;
            if (ex.groups["administrator"].indexOf(permName) === -1) {
              ex.groups["administrator"].push(permName);
            }
          }
          if (x.disableAny && typeof x.disableAny === "boolean") {
            disableAny = x.disableAny;
            if (ex.groups["anyone"].indexOf(permName) === -1) {
              ex.groups["anyone"].push(permName);
            }
          }

          ex.extensionCmdAlias.push({
            ext: config.id || id,
            cmd: cmd.toUpperCase(),
            callback: x.callback,
            disableAdmin: disableMod,
            disableMod: disableAdmin,
            displayName: x.displayName,
            permName: permName
          });
          //console.log("Registering cmd... "+cmd.toUpperCase());
          ex.addGroupPermissionUI(ex.id+"_"+permName,x.displayName,disableAdmin,disableMod,disableAny);
        }
        ex.save();

      }

    };

    ex.unregisterExtension = function(id) {
      for (var i = 0; i < ex.extensionCmdAlias.length; i++) {
        if (ex.extensionCmdAlias[i].ext === id) {
          ex.removeGroupPermissionUI(ex.extensionCmdAlias[i].permName);
          ex.extensionCmdAlias.splice(i,1);

        }
      }
      ex.save();
    };

    ex.registerLoadedExtensions = function() {
      var extensions = JSON.parse(localStorage.getItem("mb_extensions"));
      for (var x of extensions) {
        if (x !== ex.id && window[x]) {
          ex.registerExtension(x);
        }
      }
    };


    function installAwesome() {
      var ready = [false,false];
      return new Promise(function(resolve){
        if (!document.querySelector("link[href='//cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.1/awesomplete.min.css']")) {
          var sty = document.createElement("link");
          sty.rel = "stylesheet";
          sty.href = "//cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.1/awesomplete.min.css";
          document.head.appendChild(sty);
          sty.onload = function() {
            ready[0] = true;
            if (ready[1]) {
              resolve();
            }
          }
        } else {
          ready[0] = true;
        }
        if (!document.querySelector("script[href='//cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.1/awesomplete.min.js']")) {
          var scr = document.createElement("script");
          scr.src = "//cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.1/awesomplete.min.js";
          document.head.appendChild(scr);
          scr.onload = function() {
            ready[1] = true;
            if (ready[0]) {
              resolve();
            }
          }
        } else {
          ready[1] = true;
          if (ready[0]) {
            resolve();
          }
        }
      });

    };


    ex.loadStorage();

    installAwesome().then(function(){
      ex.createTab();
      ex.hook.listen("extension.install",ex.registerExtension);
      ex.hook.listen("extension.uninstall",ex.unregisterExtension);
      ex.registerLoadedExtensions();
    });
    setTimeout(function () { ex.hook.listen("world.command", ex.commandHandler); }, 1000); //Do not run any old cmds.


})(DaPgroupManagement);
