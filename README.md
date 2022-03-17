# react-sitemap-generator

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/markusmoltke)

## Get started

### Install

```shell
npm install --save react-sitemap-generator
```

or

```shell
yarn add react-sitemap-generator
```

### Usage

Minimum requirements example

```typescript
import { generateSitemap } from 'react-sitemap-generator'
import Routes from './Routes'

generateSitemap({
  url: 'https://example.org',
  routes: [Routes],
})
```

Full example

```typescript
import { generateSitemap } from 'react-sitemap-generator'
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
