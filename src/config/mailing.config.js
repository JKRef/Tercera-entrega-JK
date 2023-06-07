import nodemailer from 'nodemailer';
import config from './config.js';

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.SYS_EMAIL,
        pass: config.SYS_EMAIL_PASS
    }
})

export const passwordRecoveryEmail = async (user_email, link) => {
    await transport.sendMail({
        from: `System Admin <${config.SYS_EMAIL}>`,
        to: `${user_email}`,
        subject: 'Password Recovery',
        html: `<h1>Password Recovery Request</h1>
        <p>Did you forget your password? If so, please click the button below to create a new one.If you did not lose your password, Link will expire in one hour.</p>
        <a href="http://localhost:3000/pwdrecover/${link}" target="_blank" class="v-button" style="box-sizing: border-box;display: inline-block;font-family:arial,helvetica,sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #3AAEE0; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;font-size: 14px;">
            <span style="display:block;padding:10px 20px;line-height:120%;"><span style="line-height: 16.8px;">Recover Password</span></span>
        </a>
        <p>If you didn't request to recover your password, please dissmiss this email.</p>`,
        attachments: []
    })
}