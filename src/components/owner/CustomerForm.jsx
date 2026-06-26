import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label, FieldError } from '@/components/ui/input'
import { useToast } from '@/context/ToastContext'

const EMPTY = { name: '', phone: '', address: '' }

export function CustomerForm({ open, onClose, customer, onSaved }) {
  const { success, error: toastError } = useToast()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(customer)

  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? { name: customer.name || '', phone: customer.phone || '', address: customer.address || '' }
          : EMPTY
      )
      setErrors({})
    }
  }, [open, customer])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Customer name is required.'
    const phone = form.phone.replace(/[^0-9]/g, '')
    if (!form.phone.trim()) e.phone = 'Phone number is required.'
    else if (phone.length < 10) e.phone = 'Enter a valid phone number.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const row = {
        ...(customer?.id ? { id: customer.id } : {}),
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || null,
      }
      const { error } = await supabase.from('customers').upsert(row)
      if (error) throw error
      success(isEdit ? 'Customer updated' : 'Customer added')
      onSaved?.()
      onClose()
    } catch (err) {
      console.error('Save customer failed:', err)
      toastError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      variant="slideover"
      title={isEdit ? 'Edit Customer' : 'Add Customer'}
      description={isEdit ? form.name : 'Add a customer to your database.'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Save changes' : 'Add customer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="c-name" required>
            Customer Name
          </Label>
          <Input
            id="c-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Ramesh Kumar"
          />
          <FieldError>{errors.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="c-phone" required>
            Phone Number
          </Label>
          <Input
            id="c-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="e.g. +91 90000 00000"
          />
          <FieldError>{errors.phone}</FieldError>
        </div>
        <div>
          <Label htmlFor="c-address">Address</Label>
          <Textarea
            id="c-address"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Street, area, city…"
          />
        </div>
      </form>
    </Dialog>
  )
}
