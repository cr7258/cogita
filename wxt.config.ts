import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    default_locale: 'en',
    description: '__MSG_extension_description__',
    host_permissions: ['<all_urls>'],
    name: '__MSG_extension_name__',
    permissions: ['sidePanel','storage','scripting','tabs'],
  },
  modules: [
    '@wxt-dev/module-react',
    '@wxt-dev/auto-icons',
    '@wxt-dev/i18n/module',
  ],
  srcDir: 'src',
})
