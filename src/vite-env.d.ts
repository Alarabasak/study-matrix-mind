/// <reference types="vite/client" />

interface WindowEventMap {
  'crossword-key': CustomEvent<
    | { type: 'letter'; value: string }
    | { type: 'backspace' }
  >;
}
