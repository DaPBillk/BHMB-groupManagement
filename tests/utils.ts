import { MessageBot, Storage, World, MessageBotExtension } from "@bhmb/bot";
import { GroupManagement } from "../src/GroupManagement";
import { UserManager } from "../src/Users/UserManager";
import { GroupManager } from "../src/Groups/GroupManager";
import { Group } from "../src/Groups/Group";
import { PermissionManager } from "../src/Permissions/PermissionManager";
import { WorldLists } from "blockheads-api-interface";
import { PlayerInfo, Player } from "@bhmb/bot/player";
import { Permissions, PermissionsSaveData } from "../src/Permissions/Permissions";

//Thx bib. @_@
class MockStorage extends Storage {
  storage = new Map<string, any>()
  constructor(private _prefix: string = '') {
      super();
  }

  get<T>(key: string, fallback: T): T {
      return this.storage.get(this._prefix + key) || fallback;
  }
  set(key: string, value: any): void {
      this.storage.set(this._prefix + key, value);
  }
  clear(_prefix?: string | undefined): void {
      throw new Error('Not implemented');
  }
  prefix(_prefix: string): Storage {
      return this;
  }
  keys(): string[] {
      throw new Error('Not implemented');
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

const createGroupManager = () => {
  const GM = createGroupManagement();
  return new GroupManager(GM);
};

const createPermissionManager = () => {
  const GM = createGroupManagement();
  return new PermissionManager(GM);
};

const createPermissions = (permissions? : PermissionsSaveData, addPermissions? : string[]) => {
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test"
  });
  if (permissions) {
    const allPermissions = permissions.allowed.concat(permissions.disabled).concat(addPermissions || []);
    for (const p of allPermissions) {
      groupManager.management.permissions.add({
        id: p,
        extension: "test",
        name: "TEST",
        category: "TEST",
        callback: () => {},
        command: "TEST"
      });
    }
  }
  return new Permissions(group as Group, permissions);
};

export {
  createUserManager,
  createGroupManager,
  createPermissionManager,
  createPermissions
};