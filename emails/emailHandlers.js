import { resendClient, sender } from "../lib/resend.js";



import { createWelcomeEmailTemplate } from "./emailTemplates.js";


export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const { data, error } = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to Chatify!",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    if (error) {
      console.error("❌ Error sending welcome email:", error);
      throw new Error("Failed to send welcome email");
    }

    console.log("✅ Welcome Email sent successfully:", data);
  } catch (err) {
    console.error("🚨 Email sending failed:", err);
  }
};
