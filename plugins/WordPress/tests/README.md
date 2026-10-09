Run against the disposable site created by `scripts/bootstrap.sh`:

```bash
bash plugins/WordPress/scripts/test-plugin.sh
bash plugins/WordPress/scripts/test-negotiation-tables.sh
```

The regression script installs a temporary document filter and header fixture, runs PHP serializer assertions through WP-CLI, and checks live HTTP negotiation. It removes its mu-plugin fixtures on exit. The public Pricing page remains in the disposable site. Uniform and mixed row fixtures cover tabular output, scalar quoting, key order, and fallback encoding. Header checks cover existing Vary fields, duplicates, wildcard preservation, negotiable pages, explicit endpoints, feeds, and missing pages.
