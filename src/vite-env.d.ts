/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@autoxing/robot-js-sdk-dev/index.js'
declare module '@autoxing/robot-js-sdk/index.js'