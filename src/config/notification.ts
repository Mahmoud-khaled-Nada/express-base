export const notificationConfig = {
  email: {
    provider: process.env.EMAIL_PROVIDER || "sendgrid",
    sendgridApiKey: process.env.SENDGRID_API_KEY || "",
    from: process.env.EMAIL_FROM || "noreply@example.com",
  },
  sms: {
    provider: process.env.SMS_PROVIDER || "twilio",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
    from: process.env.TWILIO_PHONE_NUMBER || "",
  },
};
