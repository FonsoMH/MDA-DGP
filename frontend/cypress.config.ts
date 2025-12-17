// import { defineConfig } from "cypress";

// export default defineConfig({
//   e2e: {
//     setupNodeEvents(on, config) {
//       // implement node event listeners here
//     },
//   },
// });

import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  projectId: "8d33dv"
});


// EJECUTAR PARA VER RESULTADOS EN WEB:
// npx cypress run --record --key 4d46bcd6-6d01-4298-a14d-b4dbd62e1fc9