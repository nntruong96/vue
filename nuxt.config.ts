// filename - nuxt.config.ts
import { nodePolyfills } from "@bangjelkoski/vite-plugin-node-polyfills";

export default defineNuxtConfig({
  ssr: false, // whether to pre-render your application
  modules: [],

  typescript: {
    typeCheck: "build", // we recommend build so you do typescript checks only on build type
  },

  imports: {
    // automatic imports of store definitions (if you use pinia)
    dirs: ["store/**"],
  },

  // pinia: {
  //   // import pinia definitions
  //   autoImports: ["defineStore"],
  // },

  plugins: [
    {
      // import the buffer plugin we've made
      src: "./plugins/buffer.client.ts",
      ssr: false,
    },
  ],

  // We generate only sitemaps for the client side as we don't need a server
  // Note: there is a problem with sitemaps for Vite + Nuxt3
  // as usually is that it takes to much time/memory to generate
  // sitemaps and the build process can fail
  // on Github Actions/Netlify/Vercel/etc so we have to use another
  // strategy like generating them locally and them pushing them to services like
  // busgnag
  sourcemap: {
    server: false,
    client: true,
  },

  // Vite related config
  vite: {
    define: {
      "process.env": JSON.stringify({}),
      "process.env.DEBUG": JSON.stringify(process.env.DEBUG),
    },

    plugins: [
      // setting up node + crypto polyfils
      nodePolyfills({ protocolImports: false }),
    ],

    build: {
      sourcemap: false, // we don't generate

      // default rollup options
      rollupOptions: {
        cache: false,
        output: {
          manualChunks: (id: string) => {
            //
          },
        },
      },
    },

    // needed for some Vite related issue for the
    // @bangjelkoski/vite-plugin-node-polyfills plugin
    optimizeDeps: {
      exclude: ["fsevents"],
    },
  },
});
