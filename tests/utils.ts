import { MessageBot, Storage, World, MessageBotExtension } from "@bhmb/bot";
import { GroupManagement } from "../src/GroupManagement";
import { Group } from "../src/Groups/Group";
import { WorldApi, WorldStatus, WorldSizes, WorldPrivacy, WorldOverview } from "blockheads-api-interface";
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
const lists = { adminlist: [], modlist: [], whitelist: [], blacklist: [] };

const overview: WorldOverview = Object.freeze({
  name: 'WORLD',
  owner: 'OWNER',
  created: new Date(),
  last_activity: new Date(),
  credit_until: new Date(),
  link: 'link',
  pvp: false,
  privacy: 'public' as WorldPrivacy, // Inferring types is broken here
  password: false,
  size: '1x' as WorldSizes, // Ditto
  whitelist: false,
  online: ['ONLINE'],
  status: 'online' as WorldStatus
});

const api: WorldApi = {
  get name() { return 'hi' },
  get id() { return '123' },
  async getStatus() { return 'online' as WorldStatus },
  async getLists() { return lists },
  async setLists() { },
  async getOverview() { return overview },
  async getLogs() { return [] },
  async send(_message: string) { },
  async getMessages(_lastId: number) { return { nextId: 0, log: [] } },
  async start() { },
  async stop() { },
  async restart() { }
};

const createBot = () : MessageBot => ({
  world: new World(api, new MockStorage()),
  storage: new MockStorage()
}) as any;

const createExtension = () => new MessageBotExtension("test", createBot());

const createGroupManagement = () => new GroupManagement(createExtension());

const createUserManager = () => {
  const GM = createGroupManagement();
  return GM.users;
};

const createGroupManager = () => {
  const GM = createGroupManagement();
  return GM.groups;
};

const createPermissionManager = () => {
  const GM = createGroupManagement();
  return GM.permissions;
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