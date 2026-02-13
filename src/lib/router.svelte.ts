export type Screen = 'home' | 'editor' | 'play';

interface RouteState {
  screen: Screen;
  sceneId: string | null;
}

function parseHash(hash: string): RouteState {
  const clean = hash.replace(/^#\/?/, '');
  if (clean.startsWith('editor/')) {
    return { screen: 'editor', sceneId: clean.split('/')[1] || null };
  }
  if (clean.startsWith('play/')) {
    return { screen: 'play', sceneId: clean.split('/')[1] || null };
  }
  return { screen: 'home', sceneId: null };
}

let route = $state<RouteState>(parseHash(window.location.hash));

export function getRoute(): RouteState {
  return route;
}

export function navigate(screen: Screen, sceneId?: string) {
  if (screen === 'home') {
    window.location.hash = '#/';
  } else {
    window.location.hash = `#/${screen}/${sceneId ?? ''}`;
  }
}

window.addEventListener('hashchange', () => {
  const parsed = parseHash(window.location.hash);
  route.screen = parsed.screen;
  route.sceneId = parsed.sceneId;
});
