import { createResource, createSignal, Show, type Component } from 'solid-js';
import { ApiError, formatDate, formatTime, getEvent, isPast, registerForEvent } from '../api';
import Message from '../components/Message';

const inputClass = 'rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none';

const EventPage: Component<{ id: number; backHref: string }> = (props) => {
  const [event, { refetch }] = createResource(() => props.id, getEvent);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal(false);
  const [emailError, setEmailError] = createSignal('');

  const freeSpots = () => Math.max(event()!.prostaMesta, 0);
  const taken = () => event()!.kapaciteta - freeSpots();
  const takenPercent = () => (event()!.kapaciteta ? (taken() / event()!.kapaciteta) * 100 : 100);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    setError('');
    setEmailError('');
    setSuccess(false);
    if (!emailRegex.test(String(data.get('email')).trim())) {
      setEmailError('Neveljaven e-poštni naslov.');
      return;
    }
    setSubmitting(true);
    try {
      await registerForEvent(props.id, {
        name: String(data.get('name')).trim(),
        surname: String(data.get('surname')).trim(),
        email: String(data.get('email')).trim(),
      });
      setSuccess(true);
      form.reset();
      refetch();
    } catch (err) {
      if (err instanceof ApiError && err.field === 'email') {
        setEmailError(err.message);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <a href={props.backHref} class="mb-4 inline-block text-sm text-emerald-700 hover:underline">
        &larr; Vsi dogodki
      </a>
      <Show when={!event.loading || event()} fallback={<Message>Nalaganje ...</Message>}>
        <Show when={!event.error} fallback={<Message tone="error">{event.error.message}</Message>}>
          <article class="rounded-xl border border-slate-200 bg-white p-5">
            <h1 class="mb-4 text-2xl font-bold">{event()!.naziv}</h1>
            <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-slate-700">
              <dt class="text-slate-500">Datum</dt>
              <dd class="first-letter:uppercase">{formatDate(event()!.datumInUra)}</dd>
              <dt class="text-slate-500">Ura</dt>
              <dd>{formatTime(event()!.datumInUra)}</dd>
              <dt class="text-slate-500">Lokacija</dt>
              <dd>{event()!.lokacija}</dd>
            </dl>

            <div class="mt-5">
              <div class="mb-1 flex justify-between text-sm">
                <span class="text-slate-500">Zasedenost</span>
                <span>
                  {taken()} / {event()!.kapaciteta}
                </span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full"
                  classList={{ 'bg-emerald-500': freeSpots() > 0, 'bg-red-500': freeSpots() === 0 }}
                  style={{ width: `${takenPercent()}%` }}
                />
              </div>
              <p class="mt-2 text-sm text-slate-600">
                Kapaciteta: <strong>{event()!.kapaciteta}</strong> · Prosta mesta: <strong>{freeSpots()}</strong>
              </p>
            </div>
          </article>

          <section class="mt-4 rounded-xl border border-slate-200 bg-white p-5">
            <h2 class="mb-4 text-lg font-bold">Prijava na dogodek</h2>
            <Show when={success()}>
              <div class="mb-4">
                <Message tone="success">Uspešno ste se prijavili na dogodek.</Message>
              </div>
            </Show>
            <Show
              when={!isPast(event()!.datumInUra) && freeSpots() > 0}
              fallback={
                <Message>
                  {isPast(event()!.datumInUra) ? 'Prijave so zaprte, dogodek se je že začel.' : 'Dogodek je zaseden.'}
                </Message>
              }
            >
              <form onSubmit={onSubmit} class="flex flex-col gap-4">
                <div class="grid gap-4 sm:grid-cols-2">
                  <label class="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Ime
                    <input name="name" required maxLength={100} autocomplete="given-name" class={inputClass} />
                  </label>
                  <label class="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Priimek
                    <input name="surname" required maxLength={100} autocomplete="family-name" class={inputClass} />
                  </label>
                </div>
                <label class="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  E-pošta
                  <input name="email" type="text" required maxLength={254} autocomplete="email" class={`${inputClass} ${emailError() ? 'border-red-500!' : ''}`} />
                  <Show when={emailError()}>
                    <Message tone="error">{emailError()}</Message>
                  </Show>
                </label>
                <Show when={error()}>
                  <Message tone="error">{error()}</Message>
                </Show>
                <button
                  type="submit"
                  disabled={submitting()}
                  class="rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting() ? 'Prijavljanje ...' : 'Prijavi se'}
                </button>
              </form>
            </Show>
          </section>
        </Show>
      </Show>
    </>
  );
};

export default EventPage;
