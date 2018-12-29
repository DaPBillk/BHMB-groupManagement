import * as test from "tape";
import { createPermissionManager } from "../utils";
import { Permission } from "../../src/Permissions/Permission";

test("PermissionManager - create permission", t => {
  t.plan(3);
  const PM = createPermissionManager();
  const data = {
    extension: "test",
    id: "permission",
    name: "Test Permission",
    category: "Test Category",
    command: "TEST",
    callback: () => {}
  };
  const result = PM.add(data);
  t.doesNotEqual(PM.get("permission"), undefined); //The permission should exist.
  t.equals(result, true); //The result should return true.
  t.equals(PM.add(data), false); //Adding it again should return false.
});

test("PermissionManager - delete permission", t => {
  t.plan(2);
  const PM = createPermissionManager();
  PM.add({
    extension: "test",
    id: "permission",
    name: "Test Permission",
    category: "Test Category",
    command: "TEST",
    callback: () => {}
  });
  t.equals(PM.delete("permission"), true);
  t.equals(PM.get("permission"), undefined);
});

test("PermissionManager - retrieve all permissions of an extension", t => {
    t.plan(2);
    const PM = createPermissionManager();
    PM.add({
      extension: "test",
      id: "permission",
      name: "Test Permission",
      category: "Test Category",
      command: "TEST",
      callback: () => {}
    });
    PM.add({
      extension: "test2",
      id: "permissionA",
      name: "Test Permission",
      category: "Test Category",
      command: "TEST",
      callback: () => {}
    });
    PM.add({
      extension: "test",
      id: "permissionB",
      name: "Test Permission",
      category: "Test Category",
      command: "TEST",
      callback: () => {}
    });
    t.equals(PM.getExtensionPermissions("test").length, 2);
    t.equal(PM.getExtensionPermissions("test2").length, 1);
});

test("PermissionManager - get a permission", t => {
  t.plan(2);
  const PM = createPermissionManager();
  PM.add({
    extension: "test",
    id: "permission",
    name: "Test Permission",
    category: "Test Category",
    command: "TEST",
    callback: () => {}
  });
  
  const permission = PM.get("permission");
  t.doesNotEqual(permission, undefined);
  t.doesNotEqual(PM.get(permission as Permission), undefined);
});