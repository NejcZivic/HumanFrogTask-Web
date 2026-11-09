export interface EventSummary {
  id: number;
  naziv: string;
  datumInUra: string;
  lokacija: string;
  kapaciteta: number;
}

export interface EventDetail extends EventSummary {
  prostaMesta: number;
}

export interface RegistrationRequest {
  name: string;
  surname: string;
  email: string;
}

const BASE_URL = '/api';

const KNOWN_ERRORS: [RegExp, string][] = [
  [/fully booked/i, 'Dogodek je že zaseden.'],
  [/already registered/i, 'S tem e-poštnim naslovom ste na dogodek že prijavljeni.'],
  [/already started/i, 'Prijave so zaprte, ker se je dogodek že začel.'],
  [/cannot be later than/i, 'Datum "od" ne sme biti kasnejši od datuma "do".'],
  [/was not found/i, 'Dogodek ne obstaja.'],
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new Error('Strežnik ni dosegljiv. Poskusite znova kasneje.');
  }
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return res.json();
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const problem = await res.json();
    if (problem.errors) {
      return 'Preverite vnesene podatke.';
    }
    const known = KNOWN_ERRORS.find(([pattern]) => pattern.test(problem.detail ?? ''));
    if (known) {
      return known[1];
    }
  } catch {
  }
  return 'Prišlo je do napake. Poskusite znova.';
}

const startOfDay = (date: string) => new Date(`${date}T00:00:00`).toISOString();
const endOfDay = (date: string) => new Date(`${date}T23:59:59.999`).toISOString();

export const getEvents = (from?: string, to?: string) => {
  const params = new URLSearchParams();
  if (from) params.set('from', startOfDay(from));
  if (to) params.set('to', endOfDay(to));
  const query = params.size ? `?${params}` : '';
  return request<{ events: EventSummary[] }>(`/events${query}`).then((r) => r.events);
};

export const getEvent = (id: number) => request<EventDetail>(`/events/${id}`);

export const registerForEvent = (id: number, body: RegistrationRequest) =>
  request<{ eventId: number; registrationDate: string }>(`/events/${id}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const LOCALE = 'sl-SI';

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });

export const formatDay = (iso: string) => String(new Date(iso).getDate());

export const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString(LOCALE, { month: 'short' }).replace('.', '');

export const isPast = (iso: string) => new Date(iso) <= new Date();