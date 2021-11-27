import path = require('path')
import { create } from 'xmlbuilder2'
import fs = require('fs')
import React = require('react')

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

const generateXML = (
  hostname: string,
  options?: GenerateSitemapProps['options'],
  Routes?: GenerateSitemapProps['routes'],
) => {
  const xml = create({ encoding: 'utf-8' })
    .ele('urlset')
    .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
  Routes.forEach((route) => {
    let paths = route({})?.props.children as JSX.Element | JSX.Element[]

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
      let found = false

      // Loop through all slugs
      getSlugs(uri).forEach((key) => {
        found = true // Already added slugs, no need to add path too
        const midStringRegex = new RegExp(`/:${key}/`, 'g')
        const endStringRegex = new RegExp(`/:${key}$`)

        // Get the slugs values for this string
        const slugValues = findSlugValue(option, key)

        // Loop through the slug value
        slugValues.forEach((value) => {
          let uriWithSlug = ''
          if (uri.match(midStringRegex)) {
            uriWithSlug = uri.replace(midStringRegex, `/${value}/`)
          } else {
            uriWithSlug = uri.replace(endStringRegex, `/${value}`)
          }
          const item = xml.ele('url')
          item.ele('loc').txt(hostname + addMissingSlash(uriWithSlug))
          item.ele('priority').txt(`${option.priority || 0}`)
          item
            .ele('changefreq')
            .txt(option.changefreq || 'never')
            .up()
        })
      })
      if (path.props.sitemapIndex !== false && !found) {
        const item = xml.ele('url')
        item.ele('loc').txt(hostname + addMissingSlash(uri))
        item.ele('priority').txt(`${option.priority || 0}`)
        item
          .ele('changefreq')
          .txt(option.changefreq || 'never')
          .up()
      }
    })
  })
  return xml.end({ prettyPrint: true })
}

const createFile = (
  content: string,
  output: GenerateSitemapProps['output'],
) => {
  const dir = path.join(__dirname, output)

  fs.mkdir(dir, { recursive: true }, (err: any) => {
    if (err) throw err
  })

  fs.writeFile(path.join(dir, 'sitemap.xml'), content, (err: any) => {
    if (err) {
      return console.log(err)
    }
    console.log('The file was saved!')
  })
}

export const generateSitemap = ({
  url,
  routes,
  output = './public',
  options,
}: GenerateSitemapProps) => {
  if (routes.length === 0) {
    console.error('No routes defined')
    return
  }
  const content = generateXML(url, options, routes)
  createFile(content, output)
}
