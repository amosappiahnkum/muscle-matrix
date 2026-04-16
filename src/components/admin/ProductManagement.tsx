// Product Management Component

import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { getProducts, saveProduct, deleteProduct } from '../../utils/database';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Edit2, Trash2, X, Check, AlertCircle, Search, Package } from 'lucide-react';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    wholesalePrice: '',
    retailPrice: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(getProducts());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.quantity || !formData.wholesalePrice || !formData.retailPrice) {
      setError('Please fill in all fields');
      return;
    }

    const quantity = parseInt(formData.quantity);
    const wholesalePrice = parseFloat(formData.wholesalePrice);
    const retailPrice = parseFloat(formData.retailPrice);

    if (quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    if (wholesalePrice < 0 || retailPrice < 0) {
      setError('Prices cannot be negative');
      return;
    }

    const product: Product = {
      id: editingProduct?.id || uuidv4(),
      name: formData.name,
      quantity,
      wholesalePrice,
      retailPrice,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProduct(product);
    loadProducts();
    resetForm();
    setSuccess(editingProduct ? 'Product updated successfully' : 'Product added successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      quantity: product.quantity.toString(),
      wholesalePrice: product.wholesalePrice.toString(),
      retailPrice: product.retailPrice.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      loadProducts();
      setSuccess('Product deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', quantity: '', wholesalePrice: '', retailPrice: '' });
    setEditingProduct(null);
    setShowForm(false);
    setError('');
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-bold text-white">Product Management</h3>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              placeholder="Search products..."
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h4>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Quantity Available</label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Wholesale Price (GH₵)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Retail Price (GH₵)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.retailPrice}
                    onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
                >
                  {editingProduct ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left text-gray-300 font-medium p-4">Product Name</th>
                <th className="text-center text-gray-300 font-medium p-4">Quantity</th>
                <th className="text-right text-gray-300 font-medium p-4">Wholesale (GH₵)</th>
                <th className="text-right text-gray-300 font-medium p-4">Retail (GH₵)</th>
                <th className="text-right text-gray-300 font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 p-8">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p>No products found. {searchQuery ? 'Try a different search.' : 'Click "Add Product" to create one.'}</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                    <td className="p-4 text-white font-medium">{product.name}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.quantity <= 10 
                          ? 'bg-red-500/20 text-red-400' 
                          : product.quantity <= 50
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-right text-blue-400">{product.wholesalePrice.toFixed(2)}</td>
                    <td className="p-4 text-right text-green-400">{product.retailPrice.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
