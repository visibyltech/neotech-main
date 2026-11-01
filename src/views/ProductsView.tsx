import React, { useState, useMemo } from 'react';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  Smartphone,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Product, Category, ProductCondition } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  searchQuery: string;
  initialCategory?: string;
  initialCondition?: ProductCondition;
  onOpenProduct: (product: Product) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  searchQuery,
  initialCategory,
  initialCondition,
  onOpenProduct,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedCondition, setSelectedCondition] = useState<string>(initialCondition || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync initial params if changed from navigation
  React.useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialCondition) setSelectedCondition(initialCondition);
  }, [initialCondition]);

  const brands = ['Apple', 'Samsung', 'Google', 'Accessories'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchModel = p.model?.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchModel && !matchDesc) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Condition
      if (selectedCondition !== 'all' && p.condition !== selectedCondition) {
        return false;
      }

      // Brand
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, selectedCondition, selectedBrand, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSelectedBrand('all');
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedCondition !== 'all' ||
    selectedBrand !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Sort Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smartphones & Device Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing <strong className="text-white">{filteredProducts.length}</strong> available devices
            {searchQuery && <span> for "{searchQuery}"</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2"
          >
            <Filter className="w-4 h-4 text-red-500" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden md:block md:col-span-3 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
                Refine Catalogue
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Category</label>
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${
                    selectedCategory === 'all'
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-950'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition ${
                      selectedCategory === c.id
                        ? 'bg-red-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-950'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition filter */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Condition</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'brand-new', label: 'New' },
                  { id: 'uk-used', label: 'UK-Used' },
                ].map(cond => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setSelectedCondition(cond.id)}
                    className={`py-1.5 rounded-lg border text-center transition ${
                      selectedCondition === cond.id
                        ? 'bg-red-600 text-white border-red-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand filter */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Brand</label>
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedBrand('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                    selectedBrand === 'all' ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Brands
                </button>
                {brands.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBrand(b)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      selectedBrand === b ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-9 space-y-6">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">Active filters:</span>
              {selectedCategory !== 'all' && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')}>
                    <X className="w-3 h-3 text-slate-400 hover:text-white" />
                  </button>
                </span>
              )}
              {selectedCondition !== 'all' && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                  Condition: {selectedCondition}
                  <button onClick={() => setSelectedCondition('all')}>
                    <X className="w-3 h-3 text-slate-400 hover:text-white" />
                  </button>
                </span>
              )}
              {selectedBrand !== 'all' && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('all')}>
                    <X className="w-3 h-3 text-slate-400 hover:text-white" />
                  </button>
                </span>
              )}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="p-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
              <Smartphone className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-white">No devices match your criteria</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Try clearing some filters or searching with a different device name.
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenProduct={onOpenProduct}
                  onSelectSaveToBuy={(p) => onNavigate('save-to-buy', { productId: p.id })}
                  onSelectBNPL={(p) => onNavigate('bnpl', { productId: p.id })}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end md:hidden">
          <div className="w-80 h-full bg-slate-900 border-l border-slate-800 p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-sm">Filter Devices</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-300 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-300 block">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="all">All Conditions</option>
                <option value="brand-new">Brand New Sealed</option>
                <option value="uk-used">UK-Used (Tested)</option>
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-300 block">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="all">All Brands</option>
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
