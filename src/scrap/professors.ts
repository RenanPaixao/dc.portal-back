import type puppeteer from 'puppeteer-core'

export interface Professor {
  name: string
  email: string
  profileImg: string | null
}

export async function getProfessorsLinks(page: puppeteer.Page) {
  await page.waitForSelector('#form')
  const optionValue = await page.$$eval(
    'option',
    options => options.find(o => o.innerText === 'DEPARTAMENTO DE COMPUTAÇÃO-DC - RECIFE')?.value
  )

  if (!optionValue) {
    throw new Error('Could not find the department option value')
  }

  await page.select('select', optionValue)
  await page.click('[name="form:buscar"]')

  await page.waitForSelector('.pagina a')
  return await page.$$eval('.pagina a', links => links.map(l => l.href))
}

export async function extractProfessorData(page: puppeteer.Page) {
  const professor: Partial<Professor> = {}

  await page.waitForSelector('#id-docente h3')
  professor.name = await page.$eval('#id-docente h3', professors => professors.innerText)

  professor.email = await page.$$eval('dl', contactRows => {
    const emailRow = contactRows.find(row => row.innerText.includes('Endereço eletrônico'))
    if (!emailRow) {
      throw new Error('Could not find the email row')
    }

    return emailRow.querySelector('dd')?.innerText
  })

  professor.profileImg = await page.$eval('.foto_professor img', img => {
    const src = img.getAttribute('src')
    return src === '/sigaa/img/no_picture.png' ? null : src
  })

  return professor
}
