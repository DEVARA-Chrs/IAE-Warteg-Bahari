# payment-service (patched)

This service was missing `package.json` in the original project, which breaks Docker builds.
A minimal `package.json` has been added so `npm install` can run inside the container.
