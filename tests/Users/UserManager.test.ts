import * as test from "tape";
import { createUserManager, createExtension } from "../utils";
import { UserSaveData } from "../../src/Users/User";
import { GroupManagement } from "../../src/GroupManagement";
import { UserManager } from "../../src/Users/UserManager";

test("UserManager - Retrieve a user", t => {
  t.plan(2);
  const UM = createUserManager();
  const user = UM.get("TEST");
  t.doesNotEqual(user, undefined);
  t.equals(UM.get(user.player), user);
});

test("UserManager - Delete a user", t => {
  t.plan(2);
  const UM = createUserManager();
  const user = UM.get("TEST");
  t.equals(UM.delete(user), true);
  t.equals(UM.delete(user), false);
});

test("UserManager - Loads users properly.", t => {
  t.plan(1);
  const extension = createExtension();
  extension.storage.set("users", [
    {
      player: "TEST",
      permissions: {
        allowed: ["ALLOWED"],
        disabled: []
      }
    }
  ] as UserSaveData[]);
  const groupManagement = new GroupManagement(extension);
  const userManager = new UserManager(groupManagement);
  t.equals(userManager.get("TEST").permissions.allowed.has("ALLOWED"), true);
});