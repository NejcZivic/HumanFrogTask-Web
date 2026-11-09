import { createResource, For, Show, type Component } from 'solid-js';
import { formatDay, formatMonth, formatTime, getEvents, isPast } from '../api';
import Message from '../components/Message';

const inputClass =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none';

const setFilter = (from: string, to: string) => {
  const params = new URLSearchParams();
  if (from) params.set('od', from);
  if (to) params.set('do', to);
  window.location.hash = params.size ? `/?${params}` : '/';
};

const EventList: Component<{ from: string; to: string }> = (props) => {
  const invalidRange = () => !!props.from && !!props.to && props.from > props.to;
  const [events] = createResource(
    () => (invalidRange() ? false : { from: props.from, to: props.to }),
    ({ from, to }) => getEvents(from, to),
  );

  return (
    <>
      <h1 class="mb-4 text-2xl font-bold">Dogodki</h1>

      <div class="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label class="flex min-w-0 flex-col gap-1 text-sm font-medium text-slate-700">
          Od
          <input
            type="date"
            value={props.from}
            max={props.to || undefined}
            onChange={(e) => setFilter(e.currentTarget.value, props.to)}
            class={inputClass}
          />
        </label>
        <label class="flex min-w-0 flex-col gap-1 text-sm font-medium text-slate-700">
          Do
          <input
            type="date"
            value={props.to}
            min={props.from || undefined}
            onChange={(e) => setFilter(props.from, e.currentTarget.value)}
            class={inputClass}
          />
        </label>
        <button
          type="button"
          disabled={!props.from && !props.to}
          onClick={() => setFilter('', '')}
          class="col-span-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-40 sm:col-span-1"
        >
          Počisti
        </button>
      </div>

      <Show
        when={!invalidRange()}
        fallback={<Message tone="error">Datum "od" ne sme biti kasnejši od datuma "do".</Message>}
      >
        <Show when={!events.loading} fallback={<Message>Nalaganje ...</Message>}>
          <Show when={!events.error} fallback={<Message tone="error">{events.error.message}</Message>}>
            <Show when={events()?.length} fallback={<Message>V izbranem obdobju ni dogodkov.</Message>}>
              <ul class="flex flex-col gap-3">
                <For each={events()}>
                  {(ev) => (
                    <li>
                      <a
                        href={`#/events/${ev.id}`}
                        class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-400 hover:shadow-sm"
                        classList={{ 'opacity-60': isPast(ev.datumInUra) }}
                      >
                        <div class="flex w-14 shrink-0 flex-col items-center rounded-lg bg-emerald-50 py-2 text-emerald-800">
                          <span class="text-xl leading-none font-bold">{formatDay(ev.datumInUra)}</span>
                          <span class="text-xs uppercase">{formatMonth(ev.datumInUra)}</span>
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="truncate font-semibold">{ev.naziv}</p>
                          <p class="text-sm text-slate-600">
                            {formatTime(ev.datumInUra)} · {ev.lokacija}
                          </p>
                        </div>
                        <Show when={isPast(ev.datumInUra)}>
                          <span class="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            Zaključen
                          </span>
                        </Show>
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Show>
        </Show>
      </Show>
    </>
  );
};

export default EventList;
