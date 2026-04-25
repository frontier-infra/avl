const DEFAULT_SUFFIX = ".agent";
const DEFAULT_MANIFEST_PATH = "/agent.txt";
const DEFAULT_BADGE_SRC =
  "https://raw.githubusercontent.com/frontier-infra/avl/main/assets/avl-badge.svg";

export type AgentViewPathOptions = {
  /** Current human page path, e.g. "/dashboard" or "/journey/J-101". */
  path: string;
  /** Agent-view suffix. Defaults to ".agent". */
  suffix?: string;
  /** Optional canonical origin for absolute URLs. */
  origin?: string;
};

export type AgentViewHeadLinkOptions = AgentViewPathOptions & {
  /** Human-readable title for the alternate representation. */
  title?: string;
};

export type AgentViewBodyLinkOptions = AgentViewPathOptions & {
  /** Link label. Defaults to "Agent view of this page". */
  label?: string;
  /** Optional CSS class for visible footer/header links. */
  className?: string;
  /** Optional id attribute. */
  id?: string;
};

export type AvlBadgeOptions = AgentViewPathOptions & {
  /** Override badge image URL. */
  src?: string;
  /** Manifest URL. Defaults to "/agent.txt". */
  manifestPath?: string;
  /** Package name surfaced in metadata. */
  packageName?: string;
  /** Visible label next to the badge image. Defaults to "agent-ready". */
  label?: string;
};

export type AgentViewLinkHeaderOptions = AgentViewPathOptions & {
  /** Manifest URL. Defaults to "/agent.txt". */
  manifestPath?: string;
};

export function normalizeHumanPath(path: string): string {
  const [pathname = ""] = path.split(/[?#]/, 1);
  const withLead = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const trimmed = withLead.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function resolveAgentViewPath(options: AgentViewPathOptions): string {
  const suffix = normalizeSuffix(options.suffix ?? DEFAULT_SUFFIX);
  const humanPath = normalizeHumanPath(options.path);
  const agentPath = humanPath === "/" ? `/${suffix}` : `${humanPath}${suffix}`;

  if (!options.origin) return agentPath;
  return `${options.origin.replace(/\/+$/, "")}${agentPath}`;
}

function normalizeSuffix(suffix: string): string {
  return suffix.startsWith(".") ? suffix : `.${suffix}`;
}

export function renderAgentViewHeadLinks(
  options: AgentViewHeadLinkOptions
): string {
  const href = escapeHtmlAttribute(resolveAgentViewPath(options));
  const title = escapeHtmlAttribute(options.title ?? "Agent view (AVL v1)");

  return [
    `<link rel="alternate" type="text/agent-view" href="${href}" title="${title}">`,
    `<link rel="agent-view" type="text/agent-view" href="${href}">`,
  ].join("\n");
}

export function renderAgentViewBodyLink(
  options: AgentViewBodyLinkOptions
): string {
  const href = escapeHtmlAttribute(resolveAgentViewPath(options));
  const label = escapeHtmlText(options.label ?? "Agent view of this page");
  const attrs = [
    `href="${href}"`,
    `rel="alternate agent-view"`,
    `type="text/agent-view"`,
    `data-avl-companion="page"`,
  ];

  if (options.id) attrs.push(`id="${escapeHtmlAttribute(options.id)}"`);
  if (options.className) {
    attrs.push(`class="${escapeHtmlAttribute(options.className)}"`);
  }

  return `<a ${attrs.join(" ")}>${label}</a>`;
}

export function renderAvlBadge(options: AvlBadgeOptions): string {
  const agentPath = resolveAgentViewPath(options);
  const manifestPath = options.manifestPath ?? DEFAULT_MANIFEST_PATH;
  const packageName = options.packageName ?? "@frontier-infra/avl";
  const src = options.src ?? DEFAULT_BADGE_SRC;
  const label = options.label ?? "agent-ready";

  const alt = [
    "AVL agent-ready -",
    `This page ships an AVL companion at ${agentPath}.`,
    "Structured @intent, @state, @actions, and @context for AI agents.",
    `Discovery: ${manifestPath} | npm: ${packageName} |`,
    "Spec: https://github.com/frontier-infra/avl",
  ].join(" ");

  return `<div role="group" aria-label="Agent View Layer capabilities" data-agent-discovery="true" data-avl-endpoint="${escapeHtmlAttribute(agentPath)}" data-avl-manifest="${escapeHtmlAttribute(manifestPath)}" data-avl-package="${escapeHtmlAttribute(packageName)}">
  <a href="${escapeHtmlAttribute(agentPath)}" rel="alternate agent-view" type="text/agent-view" title="AVL - Agent view of this page. Same session, structured render.">
    <img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(alt)}">
    <span>${escapeHtmlText(label)}</span>
  </a>
</div>`;
}

export function renderAgentViewLinkHeader(
  options: AgentViewLinkHeaderOptions
): string {
  const humanPath = normalizeHumanPath(options.path);
  const manifestPath = options.manifestPath ?? DEFAULT_MANIFEST_PATH;
  const origin = options.origin?.replace(/\/+$/, "");
  const canonical = origin ? `${origin}${humanPath}` : humanPath;
  const manifest = resolvePathOrUrl(manifestPath, origin);

  return [
    `<${canonical}>; rel="canonical"`,
    `<${manifest}>; rel="agent-manifest"; type="text/plain"`,
  ].join(", ");
}

function resolvePathOrUrl(pathOrUrl: string, origin?: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return origin ? `${origin}${path}` : path;
}

function escapeHtmlAttribute(value: string): string {
  return value.replace(/[&<>"']/g, char => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function escapeHtmlText(value: string): string {
  return value.replace(/[&<>]/g, char => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      default:
        return char;
    }
  });
}
