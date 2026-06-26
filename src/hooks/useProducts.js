import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/**
 * Fetch products from Supabase. Shared by the public catalogue and the
 * owner inventory page.
 *
 * @param {object}  opts
 * @param {boolean} opts.activeOnly  when true, only is_active = true rows
 *                                   (public catalogue). Owner inventory
 *                                   passes false to see everything.
 */
export function useProducts({ activeOnly = true } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProducts([])
      setLoading(false)
      setError('not-configured')
      return
    }
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (activeOnly) query = query.eq('is_active', true)

      const { data, error: qErr } = await query
      if (qErr) throw qErr
      setProducts(data || [])
    } catch (err) {
      console.error('Failed to load products:', err)
      setError(err.message || 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [activeOnly])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}
