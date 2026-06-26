import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/**
 * Confirmation dialog for destructive / irreversible actions.
 * `onConfirm` may be async — the confirm button shows a spinner while it runs.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}) {
  const [busy, setBusy] = useState(false)

  const handleConfirm = async () => {
    try {
      setBusy(true)
      await onConfirm?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} size="sm">
      <div className="flex gap-4">
        <div
          className={
            variant === 'danger'
              ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-bg text-danger'
              : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warning-bg text-warning'
          }
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirm}
              loading={busy}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
