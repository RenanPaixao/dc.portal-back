import puppeteer from 'puppeteer-core'

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
    await page.waitForSelector('.pagina aa')
  }

  await browser.close()
}

async function scrapCourses() {
  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.goto('https://sigs.ufrpe.br/sigaa/public/curso/curriculo.jsf?lc=pt_BR&id=28230822')

  await page.waitForSelector('tr')
  const rows = await page.$$('tr')

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

  return []
}

async function main() {
  await scrapCourses()
}

main()
  .then(() => console.log('Done!'))
  .catch(console.error)
  .finally(() => process.exit(0))
