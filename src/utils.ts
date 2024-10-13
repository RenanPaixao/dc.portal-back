import puppeteer from 'puppeteer-core'

export function getBrowser() {
  return puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: false,
  })
}
