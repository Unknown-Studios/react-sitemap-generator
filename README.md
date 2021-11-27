# react-sitemap-generation

## Get started

### Install

```shell
npm install --save react-sitemap-generation
```

or

```shell
yarn add react-sitemap-generation
```

### Usage

Minimum requirements example

```typescript
import { generateSitemap } from 'react-sitemap-generation'
import Routes from './Routes'

generateSitemap({
  url: 'https://example.org',
  routes: [Routes],
})
```

Full example

```typescript
import { generateSitemap } from 'react-sitemap-generation'
import Routes from './Routes'

generateSitemap({
  url: 'https://example.org',
  routes: [Routes],
  output: './public',
  options: {
    '/dashboard': { ignore: true }, // Remote path from sitemap
    '/video/:id': {
      slugs: { id: ['value1', 'value2'] }, // Creates multiple routes
      priority: 1,
      changefreq: 'never',
    },
  },
})
```
