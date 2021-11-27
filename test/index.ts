import { expect } from 'chai'
import { describe, it } from 'mocha'
import { PathOption } from '../src'
import { moreRoutes, routes } from './routes'
import rewire = require('rewire')

const index = rewire('../src/index.ts')

describe('Test generateSitemap helper functions', () => {
  const values: { [key: string]: PathOption } = {
    '/help/*': {
      ignore: true,
    },
    '/dashboard/*': {
      priority: 1,
    },
    '/home/*': {
      priority: 5,
      changefreq: '8',
    },
    '/errors/*': {
      ignore: true,
    },
    '/charlie/:id': {
      slugs: { charlie: ['test1', 'test2', 'test3'] },
      priority: 660,
    },
    '/help/:id/:test': {
      slugs: { id: ['test1', 'test2', 'test3'], test: ['hello', 'hi', 'hey'] },
      priority: 3,
    },
  }
  const findOption = index.__get__('findOption')
  const findSlugValue = index.__get__('findSlugValue')
  const getSlugs = index.__get__('getSlugs')
  const addMissingSlash = index.__get__('addMissingSlash')
  it('should find option', () => {
    expect(findOption(values, '/help/*').ignore).to.be.equal(true) // True for value matching pattern
    expect(findOption(values, '/help/').ignore).to.be.equal(undefined) // Undefined when value not found
    expect(findOption(values, '/help/:id/:test').slugs.id.length).to.be.equal(3) // Length is 3 for matched pattern
  })
  it('should find slug value', () => {
    expect(
      findSlugValue(findOption(values, '/help/:id/:test'), 'id').length,
    ).to.be.equal(3) // Length should be 3
    expect(
      findSlugValue(findOption(values, '/help/:id/:test'), 'test')[2],
    ).to.be.equal('hey') // Value should be hey
  })
  it('should get slugs', () => {
    // Includes both test and id
    expect(getSlugs('/help/:id/:test')).to.include('test')
    expect(getSlugs('/help/:id/:test')).to.include('id')
    // Should include cook
    expect(getSlugs('/test/:cook')).to.include('cook')
    // Should include cook
    expect(getSlugs('/test/:cook/test')).to.include('cook')
  })
  it('should add missing slash', () => {
    expect(addMissingSlash('test')).to.equal('/test')
    expect(addMissingSlash('/test')).to.equal('/test')
  })
})

describe('Test generateSitemap', () => {
  const generateXML = index.__get__('generateXML')
  it('should generate correct XML', () => {
    // Test response for no routes
    expect(generateXML('https://example.org', {}, [])).to.equal(
      '<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>',
    )
    // Test if single route generates correct
    expect(generateXML('https://example.org', {}, [routes])).to.equal(
      '<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.org/hello</loc>\n    <priority>0</priority>\n    <changefreq>never</changefreq>\n  </url>\n</urlset>',
    )
    // Test if multiple routes generate correctly
    expect(generateXML('https://example.org', {}, [moreRoutes])).to.equal(
      '<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.org/hello</loc>\n    <priority>0</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/test</loc>\n    <priority>0</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/heythere</loc>\n    <priority>0</priority>\n    <changefreq>never</changefreq>\n  </url>\n</urlset>',
    )
  })
})
