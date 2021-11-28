import { generateSitemap } from '../src/index'
import { routes } from './routes'

generateSitemap({
  url: 'https://example.org',
  routes: [routes],
  options: {
    '/heythere/:id': { slugs: { id: ['test1', 'test2', 'test3'] } },
    '/pizza/:id/:test': {
      slugs: {
        id: ['pizza1', 'pizza2', 'pizza3'],
        test: ['test1', 'test2', 'test3'],
      },
    },
  },
  output: './',
})
