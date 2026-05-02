<?php

namespace Drupal\avl_agent_view_layer\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpFoundation\Response;

final class AvlController extends ControllerBase {
  private function text(string $body, string $content_type = 'text/plain; charset=utf-8', int $status = 200): Response {
    return new Response($body, $status, [
      'Content-Type' => $content_type,
      'Cache-Control' => 'public, max-age=60',
      'Vary' => 'Accept',
    ]);
  }

  public function manifest(): Response {
    $site = \Drupal::config('system.site')->get('name') ?: 'Drupal site';
    $body = implode("\n", [
      '# AVL Manifest',
      '',
      'version: 1',
      'content-type: text/agent-view; version=1',
      'producer: drupal',
      'site: ' . $site,
      '',
      'discovery:',
      '  - suffix',
      '  - manifest',
      '',
      'routes:',
      '  - GET /.agent',
      '  - GET /{path}.agent',
      '',
      'related:',
      '  llms: /llms.txt',
      '  lm: /lm.txt',
      '',
    ]);

    return $this->text($body);
  }

  public function llms(): Response {
    $site = \Drupal::config('system.site')->get('name') ?: 'Drupal site';
    $body = implode("\n", [
      '# ' . $site,
      '',
      '> Drupal site with Agent View Layer support.',
      '',
      '## Agent and AI discovery',
      '',
      '- AVL manifest: /agent.txt',
      '- Site agent view: /.agent',
      '- Agent view pattern: /{path}.agent',
      '- Content type: text/agent-view; version=1',
      '',
      '## Standards readiness',
      '',
      '- AVL - agent companion routes: pass',
      '- AEO - answer-engine discoverability: pass',
      '- GEO - generative-engine context: pass',
      '- llms.txt - language-model summary: pass',
      '',
    ]);

    return $this->text($body);
  }

  public function site(): Response {
    $site = \Drupal::config('system.site');
    $document = [
      'meta' => ['v' => 1, 'route' => '/', 'generated' => gmdate(DATE_ATOM), 'ttl' => '5m'],
      'intent' => ['purpose' => 'Drupal site: ' . ($site->get('name') ?: 'Untitled'), 'audience' => ['visitor', 'agent'], 'capability' => ['read', 'navigate']],
      'state' => ['name' => $site->get('name'), 'slogan' => $site->get('slogan')],
      'actions' => [['id' => 'view_human', 'method' => 'GET', 'href' => \Drupal::request()->getSchemeAndHttpHost() . '/']],
      'context' => 'This Drupal site exposes AVL companion views for public content.',
      'nav' => ['self' => '/.agent', 'drilldown' => '/{path}.agent'],
    ];

    return $this->text($this->serialize($document), 'text/agent-view; version=1; charset=utf-8');
  }

  public function content(string $path): Response {
    $alias = '/' . trim($path, '/');
    $internal = \Drupal::service('path_alias.manager')->getPathByAlias($alias);
    if (!preg_match('#^/node/(\d+)$#', $internal, $matches)) {
      return $this->notFound($alias);
    }

    $node = Node::load((int) $matches[1]);
    if (!$node || !$node->isPublished()) {
      return $this->notFound($alias);
    }

    $document = [
      'meta' => ['v' => 1, 'route' => $alias, 'generated' => gmdate(DATE_ATOM), 'ttl' => '5m'],
      'intent' => ['purpose' => 'Drupal ' . $node->bundle() . ': ' . $node->label(), 'audience' => ['visitor', 'agent'], 'capability' => ['read', 'navigate']],
      'state' => [
        'id' => $node->id(),
        'type' => $node->bundle(),
        'title' => $node->label(),
        'url' => \Drupal::request()->getSchemeAndHttpHost() . $alias,
        'published' => gmdate(DATE_ATOM, (int) $node->getCreatedTime()),
        'modified' => gmdate(DATE_ATOM, (int) $node->getChangedTime()),
      ],
      'actions' => [['id' => 'view_human', 'method' => 'GET', 'href' => \Drupal::request()->getSchemeAndHttpHost() . $alias]],
      'context' => 'Drupal content item "' . $node->label() . '" exposed as an AVL companion.',
      'nav' => ['self' => $alias . '.agent', 'parents' => ['/.agent']],
    ];

    return $this->text($this->serialize($document), 'text/agent-view; version=1; charset=utf-8');
  }

  private function notFound(string $route): Response {
    return $this->text($this->serialize([
      'meta' => ['v' => 1, 'route' => $route, 'generated' => gmdate(DATE_ATOM), 'ttl' => '1m'],
      'intent' => ['purpose' => 'Drupal agent view not found', 'audience' => ['agent'], 'capability' => ['read']],
      'state' => ['found' => false, 'route' => $route],
      'context' => 'No published Drupal node resolved for this AVL route.',
    ]), 'text/agent-view; version=1; charset=utf-8', 404);
  }

  private function serialize(array $document): string {
    $out = [];
    foreach (['meta', 'intent', 'state'] as $section) {
      if (empty($document[$section]) || !is_array($document[$section])) {
        continue;
      }
      $out[] = '@' . $section . "\n" . $this->serializeMap($document[$section], '  ');
    }
    if (!empty($document['actions'])) {
      $lines = ['@actions'];
      foreach ($document['actions'] as $action) {
        $lines[] = '  - id: ' . $this->scalar($action['id'] ?? 'action');
        $lines[] = '    method: ' . $this->scalar($action['method'] ?? 'GET');
        $lines[] = '    href: ' . $this->scalar($action['href'] ?? '#');
      }
      $out[] = implode("\n", $lines);
    }
    if (!empty($document['context'])) {
      $out[] = '@context' . "\n  > " . $document['context'];
    }
    if (!empty($document['nav'])) {
      $out[] = '@nav' . "\n" . $this->serializeMap($document['nav'], '  ');
    }
    return implode("\n\n", $out) . "\n";
  }

  private function serializeMap(array $data, string $indent): string {
    $lines = [];
    foreach ($data as $key => $value) {
      if (is_array($value)) {
        $lines[] = $indent . $key . '[' . count($value) . ']: ' . implode(', ', array_map([$this, 'scalar'], $value));
      }
      else {
        $lines[] = $indent . $key . ': ' . $this->scalar($value);
      }
    }
    return implode("\n", $lines);
  }

  private function scalar($value): string {
    if (is_bool($value)) {
      return $value ? 'true' : 'false';
    }
    if ($value === NULL) {
      return '~';
    }
    $string = (string) $value;
    return preg_match('/[",\r\n]/', $string) ? '"' . str_replace('"', '\"', $string) . '"' : $string;
  }
}
