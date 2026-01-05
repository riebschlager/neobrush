/// <reference types="vite/client" />

declare module 'vuetify/styles' {
  const styles: string
  export default styles
}

declare module 'vuetify/lib/components' {
  export * from 'vuetify/components'
}

declare module 'vuetify/lib/directives' {
  export * from 'vuetify/directives'
}
