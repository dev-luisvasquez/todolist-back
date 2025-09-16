import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

export async function sendEmail({
    to,
    subject,
    text,
    templatePath,
    variables
}: {
    to: string;
    subject: string;
    text?: string;
    templatePath?: string;
    variables?: Record<string, string>;
}) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let html: string = '';
    if (templatePath) {
        const template = fs.readFileSync(path.resolve(templatePath), 'utf8');
        html = template.replace(/{{(\w+)}}/g, (_, key) => variables?.[key] || '');
    }

    const info = await transporter.sendMail({
        from: 'TodoList <no-reply@todolist.com>',
        to,
        subject,
        text,
        html
    });

    // URL para ver el correo enviado en Ethereal
    return nodemailer.getTestMessageUrl(info);
}
