import * as test from "tape";
import { createPermissions } from "../utils";
import { Permission } from "../../src/Permissions/Permission";

test("Permissions - Returns correct value for if a permission set has a permission.", t => {
  t.plan(5);
  const permissions = createPermissions({
    allowed: ["PERMISSION"],
    disabled: ["DISABLED"]
  }, ["404_2"]);

  //It should return false if the permission does not exist.
  t.equals(permissions.has("404"), false);

  //It should return false if the permission is not in allowed.
  t.equals(permissions.has("404_2"), false);
  t.equals(permissions.has("DISABLED"), false);
  
  //It should return true if the permission is in allowed.
  t.equals(permissions.has("PERMISSION"), true);

  const permission = permissions.parent.manager.management.permissions.get("PERMISSION");
  //This should resolve to "PERMISSION" and return true.
  t.equals(permissions.has(permission as Permission), true);
});

test("Permissions - Adding a permission", t => {
  t.plan(8);
  const permissions = createPermissions({
    allowed: ["ALLOWED"],
    disabled: ["DISABLED"]
  }, ["NOT_DISABLED_YET", "NOT_DISABLED_YET_2", "ALLOW_ME"]);

  //Adding a permission that was not registered should return false.
  t.equals(permissions.add("404"), false);

  //Adding a permission that is registered but not included should return true.
  t.equals(permissions.add("ALLOW_ME"), true);

  //Adding a permission which is disabled should return false.
  t.equals(permissions.add("DISABLED"), false);

  //Adding a permission already added should return false.
  t.equals(permissions.add("ALLOWED"), false);

  //Adding a permission which is disabled in sudo mode should return true.
  t.equals(permissions.add("DISABLED", true), true);

  //Adding a permission marked disabled should add a disabled permission.
  t.equals(permissions.add("NOT_DISABLED_YET", false, true), true);

  //Adding a permission that is not marked as disabled however is allowed should return true
  permissions.add("NOT_DISABLED_YET_2");
  t.equals(permissions.add("NOT_DISABLED_YET_2", false, true), true);

  //Adding a permission already disabled with the intent of disabling it again should return false.
  t.equals(permissions.add("NOT_DISABLED_YET_2", false, true), false);
});

test("Permissions - Deleting a permission", t => {
  t.plan(3);
  const permission = createPermissions({
    allowed: ["ALLOWED", "CANNOT_DELETE"],
    disabled: ["DISABLED", "CANNOT_DELETE"]
  });

  //Deleting a non-existent permission should return false.
  t.equals(permission.delete("404"), false);

  //Deleting a disabled enabled permission without sudo should return false.
  t.equals(permission.delete("CANNOT_DELETE"), false);

  //Deleting a disabled enabled permission with sudo should return true.
  t.equals(permission.delete("CANNOT_DELETE", true), true);
});