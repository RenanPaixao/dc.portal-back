import * as fs from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
import type { TabNames } from './types.ts'

async function getAllCoursesFromTab(page: puppeteer.Page, tabOption: TabNames) {
  const nivelTabs = Array.from({ length: 9 }, (_, i) => {
    const optionProperty = `nivel${i + 1}`
    return {
      [optionProperty]: {
        tabName: `${i + 1}º Nível`,
        tableId: `#semestre${i + 1}`,
        period: i + 1,
      },
    }
  }).reduce((acc, curr) => Object.assign(acc, curr), {}) as {
    [key in TabNames]: { tabName: string; tableId: string; period: number }
  }

  const config = {
    ...nivelTabs,
    optativas: {
      tabName: 'Optativas',
      tableId: '#optativas',
      period: null,
    },
  }[tabOption]

  await clickOnCourseTab(page, config.tabName)
  await page.waitForSelector('tr')

  const courses = []

  const linksSelector = `${config.tableId} [title="Visualizar Detalhes do Componente"]`
  const allLinks = await page.$$(linksSelector)

  for (const index of allLinks.keys()) {
    // Navigate over all courses re-querying the links
    const links = await page.$$(linksSelector)

    const navigation = page.waitForNavigation()
    await links[index].click()
    await navigation
    const course = await getCourseDetails(page, config.period)
    courses.push(course)

    // Back to the previous page
    await page.goBack()
    await clickOnCourseTab(page, config.tabName)
    await page.waitForSelector('tr')
  }

  return courses
}

async function getCourseDetails(page: puppeteer.Page, period: number | null) {
  const course = {
    code: null,
    name: null,
    description: null,
    period: period,
  }

  const rows = await page.$$('tr')

  for (const row of rows) {
    if (course.code && course.name && course.description) {
      break
    }

    const text = await row.getProperty('innerText')
    const value = await text.jsonValue()
    if (value.includes('Código')) {
      const code = await row.$('td')
      course.code = await code?.getProperty('innerText').then(p => p.jsonValue())
    }
    if (value.includes('Nome')) {
      const name = await row.$('td')
      course.name = await name?.getProperty('innerText').then(p => p.jsonValue())
    }
    if (value.includes('Ementa')) {
      const description = await row.$('td')
      course.description = await description?.getProperty('innerText').then(p => p.jsonValue())
    }
  }

  return course
}

async function clickOnCourseTab(page: puppeteer.Page, tabName: string) {
  await page.waitForSelector('.yui-nav')
  const tabs = await page.$$('.yui-nav a')

  for (const tab of tabs) {
    const text = await tab.getProperty('innerText')
    const value = await text.jsonValue()
    if (value === tabName) {
      await tab.click()
    }
  }
}

async function clickOnActiveRow(page: puppeteer.Page) {
  const rows = await page.$$('tr')

  try {
    for (const row of rows) {
      const text = await row.getProperty('innerText')
      const value = await text.jsonValue()
      if (value.includes('Ativa')) {
        const cell = await row.$('[title="Visualizar Estrutura Curricular"]')
        if (cell) {
          await cell.click()
        }
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'Protocol error (DOM.describeNode): Cannot find context with specified id') {
        console.error(e.message)
        return
      }
    }

    throw e
  }
}

function getBrowser() {
  return puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: false,
  })
}

async function scrapProfessors() {
  const professor = {
    name: null,
    email: null,
    profileImg: null,
  }
  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.goto('https://sigs.ufrpe.br/sigaa/public/docente/busca_docentes.jsf')

  await page.waitForSelector('#form')
  const optionValue = await page.$$eval(
    'option',
    options => options.find(o => o.innerText === 'DEPARTAMENTO DE COMPUTAÇÃO-DC - RECIFE')?.value
  )
  await page.select('select', optionValue)
  await page.click('[name="form:buscar"]')

  await page.waitForSelector('.pagina a')
  const professorsPages = await page.$$eval('.pagina a', links => links.map(l => l.href))

  for (const pageUrl of professorsPages) {
    await page.goto(pageUrl)
    await page.waitForSelector('#id-docente h3')
    const professors = await page.$$eval('.docente', professors => professors.map(p => p.innerText))
    await page.waitForSelector('.pagina a')
  }

  await browser.close()
}

async function scrapCourses() {
  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.goto('https://sigs.ufrpe.br/sigaa/public/curso/curriculo.jsf?lc=pt_BR&id=28230822')

  await page.waitForSelector('tr')
  clickOnActiveRow(page).catch(console.error)

  const allCourses = [
    ...(await getAllCoursesFromTab(page, 'optativas')),
    ...(await getAllCoursesFromTab(page, 'nivel1')),
    ...(await getAllCoursesFromTab(page, 'nivel2')),
    ...(await getAllCoursesFromTab(page, 'nivel3')),
    ...(await getAllCoursesFromTab(page, 'nivel4')),
    ...(await getAllCoursesFromTab(page, 'nivel5')),
    ...(await getAllCoursesFromTab(page, 'nivel6')),
    ...(await getAllCoursesFromTab(page, 'nivel7')),
    ...(await getAllCoursesFromTab(page, 'nivel8')),
    ...(await getAllCoursesFromTab(page, 'nivel9')),
  ]

  await fs.writeFile('src/scrap/results/courses.json', JSON.stringify(allCourses, null, 2))
}

async function main() {
  await scrapCourses()
}

main()
  .then(() => console.log('Done!'))
  .catch(console.error)
  .finally(() => process.exit(0))
