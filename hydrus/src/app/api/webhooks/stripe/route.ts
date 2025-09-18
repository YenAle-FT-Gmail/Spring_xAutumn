import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { db } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-04-10",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const headersList = headers()
        const signature = headersList.get("stripe-signature")

        if (!signature) {
            return NextResponse.json(
                { error: "Missing stripe-signature header" },
                { status: 400 }
            )
        }

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err) {
            console.error("Webhook signature verification failed:", err)
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            )
        }

        // Log the webhook event
        await db.webhookLog.create({
            data: {
                eventId: event.id,
                eventType: event.type,
                processed: false,
                data: event as any,
            },
        })

        // Handle different event types
        switch (event.type) {
            case "customer.subscription.created":
                await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
                break

            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
                break

            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
                break

            case "invoice.payment_succeeded":
                await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
                break

            case "invoice.payment_failed":
                await handlePaymentFailed(event.data.object as Stripe.Invoice)
                break

            case "customer.created":
                await handleCustomerCreated(event.data.object as Stripe.Customer)
                break

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        // Mark webhook as processed
        await db.webhookLog.updateMany({
            where: { eventId: event.id },
            data: { processed: true },
        })

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        )
    }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
        // Find customer in our database
        const customer = await db.customer.findUnique({
            where: { stripeCustomerId: subscription.customer as string },
        })

        if (!customer) {
            console.warn("Customer not found for subscription:", subscription.id)
            return
        }

        // Find product and price
        const priceId = subscription.items.data[0]?.price.id
        const price = await db.price.findUnique({
            where: { stripePriceId: priceId },
            include: { product: true },
        })

        if (!price) {
            console.warn("Price not found for subscription:", subscription.id)
            return
        }

        // Create subscription record
        await db.subscription.create({
            data: {
                customerId: customer.id,
                productId: price.productId,
                priceId: price.id,
                stripeSubscriptionId: subscription.id,
                status: subscription.status.toUpperCase() as any,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                quantity: subscription.items.data[0]?.quantity || 1,
                metadata: subscription.metadata,
            },
        })

        console.log("Subscription created:", subscription.id)
    } catch (error) {
        console.error("Error handling subscription created:", error)
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
        await db.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: subscription.status.toUpperCase() as any,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                quantity: subscription.items.data[0]?.quantity || 1,
                metadata: subscription.metadata,
            },
        })

        console.log("Subscription updated:", subscription.id)
    } catch (error) {
        console.error("Error handling subscription updated:", error)
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
        await db.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: "CANCELED",
                canceledAt: new Date(),
            },
        })

        console.log("Subscription deleted:", subscription.id)
    } catch (error) {
        console.error("Error handling subscription deleted:", error)
    }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
        if (invoice.subscription) {
            // Update subscription payment status
            await db.subscription.updateMany({
                where: { stripeSubscriptionId: invoice.subscription as string },
                data: {
                    status: "ACTIVE",
                },
            })
        }

        console.log("Payment succeeded for invoice:", invoice.id)
    } catch (error) {
        console.error("Error handling payment succeeded:", error)
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    try {
        if (invoice.subscription) {
            // Update subscription status to past_due
            await db.subscription.updateMany({
                where: { stripeSubscriptionId: invoice.subscription as string },
                data: {
                    status: "PAST_DUE",
                },
            })

            // TODO: Trigger dunning email sequence
            console.log("Payment failed - should trigger dunning emails")
        }

        console.log("Payment failed for invoice:", invoice.id)
    } catch (error) {
        console.error("Error handling payment failed:", error)
    }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
    try {
        // Check if customer already exists
        const existingCustomer = await db.customer.findUnique({
            where: { stripeCustomerId: customer.id },
        })

        if (existingCustomer) {
            return
        }

        // Create customer record
        await db.customer.create({
            data: {
                stripeCustomerId: customer.id,
                email: customer.email || "",
                name: customer.name,
                metadata: customer.metadata,
            },
        })

        console.log("Customer created:", customer.id)
    } catch (error) {
        console.error("Error handling customer created:", error)
    }
}