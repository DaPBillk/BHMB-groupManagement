import * as test from "tape";
import { MessageBot, Storage, World, MessageBotExtension } from "@bhmb/bot";
import { GroupManagement } from "../../src/GroupManagement";
import { PermissionManager } from "../../src/Permissions/PermissionManager";
import { Permission } from "../../src/Permissions/Permission";

//Thx bib. @_@
class MockStorage extends Storage {
  storage = new Map<string, any>()
  constructor(private _prefix: string = '') {
      super()
  }

  get<T>(key: string, fallback: T): T {
      return this.storage.get(this._prefix + key) || fallback
  }
  set(key: string, value: any): void {
      this.storage.set(this._prefix + key, value)
  }
  clear(_prefix?: string | undefined): void {
      throw new Error('Not implemented')
  }
  prefix(_prefix: string): Storage {
      return this;
  }
  keys(): string[] {
      throw new Error('Not implemented')
  }
};

const createWorld = () => ({} as World);

const createBot = () : MessageBot => ({
  world: createWorld(),
  storage: new MockStorage()
}) as any;

const createExtension = () => new MessageBotExtension("test", createBot());

const createGroupManagement = () => new GroupManagement(createExtension());

const createPermissionManager = () => {
  const GM = createGroupManagement();
  return new PermissionManager(GM);
};

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