import type puppeteer from 'puppeteer-core'
import type { TabNames } from './types.js'

interface Course {
  code: string
  name: string
  description: string
  period: number | null
}

export async function getAllCoursesFromTab(page: puppeteer.Page, tabOption: TabNames) {
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

export async function getCourseDetails(page: puppeteer.Page, period: number | null) {
  const course: Partial<Course> = {
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

export async function clickOnCourseTab(page: puppeteer.Page, tabName: string) {
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

export async function clickOnActiveRow(page: puppeteer.Page) {
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
