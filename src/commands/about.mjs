import { openAboutPage } from '../lib/about-ui.mjs';

export async function runAbout() {
  const { url } = await openAboutPage();
  console.log(`About: ${url}`);
}
