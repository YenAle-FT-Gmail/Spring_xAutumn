"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  productFormSchema, 
  type ProductFormData, 
  pricingModelOptions,
  currencyOptions,
  intervalOptions 
} from "@/lib/validations/product"
import { formatCurrency } from "@/lib/utils"

export function ProductForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      intervalCount: 1,
      requirePayment: false,
    },
  })

  const watchedValues = watch()
  const pricingModel = watch("pricingModel")
  const amount = watch("amount")
  const currency = watch("currency")
  const interval = watch("interval")

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create product")
      }

      const result = await response.json()
      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error("Error creating product:", error)
      // TODO: Add toast notification
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPreviewText = () => {
    if (!amount || !currency || !interval) return null
    
    const formattedAmount = formatCurrency(amount * 100, currency)
    const intervalText = interval === "MONTHLY" ? "month" : "year"
    
    return `${formattedAmount} per ${intervalText}`
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Set up the basic details for your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Pro Plan"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of your product"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Model</CardTitle>
          <CardDescription>
            Choose how customers will be charged for this product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pricing Model *</Label>
            <Select onValueChange={(value) => setValue("pricingModel", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pricing model" />
              </SelectTrigger>
              <SelectContent>
                {pricingModelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pricingModel && (
              <p className="text-sm text-red-600">{errors.pricingModel.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="25.00"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Currency *</Label>
              <Select onValueChange={(value) => setValue("currency", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-red-600">{errors.currency.message}</p>
              )}
            </div>
          </div>

          {pricingModel === "STANDARD_SUBSCRIPTION" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Billing Interval *</Label>
                <Select onValueChange={(value) => setValue("interval", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing interval" />
                  </SelectTrigger>
                  <SelectContent>
                    {intervalOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.interval && (
                  <p className="text-sm text-red-600">{errors.interval.message}</p>
                )}
              </div>

              {getPreviewText() && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Preview:</strong> Customers will be charged {getPreviewText()}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trial Settings</CardTitle>
          <CardDescription>
            Configure trial period and payment requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trialDays">Trial Period (days)</Label>
            <Input
              id="trialDays"
              type="number"
              min="0"
              max="365"
              placeholder="14"
              {...register("trialDays", { valueAsNumber: true })}
            />
            {errors.trialDays && (
              <p className="text-sm text-red-600">{errors.trialDays.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requirePayment"
              checked={watchedValues.requirePayment}
              onCheckedChange={(checked) => setValue("requirePayment", !!checked)}
            />
            <Label htmlFor="requirePayment" className="text-sm">
              Require payment method upfront (paid trial)
            </Label>
          </div>
          
          {watchedValues.requirePayment && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                With this option enabled, customers must provide payment details to start their trial.
                This helps verify legitimate customers and reduces trial abuse.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </form>
  )
}