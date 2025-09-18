import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function HomePage() {
    const session = await auth()

    if (session) {
        redirect("/admin")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Hydrus Billing</CardTitle>
                    <CardDescription>
                        Self-hostable, open-source billing platform
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 text-center">
                        Manage your subscription billing with configurable pricing models,
                        automated dunning, and proactive churn prevention.
                    </p>
                    <Link href="/auth/signin" className="w-full">
                        <Button className="w-full">
                            Get Started
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}