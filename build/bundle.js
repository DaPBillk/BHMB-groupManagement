(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@bhmb/bot')) :
  typeof define === 'function' && define.amd ? define(['@bhmb/bot'], factory) :
  (global = global || self, factory(global['@bhmb/bot']));
}(this, function (bot) { 'use strict';

  bot.MessageBot.registerExtension("dapersonmgn/groupManagement", ex => {
      /**
       * Listener for when an extension is registered.
       * @param extension Name of the extension.
       */
      const handleExtensionRegister = (extension) => {
          const extensionExports = ex.bot.getExports(extension);
          if (extensionExports && extensionExports.groupManagement) ;
      };
      /**
       * Listener for when an extension is deregistered.
       * @param extension Name of the extension.
       */
      const handleExtensionDeregister = (extension) => {
          const extensionExports = ex.bot.getExports(extension);
          if (extensionExports && extensionExports.groupManagement) ;
      };
      /**
       * Loads all extensions that were loaded before this extension.
       */
      const handleExistingExtensions = () => {
          const extensions = bot.MessageBot.extensions;
          for (const extension of extensions) {
              handleExtensionRegister(extension);
          }
      };
      ex.remove = () => {
          bot.MessageBot.extensionRegistered.unsub(handleExtensionRegister);
          bot.MessageBot.extensionDeregistered.unsub(handleExtensionDeregister);
      };
      bot.MessageBot.extensionRegistered.sub(handleExtensionRegister);
      bot.MessageBot.extensionDeregistered.sub(handleExtensionDeregister);
      handleExistingExtensions();
  });
  //# sourceMappingURL=index.js.map

}));
//# sourceMappingURL=bundle.js.map
