import * as test from "tape";
import { createUserManager } from "../utils";

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