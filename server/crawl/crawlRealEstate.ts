import categoryController from "../controllers/categoryController";
import { CategoryType, IsHighLight, RealEstateType } from "../utils/enums";
import categoryModel from "../models/realEstateCategory"
import realEstateModel from "../models/realEstate"

const puppeteer = require("puppeteer");

const crawlRealEstate = {

    //Gét url của trang batdongsan.com
    //let originalUrl = "https://batdongsan.com.vn/nha-dat-ban";

    getLink: async (originalUrl: string) => {
        const browser = await puppeteer.launch({
            headless: false,
            ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();
        await page.goto(originalUrl, { waitUntil: "networkidle2", timeout: 0 });

        let data = await page.evaluate(() => {
            let products: any[] = [];
            let product_wrapper = document.querySelectorAll(".js__card");
            console.log("product_wrapper", product_wrapper);

            product_wrapper.forEach((product: any) => {
                try {
                    const uri: any = product.querySelector(".js__product-link-for-product-id")?.href;
                    products.push(uri);
                } catch (err) {
                    console.log(err);
                }
            });

            return products;
        });

        await browser.close();
        return data;
    },

    // let Url = getLink(originalUrl);
    // let data = pageDetail(
    //     "https://batdongsan.com.vn/ban-can-ho-chung-cu-duong-pham-kiet-phuong-khue-my-prj-the-sang-residence/qua-k-bo-lo-co-i-dau-tu-chi-1-3-ty-so-huu-vinh-vien-view-bien-khe-c-thue-30tr-thang-pr34749215"
    // );


    saveDataToDB: async (Url: string[]) => {
        for (let i = 0; i < Url.length;) {
            const existUri = await realEstateModel.findOne({ slug: Url[i] });
            if (!existUri) {
                const item = await pageDetail(Url[i]);
                //Lưu vào database
                //LoaiTinDang
                if (item !== undefined) {

                    //save category to DB
                    let categoryResult: any;
                    const category = await categoryModel.findOne({ name: item.category, type: CategoryType.Sell });
                    if (category) {
                        categoryResult = category;
                    } else {
                        let categoryData = {
                            name: item.category || "",
                            type: CategoryType.Sell,
                            description: item.category,
                        }

                        const newCategory = new categoryModel(categoryData);
                        categoryResult = await newCategory.save();
                    }

                    //save realEstate
                    let realEstateData = {
                        user: "637a80dde9d7f152fba5b5d4",
                        title: item.title,
                        price: item.price,
                        area: item.area,
                        description: item.description,
                        status: 1,
                        attributes: item.attributes,
                        images: item.images,
                        category: categoryResult._id,
                        categoryType: CategoryType.Sell,
                        address: {
                            provinceName: item.provinceName,
                            districtName: item.districtName,
                            wardName: item.wardName,
                            addressLine: item.addressLine
                        },
                        type: RealEstateType.Crawl,
                        isHighLight: IsHighLight.false,
                        slug: Url[i] || "",
                        // createAt: new Date(1667602110*1000)
                    }
                    const newRealEstate = new realEstateModel(realEstateData);
                    await newRealEstate.save();
                }
            }
            i++;
        }
    },
}
//Hàm mở web để crawl data theo 1 url truyền vào
const pageDetail = async (Url: string) => {
    const browser = await puppeteer.launch({
        // userAgent: randomUA.generate(),
        // stealth: true,
        // useChrome: true,
        headless: false,
        ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.goto(Url, { waitUntil: "networkidle2", timeout: 0 });

    let data = await page.evaluate(() => {
        // try {
        let detail: any[] = [];
        let dataJson: any = {};

        //Get Title
        let title: any = document.querySelector(".re__pr-title")
        if (title) {
            dataJson.title = title?.outerText || "";
        }

        //Get image
        let image: any = document.querySelectorAll(".js__media-item-container")
        if (image) {
            //let imgList = document.querySelectorAll(".js__media-item-container");
            image.forEach((img: any) => {
                try {
                    const image = img.querySelector(".re__overlay img").getAttribute("data-src");
                    image && detail.push(image);
                } catch (err) {
                    console.log(err);
                }
            });
        }

        //Get địa chỉ
        let address: any = document.querySelector(".re__pr-short-description")?.innerHTML;
        if (address) {
            // const address = document.querySelector(".re__pr-short-description")?.innerText || "";
            //Tách chuổi địa chỉ thành phường xã, quận huyện, tỉnh thành
            const result = address.split(", ");
            dataJson.addressLine = result[result.length - 4] || "";
            dataJson.wardName = result[result.length - 3] || "";
            dataJson.districtName = result[result.length - 2] || "";
            dataJson.provinceName = result[result.length - 1] || "";
        }

        //Get giá
        let price: any = document.querySelector(".re__pr-short-info div:nth-child(1) span:nth-child(2)")?.innerHTML
        if (price) {
            const result = price.split(" ");
            let priceResult: number = 0
            let priceNumber = result[result.length - 2]
            let priceRefix = result[result.length - 1]
            switch (priceRefix) {
                case 'tỷ':
                    priceResult = Number(priceNumber || 0) * 1000000000
                    break;
                case 'triệu':
                    priceResult = Number(priceNumber || 0) * 1000000
                    break;
                default: priceResult = 0
                    break;
            }
            dataJson.price = priceResult || 0;
        }

        //Get diện tích
        let area: any = document.querySelector(".re__pr-short-info div:nth-child(2) span:nth-child(2)")?.innerHTML
        if (area) {
            const areaData = area || "";
            let areaTemp = areaData.split(" ", 1) || 0;
            dataJson.area = Number(areaTemp[areaTemp.length - 1]) || 0;
        }

        //Get loại tin đăng
        let category: any = document.querySelector(".re__pr-specs-product-type")?.innerHTML
        if (category) {
            let data = category || "";
            const result = data.split(": ");
            dataJson.category = result[result.length - 1] || "";
        }

        //Get nội dung
        let description: any = document.querySelector(".re__pr-description > div")?.innerHTML
        if (description) {
            dataJson.description = description || "";
        }

        //Get đặc điểm
        let attributes: any = document.querySelector(".re__pr-specs-content")?.innerHTML
        if (attributes) {
            dataJson.attributes = attributes || "";
        }

        // detail.push(dataJson);
        dataJson.images = detail;
        return dataJson;
        // } catch (err) {}
    });
    // console.log("data", data);

    // save(data);
    await browser.close(); // lấy xong đóng tab
    return data;
};
export default crawlRealEstate
