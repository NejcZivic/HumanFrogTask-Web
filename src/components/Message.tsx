import type { Component, JSX } from 'solid-js';

const Message: Component<{ tone?: 'error' | 'success'; children: JSX.Element }> = (props) => (
  <p
    class="rounded-lg p-4 text-center"
    classList={{
      'bg-red-50 text-red-700': props.tone === 'error',
      'bg-emerald-50 text-emerald-800': props.tone === 'success',
      'text-slate-500': !props.tone,
    }}
  >
    {props.children}
  </p>
);

export default Message;
