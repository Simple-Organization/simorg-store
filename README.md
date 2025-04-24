# simorg-store

**simorg-store** é uma biblioteca muito simples e agnóstica de framework usada para criar bibliotecas com `state management` que não precisam definir qual framework elas estão utilizando. Ou seja, é ideal para criar outras bibliotecas agnósticas.

## Tipagem de um Signal

```ts
type ReadableSignal<T = any> = {
  get: () => T;
  subscribe: (callback: (value: T) => void) => () => void;
};

interface WritableSignal<T = any> extends ReadableSignal<T> {
  set: (value: T) => void;
}
```

## Instalação

Para instalar a biblioteca, use o npm ou yarn:

```sh
npm i simorg-store
# ou
pnpm i simorg-store
```

## Usando

A API do `simorg-store` oferece um `selector`:

```ts
import { store, singleSelector, multiSelector } from 'simorg-store';

const mySignal1 = store(1);
const mySignal2 = store(2);

// Para valores únicos
const singleValue = singleSelector(mySignal1, (value) => value + 1);

// API conveniente para múltiplos valores
// Inspirada no Recoil e Jotai
const multiValue = multiSelector((get) => get(mySignal1) + get(mySignal2));
```

## Exemplos

### Exemplo Básico

```ts
import { store } from 'simorg-store';

const counter = store(0);

counter.subscribe((value) => {
  console.log('Counter value:', value);
});

counter.set(1); // Console: Counter value: 1
```

### Exemplo com Selector

```ts
import { store, selector } from 'simorg-store';

const count = store(0);

const doubleCount = selector(count, (value) => value * 2);

doubleCount.subscribe((value) => {
  console.log('Double count value:', value);
});

count.set(2); // Console: Double count value: 4
```

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
