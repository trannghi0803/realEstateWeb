const nodemailer = require("nodemailer");
const { google } = require ("googleapis");

const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";

const CLIENT_ID = "1087046308497-uh5ovqgb43tlglpjb982inoj6mm0gagm.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = "1//04mGy7SRwoq55CgYIARAAGAQSNwF-L9IrgMiT6apuwhpVIPFNL90o4hD723ozA_9rDaVN8OT4hDzzPRsDaLiP-uaTElH8aK4A5eQ";
const SENDER_MAIL = "tvnghi0803@gmail.com";

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    OAUTH_PLAYGROUND
    );
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });


// send mail
const sendEmail = async (to: string, url: string, txt: string, password?: string) => {
    
    try {
        const access_token = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: SENDER_MAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                access_token: access_token,
            },
        });

        const mailOptions = {
            from: SENDER_MAIL,
            to: to,
            subject: "Bất động sản TVN Land",
            html: 
                password ? 
                    `
                    <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                    <h2 style="text-align: center; text-transform: uppercase;color: teal;">Chào mừng bạn đến với TVN Land</h2>
                    <p>${txt}:
                    </p>
                    
                    <p>Email: ${to}</p>
                    <p>Mật khẩu: ${password}</p>
                
                    </div>
                    `
                    :
            `
                    <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                    <h2 style="text-align: center; text-transform: uppercase;color: teal;">Chào mừng bạn đến với TVN Land</h2>
                    <p>Bạn vừa đăng kí tài khoản tại TVN Land.
                        vui lòng nhấn vào nút bên dưới để xác thực email của bạn
                    </p>
                    
                    <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
                
                    <p>Nếu nút không hoạt động bạn có thể nhấn vào link bên dưới:</p>
                
                    <div>${url}</div>
                    </div>
                    `,
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (err) {
        console.log(err);
    }
};

export default sendEmail;