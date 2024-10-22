import * as fs from 'node:fs/promises'
import { getBrowser } from '../utils.js'
import { clickOnActiveRow, getAllCoursesFromTab } from './courses.js'
import type { ScrappedProfessorCourse } from './professorCourse.js'
import { type Professor, extractProfessorData, getProfessorsLinks } from './professors.js'

async function main() {
  await scrapCourses()
  await scrapProfessors()
  await scrapCoursesProfessors()
}

main()
  .then(() => console.log('Done!'))
  .catch(console.error)
  .finally(() => process.exit(0))

/********************
 * Scraper functions
 ********************/

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

async function scrapProfessors() {
  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.goto('https://sigs.ufrpe.br/sigaa/public/docente/busca_docentes.jsf')

  const professorsLinks = await getProfessorsLinks(page)

  const professors: Partial<Professor>[] = []
  for (const pageUrl of professorsLinks) {
    await page.goto(pageUrl)
    professors.push(await extractProfessorData(page))
  }

  await fs.writeFile('src/scrap/results/professors.json', JSON.stringify(professors, null, 2))
}

async function scrapCoursesProfessors() {
  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.goto('https://sigs.ufrpe.br/sigaa/public/docente/busca_docentes.jsf')

  const professorLinks = await getProfessorsLinks(page)

  const professorCoursesScraped: ScrappedProfessorCourse = {}
  for (const link of professorLinks) {
    await page.goto(link)
    await page.locator('.menu_professor .disciplinas_ministradas a').click()
    await page.waitForSelector('#abas-turmas')
    const professorName = await page.$eval('#id-docente h3', async el => {
      return el.innerHTML
    })

    const tab = await page.evaluateHandle(() => {
      const allTabs = document.querySelectorAll('#abas-turmas li')
      const tab = Array.from(allTabs).find(tab => tab.innerHTML.includes('Graduação'))

      if (!tab) {
        throw new Error('Could not find the Graduação tab')
      }

      return tab
    })

    await tab.click()
    await page.waitForSelector('#turmas-graduacao tbody tr')

    const coursesScrapped = await page.$$eval('#turmas-graduacao tbody tr', async rows => {
      const professorsCourses: ScrappedProfessorCourse[string][number][] = []

      const courseProfessor: ScrappedProfessorCourse[string][number] = {
        courseCode: '',
        year: '',
      }

      for (const row of rows) {
        const year = row.querySelector('.anoPeriodo')?.innerHTML

        if (year) {
          courseProfessor.year = year.trim()
          continue
        }

        const code = row.querySelector('.codigo')?.innerHTML
        if (code) {
          courseProfessor.courseCode = code.trim()
        }

        const isEmpty = row.innerText === ''
        if (isEmpty) {
          professorsCourses.push({ ...courseProfessor })
          courseProfessor.courseCode = ''
          courseProfessor.year = ''
        }
      }

      return professorsCourses
    })

    professorCoursesScraped[professorName] = coursesScrapped
  }

  await fs.writeFile('src/scrap/results/professorCourses.json', JSON.stringify(professorCoursesScraped, null, 2))
}
