// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  
  async function highlight(locator, color){

    await locator.evaluate((element, color) => {
    element.style.backgroundColor = color;
    }, color);
    
    await page.waitForTimeout(50);

    await locator.evaluate(element => {
      element.style.backgroundColor = "";
    });
  }

  const myTable = page.locator('#bigbox > td:nth-child(1) > table:nth-child(1)');
  //locator to the main table

  let range = true;
  let order = true;
  let old_time_stamp = 0;
  let rank_num = 0;

  while(range){

    let myTableRows = myTable.locator(':scope > tbody > tr');
    let myTableRowsCount = await myTableRows.count();
    
    for(let i = 0; i < myTableRowsCount; i++){

      const currentRow = myTableRows.nth(i);
      const rank = currentRow.locator('span.rank');
      const age = currentRow.locator('span.age');
      const more = currentRow.locator('.morelink');

      if( await rank.count() > 0){

        const rank_element_content = await rank.textContent();
        rank_num = parseInt(rank_element_content);


        const title_line = currentRow.locator('span.titleline > a');

        if(rank_num > 100){
          range = false;
          break;
        }
        if(rank_num % 2 == 0){
          await highlight(title_line, "yellow");
        }
        else{
          await highlight(title_line, "lightblue");
        }
      }

      else if( await age.count() > 0){
        const age_title = await age.getAttribute("title");
        const age_title_split = age_title.split(" ");
        const current_time_stamp = parseInt(age_title_split[1]);

        if(old_time_stamp === 0 ){
          old_time_stamp = current_time_stamp;
        }

        else if (old_time_stamp < current_time_stamp){
          order = false
          range = false;
          break;
        }

        else{
          old_time_stamp = current_time_stamp;
        }

      }

      else if ( await more.count() > 0 ){
        await page.waitForTimeout(10000);
        await more.click();
        break;
        //break if reached the end of the page
      }
    }

  }
  if(!order){
    console.log("All articles from rank 1 to " + rank_num - 1 + " are in reverse chronological order");
   
  }
    else{
    console.log("The first 100 articles are sorted from newest to oldest");
    }

  await browser.close();

}

(async () => {
  await sortHackerNewsArticles();
})();
