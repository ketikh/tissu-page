import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async (to: string, resetCode: string) => {
  const mailOptions = {
    from: `"Tissu" <${process.env.SMTP_USER || 'noreply@tissu.ge'}>`,
    to,
    subject: 'Tissu - პაროლის აღდგენა / Password Reset',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1c1c;">
        <h2 style="font-family: serif; color: #1c1c1c;">პაროლის აღდგენა / Password Reset</h2>
        <p>შენ მოითხოვე პაროლის აღდგენა შენი Tissu-ს ანგარიშისთვის. გთხოვთ გამოიყენოთ ქვემოთ მოცემული 6-ნიშნა კოდი:</p>
        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${resetCode}
        </div>
        <p>კოდი ვალიდურია შემდეგი 1 საათის განმავლობაში.</p>
        <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #eaeaea; padding-top: 20px;">
          თუ პაროლის აღდგენა არ მოგითხოვიათ, უბრალოდ უგულებელყავით ეს შეტყობინება. <br/>
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
