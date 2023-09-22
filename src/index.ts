import { create } from 'xmlbuilder2'
import fs = require('fs')
import React = require('react')

const fsPromises = fs.promises

export interface PathOption {
  slugs?: { [key: string]: string[] }
  ignore?: boolean
  priority?: number
  changefreq?: string
}

interface GenerateSitemapProps {
  url: string
  routes: React.FC[]
  output?: string
  options?: { [key: string]: PathOption }
}

const findOption = (
  options: GenerateSitemapProps['options'],
  path: string,
): PathOption => {
  return options?.[path] || {}
}

const findSlugValue = (
  option: GenerateSitemapProps['options'][0],
  slug: string,
): string[] => {
  return option.slugs?.[slug] || []
}

const getSlugs = (path: string): string[] => {
  const pathSplit = path.split('/')
  return pathSplit
    .filter((value) => value.startsWith(':'))
    .map((value) => value.slice(1))
}

const addMissingSlash = (path: string): string => {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Generates the sitemap.xml file
 * @param hostname The url of the website
 * @param options The options to follow
 * @param Routes The react routes to map
 * @returns The generated sitemap as a string
 */
const generateXML = (
  hostname: string,
  options?: GenerateSitemapProps['options'],
  Routes?: GenerateSitemapProps['routes'],
) => {
  const xml = create({ encoding: 'utf-8' })
    .ele('urlset')
    .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
  Routes.forEach((route) => {
    let paths = (route({}) as any)?.props.children as
      | JSX.Element
      | JSX.Element[]

    // Arrayify if not array
    if (!Array.isArray(paths)) {
      paths = [paths]
    }
    paths.forEach((path) => {
      const uri = path.props.path
      const option = findOption(options, uri)
      // If ignore is set, skip to next
      if (option.ignore) {
        return
      }
      const slugs = getSlugs(uri)

      if (slugs.length > 0) {
        const addSlug = (uri: string, key: string) => {
          const regex = new RegExp(`/:${key}`)

          // Get the slugs values for this string
          const slugValues = findSlugValue(option, key)

          // Loop through the slug value
          slugValues.forEach((value) => {
            const uriWithSlug = uri.replace(regex, `/${value}`)

            const slugs = getSlugs(uriWithSlug)

            if (slugs.length > 0) {
              addSlug(uriWithSlug, slugs[0]) // Call reccursively
            } else {
              const item = xml.ele('url')
              item.ele('loc').txt(hostname + addMissingSlash(uriWithSlug))
              item.ele('priority').txt(`${option.priority || 1}`)
              item
                .ele('changefreq')
                .txt(option.changefreq || 'never')
                .up()
            }
          })
        }
        addSlug(uri, slugs[0])
      } else {
        const item = xml.ele('url')
        item.ele('loc').txt(hostname + addMissingSlash(uri))
        item.ele('priority').txt(`${option.priority || 1}`)
        item
          .ele('changefreq')
          .txt(option.changefreq || 'never')
          .up()
      }
    })
  })
  return xml.end({ prettyPrint: true })
}

const createFile = async (
  content: string,
  output: GenerateSitemapProps['output'],
): Promise<boolean> => {
  await fsPromises.mkdir(output, { recursive: true })
  await fsPromises.writeFile(output + '/sitemap.xml', content)
  return true
}

export const generateSitemap = async ({
  url,
  routes,
  output = './public',
  options,
}: GenerateSitemapProps) => {
  if (url === undefined) {
    console.error('URL not defined')
    return false
  }
  if (routes === undefined || routes.length === 0) {
    console.error('No routes defined')
    return false
  }

  const content = generateXML(url, options, routes)
  return await createFile(content, output)
}
