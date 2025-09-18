import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyRequest() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Check your email</CardTitle>
                    <CardDescription>
                        A sign in link has been sent to your email address.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600">
                        Click the link in the email to sign in to your account. The link will expire in 24 hours.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}