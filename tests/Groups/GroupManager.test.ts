import * as test from "tape";
import { createGroupManager, createExtension } from "../utils";
import { Group, GroupSaveData } from "../../src/Groups/Group";
import { GroupManagement } from "../../src/GroupManagement";
import { GroupManager } from "../../src/Groups/GroupManager";

test("GroupManager - create group", t => {
  t.plan(1);
  const groupManager = createGroupManager();
  groupManager.add({
    name: "test"
  });
  t.doesNotEqual(groupManager.get("test"), undefined);
});

test("GroupManager - does not create group if group name already exists.", t => {
  t.plan(1);
  const groupManager = createGroupManager();
  groupManager.add({
    name: "test"
  });
  t.equals(groupManager.add({
    name: "test"
  }), undefined);
});

test("GroupManager - deletes group", t => {
  t.plan(3);
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test"
  });
  t.doesNotEqual(group, undefined);
  t.equals(groupManager.delete(group as Group), true);
  t.equals(groupManager.get("test"), undefined);
});

test("GroupManager - renames group", t => {
  t.plan(4);
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test"
  });
  t.equals(groupManager.rename(group as Group, "test2"), true);
  t.equals(groupManager.get("test2"), group);
  t.equals(groupManager.get("test"), undefined);
  t.equal((group as Group).name, "test2");
});

test("GroupManager - does not rename group if group is managed.", t => {
  t.plan(4);
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test",
    managed: true
  });
  t.equals(groupManager.rename(group as Group, "test2"), false);
  t.equals(groupManager.get("test2"), undefined);
  t.equals(groupManager.get("test"), group);
  t.equals((group as Group).name, "test");
});

test("GroupManager - does not rename group if the group name already exists", t => {
  t.plan(4);
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test"
  });
  const group2 = groupManager.add({
    name: "test2"
  });
  t.equals(groupManager.rename(group as Group, "test2"), false);
  t.equals(groupManager.get("test2"), group2);
  t.equals((group as Group).name, "test");
  t.equals(groupManager.get("test"), group);
});

test("GroupManager - retrieves a group", t => {
  t.plan(2);
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test"
  });
  t.equals(groupManager.get((group as Group).name), group);
  t.equals(groupManager.get((group as Group).id), group);
});

test("GroupManager - next ID should increment upon a group being created.", t => {
  t.plan(2);
  const groupManager = createGroupManager();
  t.equals(groupManager.nextID, 1);
  groupManager.add({
    name: "test"
  });
  t.equals(groupManager.nextID, 2);
});

test("GroupManager - Loads groups properly.", t => {
  t.plan(1);
  const extension = createExtension();
  extension.storage.set("groups", [
    {
      id: -1,
      name: "Group",
      permissions: {
        allowed: [],
        disabled: []
      },
      players: [],
      managed: false
    }
  ] as GroupSaveData[]);
  const groupManagement = new GroupManagement(extension);
  const groupManager = new GroupManager(groupManagement);
  t.doesNotEqual(groupManager.get("Group"), undefined);
});