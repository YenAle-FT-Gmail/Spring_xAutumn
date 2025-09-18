import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
    to: string
    subject: string
    html: string
    from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
    try {
        const result = await resend.emails.send({
            from: from || process.env.FROM_EMAIL || 'noreply@hydrusbilling.com',
            to,
            subject,
            html,
        })

        return { success: true, data: result }
    } catch (error) {
        console.error('Failed to send email:', error)
        return { success: false, error }
    }
}

// Email templates
export const emailTemplates = {
    paymentFailed: (customerName: string, amount: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Payment Failed</h2>
      <p>Hi ${customerName},</p>
      <p>We were unable to process your payment of ${amount}. Please update your payment method to continue using our service.</p>
      <p>
        <a href="#" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Update Payment Method
        </a>
      </p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Billing Team</p>
    </div>
  `,

    trialEnding: (customerName: string, daysLeft: number) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Your Trial is Ending Soon</h2>
      <p>Hi ${customerName},</p>
      <p>Your free trial will expire in ${daysLeft} days. To continue using our service without interruption, please add a payment method.</p>
      <p>
        <a href="#" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Add Payment Method
        </a>
      </p>
      <p>Thank you for trying our service!</p>
      <p>Best regards,<br>The Team</p>
    </div>
  `,

    winBackOffer: (customerName: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8b5cf6;">We Miss You!</h2>
      <p>Hi ${customerName},</p>
      <p>We noticed you haven't been active lately. We'd love to have you back!</p>
      <p>As a welcome back gift, here are <strong>500 free credits</strong> to get you started again.</p>
      <p>
        <a href="#" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Claim Your Credits
        </a>
      </p>
      <p>We hope to see you soon!</p>
      <p>Best regards,<br>The Team</p>
    </div>
  `
}