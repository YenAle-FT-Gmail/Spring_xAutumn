import { ProductForm } from "@/components/admin/ProductForm"

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-gray-600">
          Set up a new product with configurable pricing and trial settings
        </p>
      </div>

      <ProductForm />
    </div>
  )
}