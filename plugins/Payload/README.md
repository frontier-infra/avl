# AVL Agent View Layer for Payload

This folder contains the Payload CMS plugin MVP for AVL.

## What It Adds

- `GET /agent.txt`
- `GET /llms.txt`
- `GET /lm.txt`
- `GET /.agent`
- `GET /:collection/:id.agent`

## Install

Import `payload-plugin-avl` into a Payload config and add it to the `plugins` array.

```ts
import { avlPlugin } from './plugins/Payload/payload-plugin-avl/src/index'

export default buildConfig({
  plugins: [avlPlugin()],
})
```

## Notes

The MVP injects root endpoints and reads collection documents through `req.payload.findByID`. Production deployments should define collection allowlists and map Payload routes to the public front end.
