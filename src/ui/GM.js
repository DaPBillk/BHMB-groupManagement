var ui = {};

ui.createTab = function(GM) {
  var _this = this;
  this.ui = GM.ui;
  this.System = GM.System;
  this.Management = GM.Management;

  var parentTab = this.ui.addTabGroup("Group Management", "groupManagementTab");

  this.groupTabs = {};

  this.addPermission = function(permission) {
    var categoryParent = permission.category.substring(0, permission.category.indexOf("/"));
    var category = permission.category.substring(permission.category.indexOf("/")+1);
    for (var tabID in this.groupTabs) {
      var tab = this.groupTabs[tabID];
      //check if category already exists.
      if (!tab.querySelector("p[data-category='"+categoryParent.toLowerCase()+"']")) { //Jk. This doesn't break.
        tab.querySelector(".menu").innerHTML += "<p class='menu-label' data-category='"+categoryParent.toLowerCase()+"'>"+this.Management.categories[categoryParent.toLowerCase()].name+"</p><ul class='menu-list' data-category='"+categoryParent.toLowerCase()+"'></ul>";
      }
      //now we should add the subcategory.

      if (!tab.querySelector("ul[data-category='"+categoryParent.toLowerCase()+"']").querySelector("a[data-id='"+category.toLowerCase()+"']")) {
        tab.querySelector("ul[data-category='"+categoryParent.toLowerCase()+"']").innerHTML += "<li><a href='#' data-id='"+category.toLowerCase()+"'>"+this.Management.categories[categoryParent.toLowerCase()].subcategories[category.toLowerCase()].name+"</a></li>"
        tab.querySelector(".groupManagementPermissionEditing").innerHTML += "<div data-tab='"+category.toLowerCase()+"' class='groupManagementHidden'><div class='columns'><div class='column'></div><div class='column'></div></div></div>";
      }
      //now add the permission.

      var permissionTab = tab.querySelector("div[data-tab='"+category.toLowerCase()+"']");
      var column1 = permissionTab.querySelector(".column").querySelectorAll("p").length;
      var column2 = permissionTab.querySelectorAll(".column")[1].querySelectorAll("p").length;

      if (column1 === column2) {
        permissionTab.querySelector(".column").innerHTML += require("./html/permission.html").replace("{PERMISSION}",permission.displayName).replace("{ID}",permission.namespace.toUpperCase());
      } else if (column1 > column2) {
        permissionTab.querySelectorAll(".column")[1].innerHTML += require("./html/permission.html").replace("{PERMISSION}",permission.displayName).replace("{ID}",permission.namespace.toUpperCase());
      } else {
        permissionTab.querySelector(".column").innerHTML += require("./html/permission.html").replace("{PERMISSION}",permission.displayName).replace("{ID}",permission.namespace.toUpperCase());
      }

    }
  };

  this.addGroupTab = function(groupObj) {
    if (this.groupTabs[groupObj.id]) {
      throw new Error("Tab Group already exists.");
    }
    this.groupTabs[groupObj.id] = this.ui.addTab(groupObj.name, "groupManagementTab");
    var gTab = this.groupTabs[groupObj.id];
    gTab.innerHTML = "<style>"+require("./html/tab.css")+"</style>" + require("./html/tab.html");

    gTab.querySelector(".title").textContent = groupObj.name;
    for (var categoryParent in this.Management.categories) {
      var categoryHTML = "";
      categoryHTML += "<p class='menu-label' data-category='"+categoryParent+"'>"+this.Management.categories[categoryParent].name+"</p><ul class='menu-list' data-category='"+categoryParent+"'>";
      for (var subcategoryID in this.Management.categories[categoryParent].subcategories) {
        categoryHTML += "<li><a href='#' data-id='"+subcategoryID+"'>"+this.Management.categories[categoryParent].subcategories[subcategoryID].name+"</a></li>";
        //we also need to add a new div to the tab because containers for permissions and stuff. >.>
        gTab.querySelector(".groupManagementPermissionEditing").innerHTML += "<div data-tab='"+subcategoryID+"' class='groupManagementHidden'><div class='columns'><div class='column'></div><div class='column'></div></div></div>";
        var colNum = 0;

        for (var permission of this.Management.categories[categoryParent].subcategories[subcategoryID].permissions) {
          if (colNum > 1) {
            colNum = 0;
          }
          gTab.querySelector("div[data-tab='"+subcategoryID+"']").querySelectorAll(".column")[colNum].innerHTML += require("./html/permission.html").replace("{PERMISSION}",permission.displayName).replace("{ID}",permission.namespace);
          if (groupObj.permissions.indexOf(permission.namespace.toUpperCase()) > -1) {
            gTab.querySelector("input[data-permission='"+permission.namespace+"']").setAttribute("checked","");
          }

          if (groupObj.disabledPermissions.indexOf(permission.namespace.toUpperCase()) > -1) {
            gTab.querySelector("input[data-permission='"+permission.namespace+"']").setAttribute("disabled","");
          }
          colNum++;
        }
      }
      categoryHTML += "</ul>";
      gTab.querySelector(".menu").innerHTML += categoryHTML;
    }

    gTab.addEventListener("click",function(e){
      var el = e.target;
      if (el.tagName === "A") {
        if (el.getAttribute("data-id")) {
          //sidemenu. >.>
          gTab.querySelector("div[data-tab='"+ gTab.querySelector(".is-active").getAttribute("data-id") +"']").setAttribute("class","groupManagementHidden");
          gTab.querySelector(".is-active").removeAttribute("class");
          el.setAttribute("class","is-active");
          gTab.querySelector("div[data-tab='"+el.getAttribute("data-id")+"']").removeAttribute("class");
        } else if (el.getAttribute("data-action")){
          if (el.getAttribute("data-action") === "delete") {
            if (groupObj.unremoveable) {
              _this.ui.alert("Group cannot be removed.");
              return;
            }
            _this.ui.alert("Are you sure you want to delete this group?",[
              "Delete",
              "Cancel"
            ], function(action){
              if (action === "Cancel") {return}
              _this.Management.destroyGroup(groupObj.id);
              _this.removeGroupTab(groupObj);
            });
          } else if (el.getAttribute("data-action") === "rename") {
            //rename
            if (groupObj.unremoveable) {
              _this.ui.alert("Group cannot be renamed.");
              return;
            }
            _this.ui.prompt("What's the new group name?", function(groupName){
              //TODO: What the heck. What is cancel???
              try {
                _this.Management.createGroup(groupName, groupObj.permissions, groupObj.players, groupObj.disabledPermissions);
                _this.Management.destroyGroup(groupObj.name);
                gTab.querySelector(".title").textContent = groupName;
                _this.ui.notify("Group renamed!",5);
              } catch (err) {
                //group already exists.
                _this.ui.notify("Group already exists.",5);
              }
            });
          } else {
            //new group.
            _this.ui.prompt("What's the new group name?", function(groupName){
              groupName = groupName.replace(/[^a-zA-Z]/g, "");
              try {
                _this.Management.createGroup(groupName);
                _this.addGroupTab(_this.System.groups[groupName]);
                _this.ui.notify("Group created!",5);
              } catch (err) {
                //group already exists.
                _this.ui.notify("Group already exists.",5);
              }
            });
          }
        }
      }
    });

    gTab.addEventListener("change", function(e){
      var el = e.target;
      if (el.tagName === "INPUT") {
        if (el.getAttribute("data-permission")) {
          //permission change.
          groupObj.setPermission(el.getAttribute("data-permission"), el.checked);
        }
      }
    });

    if (!gTab.querySelector("li > a")) {return}
    gTab.querySelector("li > a").setAttribute("class","is-active");
    gTab.querySelector("div[data-tab='"+ gTab.querySelector("li > a").getAttribute("data-id") +"']").removeAttribute("class");


  };

  this.removeGroupTab = function(groupObj) {
    this.ui.removeTab(this.groupTabs[groupObj.id]);
    delete this.groupTabs[groupObj.id];
  };

  for (var groupID in this.System.groups) {
    this.addGroupTab(this.System.groups[groupID]);
  }

  this.Management.setUI(this);

};

module.exports = ui;
