import * as test from "tape";
import { MessageBot, Storage, World, MessageBotExtension } from "@bhmb/bot";
import { GroupManagement } from "../../src/GroupManagement";
import { UserManager } from "../../src/Users/UserManager";
import { WorldLists } from "blockheads-api-interface";
import { PlayerInfo, Player } from "@bhmb/bot/player";

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

//Thanks again. >.<
const defaultInfo: PlayerInfo = { ip: '0.0.0.0', ips: ['0.0.0.0', '0.0.0.1'], joins: 1};
const lists = { adminlist: [], modlist: [], whitelist: [], blacklist: [] };
const makePlayer = (name : string, lists2: Partial<WorldLists> = {}, info : Partial<PlayerInfo> = {}) => {
  return new Player(name, {...defaultInfo, ...info}, {...lists, ...lists2});
};

const createWorld = () : World => ({
  getPlayer: (name : string) => makePlayer(name)
} as any);

const createBot = () : MessageBot => ({
  world: createWorld(),
  storage: new MockStorage()
}) as any;

const createExtension = () => new MessageBotExtension("test", createBot());

const createGroupManagement = () => new GroupManagement(createExtension());

const createUserManager = () => {
  const GM = createGroupManagement();
  return new UserManager(GM);
};

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