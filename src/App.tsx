import { createSignal, Match, onCleanup, Switch, type Component } from 'solid-js';
import EventList from './pages/EventList';
import EventPage from './pages/EventPage';

const parseHash = () => {
  const [path, query = ''] = (window.location.hash.slice(1) || '/').split('?');
  return { path, params: new URLSearchParams(query) };
};

const eventIdFromPath = (path: string) => {
  const match = path.match(/^\/events\/(\d+)$/);
  return match ? Number(match[1]) : null;
};

const App: Component = () => {
  const [route, setRoute] = createSignal(parseHash());
  let listHref = eventIdFromPath(route().path) ? '#/' : window.location.hash || '#/';

  const onHashChange = () => {
    const next = parseHash();
    if (!eventIdFromPath(next.path)) {
      listHref = window.location.hash || '#/';
    }
    setRoute(next);
  };
  window.addEventListener('hashchange', onHashChange);
  onCleanup(() => window.removeEventListener('hashchange', onHashChange));

  return (
    <div class="min-h-screen">
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto flex max-w-3xl items-center px-4 py-3">
          <a href="#/" class="text-lg font-bold tracking-tight text-emerald-700">
            HumanFrog <span class="font-normal text-slate-500">dogodki</span>
          </a>
        </div>
      </header>
      <main class="mx-auto max-w-3xl px-4 py-6">
        <Switch
          fallback={<EventList from={route().params.get('od') ?? ''} to={route().params.get('do') ?? ''} />}
        >
          <Match when={eventIdFromPath(route().path)}>
            {(id) => <EventPage id={id()} backHref={listHref} />}
          </Match>
        </Switch>
      </main>
    </div>
  );
};

export default App;
