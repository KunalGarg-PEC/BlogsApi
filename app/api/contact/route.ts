import nodemailer from "nodemailer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req:any) {
  try {
    const { fullName, companyName, workEmail, phoneNumber, message } = await req.json();

    // Configure the transporter with your email service credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_PASSWORD, // Your Gmail password or app password
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: "gargkunal369@gmail.com", // Destination email address
      subject: "New Contact Form Submission",
      text: `
Full Name: ${fullName}
Company Name: ${companyName}
Work Email: ${workEmail}
Phone Number: ${phoneNumber}
Message: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email: ", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500 }
    );
  }
}
