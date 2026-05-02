import { itemDocument, llms, manifest, serialize, siteDocument } from "./documents.mjs";

export default (router, { services, getSchema }) => {
  router.get("/agent.txt", (_req, res) => {
    res.type("text/plain; charset=utf-8").send(manifest());
  });

  router.get(["/llms.txt", "/lm.txt"], (_req, res) => {
    res.type("text/plain; charset=utf-8").send(llms());
  });

  router.get("/.agent", (_req, res) => {
    res.type("text/agent-view; version=1; charset=utf-8").send(serialize(siteDocument()));
  });

  router.get("/:collection/:id.agent", async (req, res, next) => {
    try {
      const schema = await getSchema();
      const service = new services.ItemsService(req.params.collection, {
        schema,
        accountability: req.accountability,
      });
      const item = await service.readOne(req.params.id);
      res.type("text/agent-view; version=1; charset=utf-8").send(serialize(itemDocument(req.params.collection, req.params.id, item)));
    } catch (error) {
      next(error);
    }
  });
};
