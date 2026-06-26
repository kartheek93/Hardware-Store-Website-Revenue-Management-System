import { useEffect, useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PRODUCT_CATEGORIES, formatCurrency, compressImageToDataURL } from '@/lib/utils'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select, Label, FieldError } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/context/ToastContext'

const EMPTY = {
  name: '',
  category: 'Paints',
  description: '',
  cost_price: '',
  selling_price: '',
  stock_qty: '',
  reorder_level: '5',
  image_url: '',
  is_active: true,
}

export function ProductForm({ open, onClose, product, onSaved }) {
  const { success, error: toastError } = useToast()
  const fileRef = useRef(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(product)

  useEffect(() => {
    if (open) {
      if (product) {
        setForm({
          name: product.name || '',
          category: product.category || 'Paints',
          description: product.description || '',
          cost_price: String(product.cost_price ?? ''),
          selling_price: String(product.selling_price ?? ''),
          stock_qty: String(product.stock_qty ?? ''),
          reorder_level: String(product.reorder_level ?? '5'),
          image_url: product.image_url || '',
          is_active: product.is_active ?? true,
        })
        setImagePreview(product.image_url || '')
      } else {
        setForm(EMPTY)
        setImagePreview('')
      }
      setImageFile(null)
      setErrors({})
    }
  }, [open, product])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Product name is required.'
    if (form.cost_price === '' || Number(form.cost_price) < 0) e.cost_price = 'Enter a valid cost price.'
    if (form.selling_price === '' || Number(form.selling_price) < 0)
      e.selling_price = 'Enter a valid selling price.'
    if (Number(form.selling_price) < Number(form.cost_price))
      e.selling_price = 'Selling price is below cost price.'
    if (form.stock_qty === '' || Number(form.stock_qty) < 0) e.stock_qty = 'Enter a valid stock quantity.'
    if (form.reorder_level === '' || Number(form.reorder_level) < 0)
      e.reorder_level = 'Enter a valid reorder level.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toastError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toastError('Image must be under 5 MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Compress the chosen image in the browser and return a data URL stored
  // directly in products.image_url — no Storage bucket required.
  async function processImage() {
    if (!imageFile) return form.image_url || null
    return compressImageToDataURL(imageFile)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const id = product?.id || crypto.randomUUID()
      let imageUrl = form.image_url || null
      try {
        imageUrl = await processImage()
      } catch (imgErr) {
        console.error('Image processing failed:', imgErr)
        toastError('Could not process that image — saving product without it.')
        imageUrl = form.image_url || null
      }

      const row = {
        id,
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || null,
        cost_price: Number(form.cost_price),
        selling_price: Number(form.selling_price),
        stock_qty: parseInt(form.stock_qty, 10),
        reorder_level: parseInt(form.reorder_level, 10),
        image_url: imageUrl,
        is_active: form.is_active,
      }

      const { error: saveErr } = await supabase.from('products').upsert(row)
      if (saveErr) throw saveErr

      success(isEdit ? 'Product updated' : 'Product saved')
      onSaved?.()
      onClose()
    } catch (err) {
      console.error('Save product failed:', err)
      toastError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const margin =
    form.cost_price && form.selling_price
      ? Number(form.selling_price) - Number(form.cost_price)
      : null

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      variant="slideover"
      title={isEdit ? 'Edit Product' : 'Add Product'}
      description={isEdit ? form.name : 'Add a new product to your inventory.'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving} form="product-form">
            {isEdit ? 'Save changes' : 'Add product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Image */}
        <div>
          <Label>Product Image</Label>
          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                      set('image_url', '')
                    }}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                Choose image
              </Button>
              <p className="mt-1.5 text-xs text-muted-foreground">PNG/JPG, up to 5 MB.</p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="p-name" required>
            Product Name
          </Label>
          <Input
            id="p-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Asian Paints Apcolite (10L)"
          />
          <FieldError>{errors.name}</FieldError>
        </div>

        <div>
          <Label htmlFor="p-cat" required>
            Category
          </Label>
          <Select id="p-cat" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="p-desc">Description</Label>
          <Textarea
            id="p-desc"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Short description shown on the public catalogue."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="p-cost" required>
              Cost Price (₹)
            </Label>
            <Input
              id="p-cost"
              type="number"
              min="0"
              step="0.01"
              value={form.cost_price}
              onChange={(e) => set('cost_price', e.target.value)}
              placeholder="0.00"
            />
            <FieldError>{errors.cost_price}</FieldError>
          </div>
          <div>
            <Label htmlFor="p-sell" required>
              Selling Price (₹)
            </Label>
            <Input
              id="p-sell"
              type="number"
              min="0"
              step="0.01"
              value={form.selling_price}
              onChange={(e) => set('selling_price', e.target.value)}
              placeholder="0.00"
            />
            <FieldError>{errors.selling_price}</FieldError>
          </div>
        </div>

        {margin !== null && (
          <p className="-mt-1 text-xs text-muted-foreground">
            Margin per unit:{' '}
            <span className={margin >= 0 ? 'font-semibold text-success' : 'font-semibold text-danger'}>
              {formatCurrency(margin)}
            </span>
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="p-stock" required>
              Stock Quantity
            </Label>
            <Input
              id="p-stock"
              type="number"
              min="0"
              step="1"
              value={form.stock_qty}
              onChange={(e) => set('stock_qty', e.target.value)}
              placeholder="0"
            />
            <FieldError>{errors.stock_qty}</FieldError>
          </div>
          <div>
            <Label htmlFor="p-reorder" required>
              Reorder Level
            </Label>
            <Input
              id="p-reorder"
              type="number"
              min="0"
              step="1"
              value={form.reorder_level}
              onChange={(e) => set('reorder_level', e.target.value)}
              placeholder="5"
            />
            <FieldError>{errors.reorder_level}</FieldError>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
          <div>
            <Label className="mb-0">Active</Label>
            <p className="text-xs text-muted-foreground">Visible on the public catalogue when on.</p>
          </div>
          <Switch checked={form.is_active} onChange={(v) => set('is_active', v)} />
        </div>
      </form>
    </Dialog>
  )
}
