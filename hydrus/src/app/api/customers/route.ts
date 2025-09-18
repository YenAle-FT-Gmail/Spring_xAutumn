import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Stripe from "stripe"
import { z } from "zod"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-04-10",
})

const createCustomerSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
    metadata: z.record(z.string()).optional(),
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
        const validatedData = createCustomerSchema.parse(body)

        // Create customer in Stripe
        const stripeCustomer = await stripe.customers.create({
            email: validatedData.email,
            name: validatedData.name,
            metadata: validatedData.metadata || {},
        })

        // Save to database
        const customer = await db.customer.create({
            data: {
                stripeCustomerId: stripeCustomer.id,
                email: validatedData.email,
                name: validatedData.name,
                metadata: validatedData.metadata || {},
            },
        })

        return NextResponse.json({
            success: true,
            customer,
            stripeCustomer,
        })

    } catch (error) {
        console.error("Error creating customer:", error)

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

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const search = searchParams.get("search")

        const skip = (page - 1) * limit

        const whereClause = search
            ? {
                OR: [
                    { email: { contains: search, mode: "insensitive" as const } },
                    { name: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {}

        const [customers, total] = await Promise.all([
            db.customer.findMany({
                where: whereClause,
                include: {
                    subscriptions: {
                        include: {
                            product: true,
                            price: true,
                        },
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
                skip,
                take: limit,
            }),
            db.customer.count({ where: whereClause }),
        ])

        return NextResponse.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })

    } catch (error) {
        console.error("Error fetching customers:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}