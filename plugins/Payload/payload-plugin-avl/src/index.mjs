import { collectionDocument, llms, manifest, serialize, siteDocument } from "./documents.mjs";

function text(body, contentType = "text/plain; charset=utf-8", status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=60",
    },
  });
}

export function avlPlugin() {
  return (config) => ({
    ...config,
    endpoints: [
      ...(config.endpoints || []),
      { path: "/agent.txt", method: "get", root: true, handler: async () => text(manifest()) },
      { path: "/llms.txt", method: "get", root: true, handler: async () => text(llms()) },
      { path: "/lm.txt", method: "get", root: true, handler: async () => text(llms()) },
      { path: "/.agent", method: "get", root: true, handler: async () => text(serialize(siteDocument()), "text/agent-view; version=1; charset=utf-8") },
      {
        path: "/:collection/:id.agent",
        method: "get",
        root: true,
        handler: async (req) => {
          const { collection, id } = req.routeParams || {};
          try {
            const doc = await req.payload.findByID({ collection, id });
            return text(serialize(collectionDocument(collection, id, doc)), "text/agent-view; version=1; charset=utf-8");
          } catch {
            return text(serialize({
              meta: { v: 1, route: `/${collection}/${id}`, generated: new Date().toISOString(), ttl: "1m" },
              intent: { purpose: "Payload agent view not found", audience: ["agent"], capability: ["read"] },
              state: { found: false, collection, id },
              context: "No Payload document resolved for this AVL route.",
            }), "text/agent-view; version=1; charset=utf-8", 404);
          }
        },
      },
    ],
  });
}

export default avlPlugin;
