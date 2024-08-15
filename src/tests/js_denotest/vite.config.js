/**
 * @file vitest config file
 *
 * For modify test file name patterns.
 * Default is including `.test.` or `.spec.`.
 * This config modify it to match `Test_*.js`, for follow test coding convention. (see `CONTRIBUTING.md`)
 *
 * @author aKuad
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ["**/Test_*.js"]
  },
})
