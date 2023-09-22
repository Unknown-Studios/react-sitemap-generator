import { expect } from 'chai'
import { existsSync, rmSync } from 'fs'
import { describe, it } from 'mocha'
import { generateSitemap, PathOption } from '../src'
import { moreRoutes, routes } from './routes'
import rewire from 'rewire'

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

describe('Test generateXML', () => {
  const generateXML = index.__get__('generateXML')
  it('should generate closed tag with no lines in it', () => {
    // Test response for no routes
    expect(generateXML('https://example.org', {}, [])).to.equal(
      '<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>',
    )
  })
  it('test if a single route works', () => {
    // Test if single route generates correct
    expect(generateXML('https://example.org', {}, [routes])).to.equal(
      '<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.org/hello</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n</urlset>',
    )
  })
  it('test if multiple routes work', () => {
    // Test if multiple routes generate correctly
    expect(generateXML('https://example.org', {}, [moreRoutes])).to.equal(
      '<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.org/hello</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/test</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n</urlset>',
    )
  })

  it('test options (Single route)', () => {
    // Test if single route generates correct with options
    expect(
      generateXML(
        'https://example.org',
        {
          '/hello': { ignore: true },
        },
        [routes],
      ),
    ).to.equal(
      '<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>',
    )
  })
  it('test options (Multiple routes)', () => {
    // Test if multiple routes generate correctly with options
    expect(
      generateXML(
        'https://example.org',
        {
          '/test': { ignore: true },
          '/heythere/:id': { slugs: { id: ['Hey'] } }, // Check end slug
          '/cake/:id/test': { slugs: { id: ['Hey'] } }, // Check middle slug
          '/pizza/:id/:test': {
            // Multiple slugs
            slugs: {
              id: ['pizza1', 'pizza2', 'pizza3'],
              test: ['test1', 'test2', 'test3'],
            },
          },
        },
        [moreRoutes],
      ),
    ).to.equal(
      '<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.org/hello</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/heythere/Hey</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/cake/Hey/test</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/pizza/pizza1/test1</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/pizza/pizza1/test2</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/pizza/pizza1/test3</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/pizza/pizza2/test1</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/pizza/pizza2/test2</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/pizza/pizza2/test3</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/pizza/pizza3/test1</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/pizza/pizza3/test2</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n  <url>\n    <loc>https://example.org/pizza/pizza3/test3</loc>\n    <priority>1</priority>\n    <changefreq>never</changefreq>\n  </url>\n</urlset>',
    )
  })
})

describe('Test createFile', () => {
  const createFile = index.__get__('createFile')
  const dir = '../public' // .. because we are inside test dir
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })
  it('Test file generation', async () => {
    const correctPath = dir + '/sitemap.xml'
    const wrongPath = dir + '/sitemap'
    await createFile('content', '../public')

    expect(existsSync(correctPath)).to.equal(true)
    expect(existsSync(wrongPath)).to.equal(false)
  })
  it('Test output variable', async () => {
    const testDir = '../testDir' // .. because we are inside test dir
    const correctPath = testDir + '/sitemap.xml'

    // Relative path
    await createFile('content', testDir)
    expect(existsSync(correctPath)).to.equal(true)

    rmSync(testDir, { recursive: true, force: true })
  })
})
describe('Test generateSitemap', () => {
  const dir = '../public' // .. because we are inside test dir
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })
  it('Test general function', async () => {
    const correctPath = dir + '/sitemap.xml'
    const wrongPath = dir + '/sitemap'
    await generateSitemap({
      routes: [routes],
      url: 'https://example.org',
      output: '../public',
    })

    expect(existsSync(correctPath)).to.equal(true)
    expect(existsSync(wrongPath)).to.equal(false)
  })
  it('Testing wrong parameters', async () => {
    const missing: any = {}

    expect(await generateSitemap(missing)).to.equal(false)

    expect(
      await generateSitemap({
        routes: [],
        url: 'https://example.org',
        output: '../public',
      }),
    ).to.equal(false)
  })
})
