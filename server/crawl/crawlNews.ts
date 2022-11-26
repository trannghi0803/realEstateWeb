import { CategoryType, RealEstateType } from "../utils/enums";
import realEstateNewModel from "../models/realEstateNews"

const puppeteer = require("puppeteer");

const crawlNews = {

    //Gét url của trang batdongsan.com
    //let originalUrl = "https://batdongsan.com.vn/nha-dat-ban";

    getLink: async (originalUrl: string) => {
        const browser = await puppeteer.launch({
            // userAgent: randomUA.generate(),
            // stealth: true,
            // useChrome: true,
            headless: false,
            ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();
        await page.goto(originalUrl, { waitUntil: "networkidle2" });

        let data = await page.evaluate(() => {
            let news: string[] = [];
            let news_wrapper = document.querySelectorAll(
                ".re__news-item > div"
                );
                
                news_wrapper.forEach((product) => {
                    // let dataJson = {};
                    let obj: any = {}
                    try {
                    const uri = product.querySelector("a")?.href;
                        const imageThumb: any = product.querySelector("img");
                    obj.uri = uri;
                    obj.imageThumb = imageThumb?.src;
                    obj && news.push(obj);
                } catch (err) {
                    console.log(err);
                }
            });
            return news;
        });
        // console.log("data", data);

        await browser.close();
        return data;
    },

    saveDataToDB: async (url: any[]) => {
        for (let i = 0; i < url.length;) {
            const item = await getNewsDetail(url[i].uri);
            //Lưu vào database
            
            if (item !== undefined) {

                //save category to DB
                let newsData = {
                    title: item.title,
                    abstract: item.abstract,
                    content: item.content,
                    imageThumb: url[i]?.imageThumb
                }

                const newNews= new realEstateNewModel(newsData);
                await newNews.save();
            }

            i++;
        }
    },
}

//Hàm mở web để crawl data theo 1 url truyền vào
const getNewsDetail = async (url: string) => {
    const browser = await puppeteer.launch({
        // userAgent: randomUA.generate(),
        // stealth: true,
        // useChrome: true,
        headless: false,
        ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    let data = await page.evaluate(() => {
        try {
            let dataJson: any = {};
            //Get Title
            let title: any = document.querySelector(".re__detail-heading");
            if (title) {
                dataJson.title = title?.outerText || "";
            }

            //get subtract
            let abstract: any = document.querySelector(".re__detail-sapo")?.innerHTML
            if (abstract) {
                dataJson.abstract = abstract || "";
            }

            // get content
            let content = document.getElementById("divContents")?.innerHTML;
            if (content) {
                dataJson.content = content || "";
            }

            return dataJson;
        } catch (err) { }
    });
    // console.log("data", data);

    // save(data);
    await browser.close(); // lấy xong đóng tab
    return data;
};
export default crawlNews
