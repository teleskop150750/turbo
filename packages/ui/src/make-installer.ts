import type { App, Plugin } from "vue";

const INSTALLED_KEY = Symbol("INSTALLED_KEY");
const version = "0.0.0-dev.1";
export const makeInstaller = (components: Plugin[] = []) => {
  const install = (app: App) => {
    if (
      (app as unknown as Record<typeof INSTALLED_KEY, boolean>)[INSTALLED_KEY]
    ) {
      return;
    }

    (app as unknown as Record<typeof INSTALLED_KEY, boolean>)[INSTALLED_KEY] =
      true;
    components.forEach((c) => app.use(c));
  };

  return {
    version,
    install,
  };
};
