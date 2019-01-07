import * as test from "tape";
import { createPermissionManager } from "../utils";
import { Permission } from "../../src/Permissions/Permission";
import { Player } from "@bhmb/bot";

const createAdmin : any = () => ({isAdmin: true, isStaff: true, name: "EXAMPLE"}) as Player;
const createMod : any = () => ({isMod: true, isStaff: true, name: "EXAMPLE"}) as Player;

test("Permission - runs callback for command when called with proper permissions.", t => {
  t.plan(1);
  const PM = createPermissionManager();
  let called = false;
  PM.add({
    extension: "TEST",
    id: "HANDLE_ME",
    name: "Permission",
    category: "Permission",
    command: "HELP",
    callback () {
      called = true;
    }
  });
  PM.add({
    extension: "TEST",
    id: "DO_NOT_HANDLE_ME",
    name: "Permission",
    category: "Permission",
    command: "DONOTRUN",
    callback () {
      t.fail("The callback was called for a command that was not supposed to be run.");
    }
  });
  const permission = PM.get("HANDLE_ME") as Permission;

  const user = PM.management.users.get("EXAMPLE");
  user.permissions.add(permission);

  const { player } = user;

  permission.handleMessage({
    player,
    message: "/HELP"
  });
  permission.handleMessage({
    player,
    message: "/DONUTRUN"
  });
  t.equals(called, true);
});

test("Permission - does not run callback if command is not to be run by admins.", t => {
  t.plan(1);
  const PM = createPermissionManager();
  let called = false;
  PM.add({
    extension: "TEST",
    id: "DONOTRUN",
    name: "Permission",
    category: "Permission",
    command: "DONOTRUN",
    ignore: {
      admin: true
    },
    callback () {
      called = true;
    }
  });

  const user = PM.management.users.get("EXAMPLE");
  user.permissions.add("DONOTRUN");
  const admin = createAdmin();
  const permission = PM.get("DONOTRUN") as Permission;

  permission.handleMessage({
    player: admin,
    message: "/DONOTRUN"
  });

  t.equals(called, false);

});

test("Permission - does not run callback if command is not to be run by mods.", t => {
  t.plan(1);
  const PM = createPermissionManager();
  let called = false;
  PM.add({
    extension: "TEST",
    id: "DONOTRUN",
    name: "Permission",
    category: "Permission",
    command: "DONOTRUN",
    ignore: {
      mod: true
    },
    callback () {
      called = true;
    }
  });

  const user = PM.management.users.get("EXAMPLE");
  user.permissions.add("DONOTRUN");
  const mod = createMod();
  const permission = PM.get("DONOTRUN") as Permission;

  permission.handleMessage({
    player: mod,
    message: "/DONOTRUN"
  });

  t.equals(called, false);

});

test("Permission - does not run callback if command is not to be run by staff.", t => {
  t.plan(1);
  const PM = createPermissionManager();
  let called = false;
  PM.add({
    extension: "TEST",
    id: "DONOTRUN",
    name: "Permission",
    category: "Permission",
    command: "DONOTRUN",
    ignore: {
      staff: true
    },
    callback () {
      called = true;
    }
  });

  const user = PM.management.users.get("EXAMPLE");
  user.permissions.add("DONOTRUN");
  const mod = createMod();
  const permission = PM.get("DONOTRUN") as Permission;

  permission.handleMessage({
    player: mod,
    message: "/DONOTRUN"
  });

  t.equals(called, false);

});