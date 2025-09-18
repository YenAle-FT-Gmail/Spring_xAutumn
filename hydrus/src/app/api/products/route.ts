import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { productFormSchema } from "@/lib/validations/product"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-04-10",
})

export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await req.json()
        const validatedData = productFormSchema.parse(body)

        // Create product in Stripe
        const stripeProduct = await stripe.products.create({
            name: validatedData.name,
            description: validatedData.description || undefined,
            metadata: {
                hydrus_product_id: "pending", // Will update after DB creation
            },
        })

        // Create price in Stripe based on pricing model
        let stripePrice

        if (validatedData.pricingModel === "STANDARD_SUBSCRIPTION") {
            stripePrice = await stripe.prices.create({
                product: stripeProduct.id,
                unit_amount: Math.round(validatedData.amount * 100), // Convert to cents
                currency: validatedData.currency.toLowerCase(),
                recurring: {
                    interval: validatedData.interval === "MONTHLY" ? "month" : "year",
                    interval_count: validatedData.intervalCount,
                },
                metadata: {
                    pricing_model: validatedData.pricingModel,
                },
            })
        } else if (validatedData.pricingModel === "METERED_BILLING") {
            stripePrice = await stripe.prices.create({
                product: stripeProduct.id,
                unit_amount: Math.round(validatedData.amount * 100),
                currency: validatedData.currency.toLowerCase(),
                billing_scheme: "per_unit",
                recurring: {
                    interval: validatedData.interval === "MONTHLY" ? "month" : "year",
                    interval_count: validatedData.intervalCount,
                    usage_type: "metered",
                },
                metadata: {
                    pricing_model: validatedData.pricingModel,
                },
            })
        } else {
            // PREPAID_CREDITS - One-time payment
            stripePrice = await stripe.prices.create({
                product: stripeProduct.id,
                unit_amount: Math.round(validatedData.amount * 100),
                currency: validatedData.currency.toLowerCase(),
                metadata: {
                    pricing_model: validatedData.pricingModel,
                },
            })
        }

        // Save to database
        const product = await db.product.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                pricingModel: validatedData.pricingModel,
                stripeProductId: stripeProduct.id,
                isActive: true,
                prices: {
                    create: {
                        amount: validatedData.amount,
                        currency: validatedData.currency,
                        billingInterval: validatedData.interval,
                        stripePriceId: stripePrice.id,
                        isActive: true,
                        // Trial configuration
                        ...(validatedData.trialDays && validatedData.trialDays > 0 && {
                            trialDays: validatedData.trialDays,
                            trialType: validatedData.requirePayment ? "PAID" : "FREE",
                        }),
                    },
                },
            },
            include: {
                prices: true,
            },
        })

        // Update Stripe product with the database ID
        await stripe.products.update(stripeProduct.id, {
            metadata: {
                hydrus_product_id: product.id,
            },
        })

        return NextResponse.json({
            success: true,
            product,
            stripeProduct,
            stripePrice,
        })

    } catch (error) {
        console.error("Error creating product:", error)

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const products = await db.product.findMany({
            include: {
                prices: {
                    where: { isActive: true },
                },
                _count: {
                    select: {
                        subscriptions: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json({ products })

    } catch (error) {
        console.error("Error fetching products:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}