import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, ReceiptLineItem, PaymentMethod, Receipt } from '../../types';
import { PrintReceiptModal } from '../payments/PrintReceiptModal';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Printer,
  CheckCircle2,
  AlertCircle,
  Package,
  Pill,
  User,
  Phone,
  CreditCard,
  Smartphone,
  Banknote,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const PointOfSaleView: React.FC = () => {
  const {
    inventoryItems,
    issueItemizedReceipt,
    currentFacility,
    currentUser,
    showToast
  } = useApp();

  // Inventory search & category filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Pharmacy');

  // POS Cart State
  const [cart, setCart] = useState<ReceiptLineItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in OTC Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState('');

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Filter inventory items (Active items from shared clinic inventory)
  const availableItems = inventoryItems.filter(item => {
    if (!item.isActive) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      return matchName || matchCode;
    }
    return true;
  });

  // Categories list
  const categories = ['ALL', 'Pharmacy', 'Supplies', 'Consumables', 'Laboratory', 'Procedure'];

  // Add Item to Cart
  const handleAddToCart = (item: InventoryItem) => {
    if (item.stockQuantity <= 0) {
      showToast(`${item.name} is currently out of stock.`, 'warning');
      return;
    }

    const existingIndex = cart.findIndex(c => c.itemId === item.id);
    if (existingIndex >= 0) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= item.stockQuantity) {
        showToast(`Cannot add more than available stock (${item.stockQuantity} ${item.unit}).`, 'warning');
        return;
      }
      setCart(prev =>
        prev.map((line, idx) => {
          if (idx === existingIndex) {
            const nextQty = line.quantity + 1;
            const nextTot = nextQty * line.unitPrice;
            return {
              ...line,
              quantity: nextQty,
              totalPrice: nextTot,
              amountPayable: nextTot
            };
          }
          return line;
        })
      );
    } else {
      setCart(prev => [
        ...prev,
        {
          itemId: item.id,
          itemCode: item.code,
          itemName: item.name,
          category: item.category,
          unitPrice: item.unitPrice,
          quantity: 1,
          totalPrice: item.unitPrice,
          coveredByPackage: false,
          amountPayable: item.unitPrice
        }
      ]);
    }
  };

  // Update item quantity
  const handleUpdateQty = (index: number, delta: number) => {
    const line = cart[index];
    const sourceItem = inventoryItems.find(i => i.id === line.itemId);
    const maxStock = sourceItem ? sourceItem.stockQuantity : 9999;

    setCart(prev =>
      prev
        .map((item, idx) => {
          if (idx === index) {
            const nextQty = item.quantity + delta;
            if (nextQty > maxStock) {
              showToast(`Only ${maxStock} units available in stock.`, 'warning');
              return item;
            }
            if (nextQty <= 0) return null;
            const nextTot = nextQty * item.unitPrice;
            return {
              ...item,
              quantity: nextQty,
              totalPrice: nextTot,
              amountPayable: nextTot
            };
          }
          return item;
        })
        .filter(Boolean) as ReceiptLineItem[]
    );
  };

  // Remove item from cart
  const handleRemoveFromCart = (index: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  // Clear cart
  const handleClearCart = () => {
    setCart([]);
    setAmountTendered(0);
  };

  // Financial Totals
  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const changeDue = Math.max(0, amountTendered - totalAmount);

  // Quick cash bill buttons
  const handleQuickCash = (amount: number) => {
    setAmountTendered(amount);
  };

  // Checkout and issue official POS receipt
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Please add at least one medication or item to the cart.', 'error');
      return;
    }

    if (paymentMethod === 'Cash' && amountTendered < totalAmount) {
      showToast(`Amount tendered (UGX ${amountTendered.toLocaleString()}) is less than total (UGX ${totalAmount.toLocaleString()}).`, 'warning');
      return;
    }

    // Issue receipt using shared inventory billing logic
    const receipt = issueItemizedReceipt({
      patientId: `otc-${Date.now().toString().slice(-6)}`,
      patientName: customerName.trim() || 'Walk-in OTC Customer',
      memberId: 'OTC-WALK-IN',
      cardNumber: 'OVER-THE-COUNTER',
      queueNumber: 'PHARM-OTC',
      lineItems: cart,
      subtotal: totalAmount,
      packageDeductionValue: 0,
      totalPayable: totalAmount,
      amountPaid: paymentMethod === 'Cash' ? amountTendered : totalAmount,
      change: paymentMethod === 'Cash' ? changeDue : 0,
      paymentMethod: paymentMethod,
      paymentReference: paymentRef.trim() || `${paymentMethod.toUpperCase()}-OTC-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `Over-the-counter pharmacy sale. Customer phone: ${customerPhone || 'N/A'}`
    });

    showToast(`OTC sale completed for ${customerName}! Stock updated in clinic inventory.`, 'success');

    // Launch print preview immediately
    setActiveReceipt(receipt);
    setShowReceiptModal(true);

    // Reset cart
    setCart([]);
    setAmountTendered(0);
    setCustomerName('Walk-in OTC Customer');
    setCustomerPhone('');
    setPaymentRef('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pharmacy Point of Sale (POS)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">
                Direct Over-The-Counter
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                Live Shared Inventory
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Sell drugs, vitamins, and supplies over-the-counter to walk-in clients • Live stock deduction • Xprinter thermal receipt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <Package className="w-4 h-4 text-emerald-600" />
          <span>Shared Clinic Inventory: <strong>{inventoryItems.length} items cataloged</strong></span>
        </div>
      </div>

      {/* Main 2-Column POS Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inventory Catalog & Product Picker (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search drug, medication, consumable, SKU..."
                className="w-full text-xs font-medium rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Category Badges */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {availableItems.length > 0 ? (
              availableItems.map(item => {
                const isOutOfStock = item.stockQuantity <= 0;
                const isLowStock = item.stockQuantity > 0 && item.stockQuantity <= 10;
                const inCartLine = cart.find(c => c.itemId === item.id);

                return (
                  <button
                    key={item.id}
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(item)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between relative group ${
                      isOutOfStock
                        ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                        : inCartLine
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-2xs hover:border-emerald-500'
                        : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-xs'
                    }`}
                  >
                    {inCartLine && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                        {inCartLine.quantity}
                      </span>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                        <Pill className="w-3 h-3 text-emerald-600" />
                        <span>{item.code}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">{item.unit}</p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        UGX {item.unitPrice.toLocaleString()}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isOutOfStock ? 'Out of stock' : `${item.stockQuantity} left`}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No inventory items match "{searchTerm}" in {selectedCategory}.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Cart & Fast Checkout (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-sm text-slate-900">Active Sale Cart</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Customer Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Customer Name (Walk-in)
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Walk-in Customer"
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 pl-8 pr-2.5 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 0701445920"
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 pl-8 pr-2.5 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
            {cart.length > 0 ? (
              cart.map((line, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{line.itemName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{line.itemCode}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(idx, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(idx, 1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right shrink-0 min-w-[70px]">
                    <span className="font-mono font-bold text-slate-900 block">
                      UGX {line.totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFromCart(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                <ShoppingCart className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                <p>Cart is empty. Click any item on the left to add.</p>
              </div>
            )}
          </div>

          {/* Payment & Checkout Form */}
          <form onSubmit={handleCheckout} className="space-y-3 pt-2 border-t border-slate-100 text-xs">
            {/* Grand Total Display */}
            <div className="p-3 bg-slate-950 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Grand Total</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  UGX {totalAmount.toLocaleString()}
                </span>
              </div>

              <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-[10px] font-bold text-slate-300">
                {cart.length} line items
              </span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Cash', 'Mobile Money', 'Card/POS'] as PaymentMethod[]).map(pm => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      paymentMethod === pm
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {pm === 'Cash' && <Banknote className="w-3.5 h-3.5" />}
                    {pm === 'Mobile Money' && <Smartphone className="w-3.5 h-3.5" />}
                    {pm === 'Card/POS' && <CreditCard className="w-3.5 h-3.5" />}
                    <span>{pm}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Tender & Quick Notes */}
            {paymentMethod === 'Cash' && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    Amount Tendered (UGX)
                  </label>
                  {amountTendered > 0 && (
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      Change: UGX {changeDue.toLocaleString()}
                    </span>
                  )}
                </div>

                <input
                  type="number"
                  value={amountTendered || ''}
                  onChange={e => setAmountTendered(Number(e.target.value))}
                  placeholder={`e.g. ${totalAmount}`}
                  className="w-full text-base font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500"
                />

                {/* Quick denomination pills */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Exact / Notes:</span>
                  <button
                    type="button"
                    onClick={() => setAmountTendered(totalAmount)}
                    className="px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold"
                  >
                    Exact
                  </button>
                  {[10000, 20000, 50000, 100000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickCash(val)}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-mono font-bold"
                    >
                      {val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reference for Mobile Money or Card */}
            {paymentMethod !== 'Cash' && (
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Transaction Reference / TID
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. MTN MoMo TID / Card Approval Code"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Complete Purchase Button */}
            <button
              type="submit"
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Complete Sale &amp; Print Receipt</span>
            </button>
          </form>
        </div>
      </div>

      {/* Official Receipt Modal (Auto-triggered upon completed sale) */}
      {showReceiptModal && activeReceipt && (
        <PrintReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          receipt={activeReceipt}
        />
      )}
    </div>
  );
};
