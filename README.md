# projet-netsjs-test-unit

API [NestJS](https://nestjs.com) en TypeScript, testée avec [Vitest](https://vitest.dev).

## Installation

```bash
npm install
```

## Lancement

```bash
npm run start       # démarrage simple
npm run start:dev   # mode watch
npm run start:prod  # production (nécessite `npm run build`)
```

L'API est accessible sur `http://localhost:3000/api` (port modifiable via la variable `PORT`). Le CORS autorise uniquement `http://localhost:4200`.

## Tests

```bash
npm run test        # tests unitaires
npm run test:watch  # tests unitaires en mode watch
npm run test:e2e    # tests end-to-end
npm run test:cov    # couverture de code
```

## Qualité du code

```bash
npm run lint    # oxlint
npm run format  # prettier
```

## Structure

```
src/    code source (module, contrôleur, service) + tests unitaires (*.spec.ts)
test/   tests end-to-end
```
