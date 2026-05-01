import { useState, useEffect, useCallback } from 'react';
import { Product, ProductPayload } from '@/types';
import { getProducts, saveProduct, deleteProduct } from '@/api/api';
import { ProductFormData } from './ProductForm';

interface UseProductsReturn {
  products:      Product[];
  loading:       boolean;
  success:       string;
  clearSuccess:  () => void;
  submitProduct: (form: ProductFormData, editing: Product | null) => Promise<void>;
  removeProduct: (product: Product) => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [success,  setSuccess]  = useState('');

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
    } catch {
      /* surface errors via form state, not here */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  /**
   * Validate form data then build a typed ProductPayload and persist it.
   * Throws a plain Error with a user-facing message on validation failure.
   */
  const submitProduct = async (
    form:    ProductFormData,
    editing: Product | null,
  ): Promise<void> => {

    // ── Required field checks ────────────────────────────────────────────────
    if (!form.name.trim())        throw new Error('Product name is required.');
    if (!form.quantity)           throw new Error('Quantity is required.');
    if (!form.wholesalePrice)     throw new Error('Wholesale price is required.');
    if (!form.retailPrice)        throw new Error('Retail price is required.');

    // ── Numeric parsing ──────────────────────────────────────────────────────
    const quantity       = parseInt(form.quantity, 10);
    const wholesalePrice = parseFloat(form.wholesalePrice);
    const retailPrice    = parseFloat(form.retailPrice);

    if (isNaN(quantity)       || quantity       < 0) throw new Error('Quantity must be a non-negative number.');
    if (isNaN(wholesalePrice) || wholesalePrice < 0) throw new Error('Wholesale price must be a non-negative number.');
    if (isNaN(retailPrice)    || retailPrice    < 0) throw new Error('Retail price must be a non-negative number.');

    // ── Expiry date (optional) ───────────────────────────────────────────────
    // Form field is `expiryDate` (camelCase); the API payload uses `expiry_date`.
    let expiry_date: string | null = null;

    if (form.expiryDate) {
      const parsed = new Date(form.expiryDate);
      if (isNaN(parsed.getTime())) throw new Error('Invalid expiry date.');

      // Only block past dates when creating — editing must allow keeping an
      // existing past expiry that is already recorded on the product.
      if (!editing) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsed < today) throw new Error('Expiry date cannot be in the past for a new product.');
      }

      expiry_date = parsed.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // ── Build typed payload ──────────────────────────────────────────────────
    const payload: ProductPayload = {
      name: form.name.trim(),
      quantity,
      wholesalePrice,
      retailPrice,
      expiry_date,   // null when not provided — matches ProductPayload.expiry_date?: string | null
    };

    await saveProduct(editing ? { id: editing.id, ...payload } : payload);
    flash(editing ? 'Product updated successfully.' : 'Product added successfully.');
    await reload();
  };

  const removeProduct = async (product: Product): Promise<void> => {
    await deleteProduct(product.id);
    flash('Product deleted successfully.');
    await reload();
  };

  return {
    products,
    loading,
    success,
    clearSuccess: () => setSuccess(''),
    submitProduct,
    removeProduct,
  };
}