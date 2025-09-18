import { z } from "zod"

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Product name too long"),
  description: z.string().optional(),
  pricingModel: z.enum(["STANDARD_SUBSCRIPTION", "METERED_BILLING", "PREPAID_CREDITS"], {
    required_error: "Please select a pricing model",
  }),
  amount: z.number().min(0, "Amount must be positive").max(999999, "Amount too large"),
  currency: z.enum(["USD", "EUR", "GBP"], {
    required_error: "Please select a currency",
  }),
  interval: z.enum(["MONTHLY", "YEARLY"], {
    required_error: "Please select a billing interval",
  }),
  intervalCount: z.number().min(1, "Interval count must be at least 1").max(12, "Interval count too large").default(1),
  trialDays: z.number().min(0, "Trial days must be non-negative").max(365, "Trial period too long").optional(),
  requirePayment: z.boolean().default(false),
})

export type ProductFormData = z.infer<typeof productFormSchema>

export const pricingModelOptions = [
  {
    value: "STANDARD_SUBSCRIPTION" as const,
    label: "Standard Subscription",
    description: "Fixed recurring payment (monthly/yearly)"
  },
  {
    value: "METERED_BILLING" as const,
    label: "Metered Billing",
    description: "Pay-per-use based on consumption"
  },
  {
    value: "PREPAID_CREDITS" as const,
    label: "Prepaid Credits",
    description: "Buy credits upfront, use as needed"
  },
]

export const currencyOptions = [
  { value: "USD" as const, label: "USD ($)" },
  { value: "EUR" as const, label: "EUR (€)" },
  { value: "GBP" as const, label: "GBP (£)" },
]

export const intervalOptions = [
  { value: "MONTHLY" as const, label: "Monthly" },
  { value: "YEARLY" as const, label: "Yearly" },
]