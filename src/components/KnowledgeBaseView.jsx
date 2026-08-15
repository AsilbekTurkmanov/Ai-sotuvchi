import React, { useState } from 'react';
import { 
  BookOpen, 
  Package, 
  HelpCircle, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles,
  DollarSign,
  ShieldCheck,
  Truck,
  CreditCard
} from 'lucide-react';

export default function KnowledgeBaseView({ products, faq, settings, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateFaq, onAddFaq, onDeleteFaq, onUpdateSettings }) {
  const [activeSubTab, setActiveSubTab] = useState("products"); // products, faq, rules
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddFaqModal, setShowAddFaqModal] = useState(false);

  // New Product Form State
  const [newProd, setNewProd] = useState({
    name: "",
    category: "Smartfonlar",
    price: "",
    oldPrice: "",
    colors: "Black, Natural Titanium",
    stock: 10,
    installmentMonthly: "",
    description: "",
    features: "",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"
  });

  // New FAQ Form State
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: ""
  });

  // Business Rules Form State
  const [rules, setRules] = useState({
    deliveryInfo: settings.deliveryInfo || "",
    installmentInfo: settings.installmentInfo || "",
    warrantyInfo: settings.warrantyInfo || "",
    returnPolicy: settings.returnPolicy || "",
    workingHours: settings.workingHours || "",
    address: settings.address || ""
  });

  const [savingRules, setSavingRules] = useState(false);

  const handleSaveProduct = (e) => {
    e.preventDefault();
    onAddProduct({
      ...newProd,
      price: Number(newProd.price),
      oldPrice: Number(newProd.oldPrice || 0),
      stock: Number(newProd.stock),
      installmentMonthly: Number(newProd.installmentMonthly) || Math.round(Number(newProd.price) / 12)
    });
    setShowAddProductModal(false);
    setNewProd({
      name: "",
      category: "Smartfonlar",
      price: "",
      oldPrice: "",
      colors: "Black, Natural Titanium",
      stock: 10,
      installmentMonthly: "",
      description: "",
      features: "",
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"
    });
  };

  const handleSaveFaq = (e) => {
    e.preventDefault();
    onAddFaq(newFaq);
    setShowAddFaqModal(false);
    setNewFaq({ question: "", answer: "" });
  };

  const handleSaveBusinessRules = (e) => {
    e.preventDefault();
    setSavingRules(true);
    onUpdateSettings(rules);
    setTimeout(() => setSavingRules(false), 600);
  };

  const formatPrice = (num) => new Intl.NumberFormat('uz-UZ').format(num || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Knowledge Base
            </span>
            <h1 className="text-xl font-extrabold text-white">Biznes Bilimlar Bazasi</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            AI sotuvchi ushbu ma'lumotlar, mahsulotlar va qoidalar asosida mijozlarga aniq va ishonchli javob beradi.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs self-start">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === 'products' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📦 Mahsulotlar ({products.length})
          </button>
          <button
            onClick={() => setActiveSubTab('faq')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === 'faq' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ❓ FAQ ({faq.length})
          </button>
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === 'rules' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚙️ Biznes Qoidalari
          </button>
        </div>
      </div>

      {/* 1. PRODUCTS SUB-TAB */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200">Mahsulotlar Katalogi</h2>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Mahsulot Qo'shish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-slate-800">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">
                      {prod.category}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600/80 backdrop-blur-md text-[10px] font-bold text-white">
                      Zaxirada: {prod.stock} ta
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white mb-1">{prod.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">{prod.description}</p>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-base font-extrabold text-white">
                      {formatPrice(prod.price)} UZS
                    </span>
                    {prod.oldPrice > prod.price && (
                      <span className="text-xs text-slate-500 line-through">
                        {formatPrice(prod.oldPrice)} UZS
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-indigo-300 font-medium mb-3">
                    Muddatli to'lov: oyiga {formatPrice(prod.installmentMonthly || Math.round(prod.price / 12))} UZS
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Ranglar: {prod.colors?.join(', ')}
                  </span>
                  <button
                    onClick={() => onDeleteProduct(prod.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. FAQ SUB-TAB */}
      {activeSubTab === 'faq' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200">Tez-tez Beriladigan Savollar (FAQ)</h2>
            <button
              onClick={() => setShowAddFaqModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi FAQ Qo'shish</span>
            </button>
          </div>

          <div className="space-y-3">
            {faq.map((item) => (
              <div
                key={item.id}
                className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <h3 className="text-xs font-bold text-white">{item.question}</h3>
                  </div>
                  <p className="text-xs text-slate-300 pl-6 leading-relaxed">{item.answer}</p>
                </div>
                <button
                  onClick={() => onDeleteFaq(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BUSINESS RULES SUB-TAB */}
      {activeSubTab === 'rules' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-3xl">
          <h2 className="text-sm font-bold text-white mb-1">Do'kon va Savdo Qoidalari</h2>
          <p className="text-xs text-slate-400 mb-6">
            AI yetkazib berish, kafolat, to'lov va qaytarish bo'yicha savollarga aynan shu ma'lumotlar bilan javob qaytaradi.
          </p>

          <form onSubmit={handleSaveBusinessRules} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                Yetkazib berish shartlari (Delivery Info)
              </label>
              <textarea
                rows="2"
                value={rules.deliveryInfo}
                onChange={(e) => setRules({ ...rules, deliveryInfo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                Bo'lib to'lash shartlari (Installment / Nasiya)
              </label>
              <textarea
                rows="2"
                value={rules.installmentInfo}
                onChange={(e) => setRules({ ...rules, installmentInfo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Kafolat va Original ekanligi (Warranty & Authenticity)
              </label>
              <textarea
                rows="2"
                value={rules.warrantyInfo}
                onChange={(e) => setRules({ ...rules, warrantyInfo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Qaytarish va almashtirish siyosati (Return Policy)
              </label>
              <textarea
                rows="2"
                value={rules.returnPolicy}
                onChange={(e) => setRules({ ...rules, returnPolicy: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Do'kon Manzili</label>
                <input
                  type="text"
                  value={rules.address}
                  onChange={(e) => setRules({ ...rules, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ish Vaqti</label>
                <input
                  type="text"
                  value={rules.workingHours}
                  onChange={(e) => setRules({ ...rules, workingHours: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
              >
                {savingRules ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>{savingRules ? "Saqlandi!" : "Qoidalarni Saqlash"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Yangi Mahsulot Qo'shish</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Mahsulot Nomi</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="iPhone 16 Pro 256GB"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kategoriya</label>
                  <input
                    type="text"
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Zaxiradagi soni</label>
                  <input
                    type="number"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Narxi (UZS)</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    placeholder="12500000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Eski narx (Chegirma uchun)</label>
                  <input
                    type="number"
                    value={newProd.oldPrice}
                    onChange={(e) => setNewProd({ ...newProd, oldPrice: e.target.value })}
                    placeholder="13200000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mavjud ranglar (vergul bilan)</label>
                <input
                  type="text"
                  value={newProd.colors}
                  onChange={(e) => setNewProd({ ...newProd, colors: e.target.value })}
                  placeholder="Black Titanium, Natural Titanium"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Qisqacha Tavsif</label>
                <textarea
                  rows="2"
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  placeholder="A17 Pro chip, 48MP kamera..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add FAQ Modal */}
      {showAddFaqModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Yangi FAQ Qo'shish</h3>
              <button onClick={() => setShowAddFaqModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Mijoz Savoli</label>
                <input
                  type="text"
                  required
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  placeholder="Mahsulot originalmi?"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">AI Javobi</label>
                <textarea
                  rows="3"
                  required
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="Ha, biz faqat 100% original..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddFaqModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
