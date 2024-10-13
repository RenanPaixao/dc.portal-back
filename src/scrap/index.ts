import * as fs from 'node:fs/promises'
import { getBrowser } from '../utils.js'
import { clickOnActiveRow, getAllCoursesFromTab } from './courses.js'

async function main() {
  await scrapCourses()
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
