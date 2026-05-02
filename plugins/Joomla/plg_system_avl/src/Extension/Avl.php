<?php

namespace Joomla\Plugin\System\Avl\Extension;

defined('_JEXEC') or die;

use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\Event\SubscriberInterface;

final class Avl extends CMSPlugin implements SubscriberInterface
{
	public static function getSubscribedEvents(): array
	{
		return ['onAfterRoute' => 'onAfterRoute'];
	}

	public function onAfterRoute(): void
	{
		$app = $this->getApplication();
		if (!$app->isClient('site')) {
			return;
		}

		$path = '/' . ltrim((string) $app->getInput()->server->get('REQUEST_URI', '/', 'raw'), '/');
		$path = strtok($path, '?') ?: '/';

		if ($path === '/agent.txt') {
			$this->respond($this->manifest(), 'text/plain; charset=utf-8');
		}

		if ($path === '/llms.txt' || $path === '/lm.txt') {
			$this->respond($this->llms(), 'text/plain; charset=utf-8');
		}

		if ($path === '/.agent' || str_ends_with($path, '.agent')) {
			$route = $path === '/.agent' ? '/' : substr($path, 0, -6);
			$this->respond($this->agentDocument($route), 'text/agent-view; version=1; charset=utf-8');
		}
	}

	private function respond(string $body, string $contentType): void
	{
		$app = $this->getApplication();
		$app->setHeader('Content-Type', $contentType, true);
		$app->setHeader('Cache-Control', 'public, max-age=60', true);
		echo $body;
		$app->close();
	}

	private function manifest(): string
	{
		return implode("\n", [
			'# AVL Manifest',
			'',
			'version: 1',
			'content-type: text/agent-view; version=1',
			'producer: joomla',
			'site: ' . $this->getApplication()->get('sitename'),
			'',
			'routes:',
			'  - GET /.agent',
			'  - GET /{path}.agent',
			'',
			'related:',
			'  llms: /llms.txt',
			'  lm: /lm.txt',
			'',
		]) . "\n";
	}

	private function llms(): string
	{
		return implode("\n", [
			'# ' . $this->getApplication()->get('sitename'),
			'',
			'> Joomla site with Agent View Layer support.',
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
		]) . "\n";
	}

	private function agentDocument(string $route): string
	{
		$title = $this->getApplication()->getDocument()->getTitle() ?: $this->getApplication()->get('sitename');
		$route = $route ?: '/';

		return implode("\n\n", [
			"@meta\n  v: 1\n  route: {$route}\n  generated: " . gmdate(DATE_ATOM) . "\n  ttl: 5m",
			"@intent\n  purpose:    Joomla page: {$title}\n  audience:   visitor, agent\n  capability: read, navigate",
			"@state\n  title: {$title}\n  url: " . $this->getApplication()->getInput()->server->get('HTTP_HOST', '', 'string') . $route,
			"@actions\n  - id: view_human\n    method: GET\n    href: {$route}",
			"@context\n  > Joomla route {$route} exposed as an AVL companion.",
			"@nav\n  self:      " . ($route === '/' ? '/.agent' : $route . '.agent') . "\n  parents:   [/.agent]",
		]) . "\n";
	}
}
