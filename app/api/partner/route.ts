import nodemailer from "nodemailer";
import { NextResponse } from "next/server";


// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // or restrict to your domain
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// POST handler: Sends email and stores submission data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: any) {
    console.log("fullName");
  try {
    const { fullName, workEmail, phoneNumber, OrganisationName, WebsiteUrl, Field, location, message } = await req.json();
    console.log(fullName);
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
      to: "gargkunal369@gmail.com",
      subject: "New Partner Form Submission",
      text: `
Full Name: ${fullName}
Organisation Name: ${OrganisationName}
Work Email: ${workEmail}
Phone Number: ${phoneNumber}
Message: ${message}
WebsiteUrl: ${WebsiteUrl}
Field: ${Field}
location: ${location}
      `,
    };

    await transporter.sendMail(mailOptions);
    

    const response = NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  } catch (error) {
    console.error("Error sending email: ", error);
    const response = NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }
}
