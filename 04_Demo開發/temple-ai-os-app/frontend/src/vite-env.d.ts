/// <reference types="vite/client" />

declare module "@surface-app" {
  import type { ComponentType } from "react";

  const App: ComponentType;
  export default App;
}

declare const __APP_BUILD_TIME__: number;
declare const __APP_VERSION__: string;
