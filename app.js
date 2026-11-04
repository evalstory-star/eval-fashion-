const SUPABASE_URL = "https://nrrujezwgyuivzxqvjxh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycnVqZXp3Z3l1aXZ6eHF2anhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3OTExMDEsImV4cCI6MjEwOTM2NzEwMX0.h2YArv0ru7kWK5wU60fO-VjtHIuYUQLBk9SkRJ6gBRw";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let products = [];
let reviews = [];
let staffList = [];
let categories = ['عبايات', 'طرح', 'فساتين', 'ملابس كاجوال'];
let cart = [];
let storeSettings = {
    whatsapp: '201108396536',
    fb: 'https://facebook.com',
    ig: 'https://instagram.com',
    aboutText: 'متجر EVAL يقدم أرقى تصاميم الأزياء المصنوعة بعناية لتلبي ذوقك الفريد.',
    contactText: 'للاستفسارات والطلب المباشر، يرافقكم فريقنا عبر الواتساب والهاتف المتاح طوال أيام الأسبوع.',
    payments: { cod: true, instapay: true, visa: true, bank: true }
};

window.addEventListener('DOMContentLoaded', async () => {
    loadLocalState();
    await fetchProducts();
    await fetchReviews();
    renderCategories();
    renderProducts();
    renderCart();
    renderDynamicContent();

    // الدخول للوحة الإدارة فقط عند وجود الرمز السري في الرابط
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'eval2026') {
        openAuthModal();
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
}

function loadLocalState() {
    const savedCats = localStorage.getItem('eval_categories');
    if (savedCats) categories = JSON.parse(savedCats);
    const savedSettings = localStorage.getItem('eval_settings');
    if (savedSettings) storeSettings = JSON.parse(savedSettings);
    const savedCart = localStorage.getItem('eval_cart');
    if (savedCart) cart = JSON.parse(savedCart);

    document.getElementById('admin-whatsapp').value = storeSettings.whatsapp;
    document.getElementById('admin-fb').value = storeSettings.fb;
    document.getElementById('admin-ig').value = storeSettings.ig;
    document.getElementById('admin-about-text').value = storeSettings.aboutText;
    document.getElementById('admin-contact-text').value = storeSettings.contactText;
    
    document.getElementById('pay-cod').checked = storeSettings.payments.cod;
    document.getElementById('pay-instapay').checked = storeSettings.payments.instapay;
    document.getElementById('pay-visa').checked = storeSettings.payments.visa;
    document.getElementById('pay-bank').checked = storeSettings.payments.bank;
}

function switchTab(tab) {
    ['store', 'cart', 'contact', 'reviews', 'about', 'admin'].forEach(v => {
        document.getElementById(`view-${v}`).classList.add('hidden');
    });
    document.getElementById(`view-${tab}`).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if(tab === 'reviews') renderReviews();
}

function openAuthModal() { document.getElementById('auth-modal').classList.remove('hidden'); }
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }

async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (user === "admin" && pass === "5528332$777262&eval") {
        currentUser = { username: 'المدير الرئيسي', role: 'admin' };
        setupDashboard();
        return;
    }

    try {
        const { data } = await _supabase.from('staff_users').select('*').eq('username', user).eq('password', pass).single();
        if (data) {
            if (!data.is_active) { alert("الحساب معطل!"); return; }
            currentUser = { username: data.username, role: data.role };
            setupDashboard();
        } else { alert("بيانات الدخول غير صحيحة!"); }
    } catch (err) { alert("بيانات الدخول غير صحيحة!"); }
}

async function setupDashboard() {
    closeAuthModal();
    switchTab('admin');
    document.getElementById('admin-welcome-title').innerText = `أهلاً بك، ${currentUser.username}`;
    document.getElementById('admin-role-badge').innerText = currentUser.role === 'admin' ? 'صلاحية: المدير الرئيسي' : 'صلاحية: موظف';

    if (currentUser.role === 'admin') {
        document.getElementById('super-admin-panel').classList.remove('hidden');
        document.getElementById('store-settings-panel').classList.remove('hidden');
        await fetchStaffList();
    } else {
        document.getElementById('super-admin-panel').classList.add('hidden');
        document.getElementById('store-settings-panel').classList.add('hidden');
    }

    renderAdminCategories();
    renderAdminProductsList();
    renderAdminReviewsList();
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
}

function logoutAdmin() { currentUser = null; switchTab('store'); }

async function fetchStaffList() {
    try {
        const { data } = await _supabase.from('staff_users').select('*').order('created_at', { ascending: false });
        if (data) staffList = data;
        renderStaffList();
    } catch (err) { console.error(err); }
}

async function handleCreateStaff(e) {
    e.preventDefault();
    const user = document.getElementById('staff-user').value.trim();
    const pass = document.getElementById('staff-pass').value.trim();
    try {
        await _supabase.from('staff_users').insert([{ username: user, password: pass, role: 'staff', is_active: true }]);
        showToast("تم إنشاء حساب الموظف!");
        document.getElementById('staff-user').value = '';
        document.getElementById('staff-pass').value = '';
        await fetchStaffList();
    } catch (err) { alert("خطأ أو اسم المستخدم مستعمل مسبقاً"); }
}

async function toggleStaffStatus(id, currentActive) {
    await _supabase.from('staff_users').update({ is_active: !currentActive }).eq('id', id);
    await fetchStaffList();
}

async function deleteStaff(id) {
    if (!confirm("هل أنت متأكد من حذف الحساب؟")) return;
    await _supabase.from('staff_users').delete().eq('id', id);
    await fetchStaffList();
}

function renderStaffList() {
    const container = document.getElementById('staff-users-list');
    if (staffList.length === 0) { container.innerHTML = '<p class="text-xs text-gray-500 py-2">لا يوجد موظفين مضافين.</p>'; return; }
    container.innerHTML = staffList.map(s => `
        <div class="py-2.5 flex items-center justify-between text-sm">
            <div>
                <span class="font-bold text-gray-200">${s.username}</span>
                <span class="text-xs px-2 py-0.5 rounded ${s.is_active ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'} mr-2">${s.is_active ? 'نشط' : 'معطل'}</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="toggleStaffStatus(${s.id}, ${s.is_active})" class="text-xs px-2.5 py-1 rounded font-bold ${s.is_active ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}">${s.is_active ? 'تعطيل' : 'تفعيل'}</button>
                <button onclick="deleteStaff(${s.id})" class="text-xs px-2.5 py-1 bg-rose-600 text-white rounded font-bold">حذف</button>
            </div>
        </div>
    `).join('');
}

async function fetchProducts() {
    try {
        const { data } = await _supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) products = data;
    } catch (err) { console.error(err); }
}

async function fetchReviews() {
    try {
        const { data } = await _supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (data) reviews = data;
    } catch (err) { console.error(err); }
}

function renderDynamicContent() {
    document.getElementById('dynamic-about-content').innerHTML = `<p>${storeSettings.aboutText.replace(/\n/g, '<br>')}</p>`;
    document.getElementById('dynamic-contact-content').innerHTML = `
        <p>${storeSettings.contactText.replace(/\n/g, '<br>')}</p>
        <div class="pt-4 flex items-center gap-3 text-emerald-800 font-bold">
            <i class="fa-brands fa-whatsapp text-2xl"></i>
            <span>رقم الواتساب: ${storeSettings.whatsapp}</span>
        </div>
    `;
    document.getElementById('footer-fb').href = storeSettings.fb;
    document.getElementById('footer-ig').href = storeSettings.ig;
    document.getElementById('footer-wa').href = `https://wa.me/${storeSettings.whatsapp}`;
}

// نافذة عرض تفاصيل المنتج واختيار المقاسات والألوان
function openProductDetailModal(pId) {
    const p = products.find(prod => String(prod.id) === String(pId));
    if (!p) return;

    const modalContent = document.getElementById('modal-product-content');
    
    const sizesArr = (p.sizes && p.sizes.length) ? p.sizes : ['Free Size'];
    const sizesHTML = sizesArr.map((s, idx) => `
        <label class="flex items-center gap-1.5 px-3 py-2 border rounded-xl cursor-pointer text-xs font-bold hover:bg-emerald-50">
            <input type="radio" name="modal_selected_size" value="${s}" ${idx === 0 ? 'checked' : ''}>
            ${s}
        </label>
    `).join('');

    const colorsArr = (p.colors && p.colors.length) ? p.colors : ['أساسي'];
    const colorsHTML = colorsArr.map((c, idx) => `
        <label class="flex items-center gap-1.5 px-3 py-2 border rounded-xl cursor-pointer text-xs font-bold hover:bg-emerald-50">
            <input type="radio" name="modal_selected_color" value="${c}" ${idx === 0 ? 'checked' : ''}>
            ${c}
        </label>
    `).join('');

    modalContent.innerHTML = `
        <div>
            <img src="${p.image_url}" class="w-full h-80 sm:h-96 object-cover rounded-2xl border shadow-sm" alt="${p.name}">
        </div>
        <div class="flex flex-col justify-between space-y-4">
            <div class="space-y-4">
                <div>
                    <span class="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">${p.category}</span>
                    <h3 class="text-2xl font-black text-gray-900 mt-2">${p.name}</h3>
                    <p class="text-emerald-800 font-black text-2xl mt-1">${p.price} ج.م</p>
                </div>
                ${p.fabric ? `<p class="text-xs font-bold text-gray-500">الخامة المصنعة: <span class="text-gray-900">${p.fabric}</span></p>` : ''}
                <p class="text-sm text-gray-600 leading-relaxed">${p.description || 'تصميم حصري من متجر EVAL بأرقى معايير الجودة.'}</p>
                
                <div class="space-y-2 border-t pt-3">
                    <label class="block text-xs font-bold text-gray-800">اختر المقاس:</label>
                    <div class="flex flex-wrap gap-2">${sizesHTML}</div>
                </div>

                <div class="space-y-2 border-t pt-3">
                    <label class="block text-xs font-bold text-gray-800">اختر اللون:</label>
                    <div class="flex flex-wrap gap-2">${colorsHTML}</div>
                </div>
            </div>

            <button onclick="addConfiguredToCart('${p.id}')" class="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-base">
                <i class="fa-solid fa-cart-plus text-xl"></i> إضافة للسلة بالتفاصيل المختارة
            </button>
        </div>
    `;
    document.getElementById('product-detail-modal').classList.remove('hidden');
}

function closeProductDetailModal() { document.getElementById('product-detail-modal').classList.add('hidden'); }

function addConfiguredToCart(pId) {
    const p = products.find(prod => String(prod.id) === String(pId));
    if (!p) return;

    const selectedSize = document.querySelector('input[name="modal_selected_size"]:checked')?.value || 'Free Size';
    const selectedColor = document.querySelector('input[name="modal_selected_color"]:checked')?.value || 'أساسي';

    const cartItem = {
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url,
        size: selectedSize,
        color: selectedColor
    };

    cart.push(cartItem);
    localStorage.setItem('eval_cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
    closeProductDetailModal();
    showToast(`تم إضافة ${p.name} (مقاس: ${selectedSize} - لون: ${selectedColor}) للسلة!`);
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'جاري النشر...';
    try {
        const file = document.getElementById('p-image').files[0];
        const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
        await _supabase.storage.from('product-images').upload(fileName, file);
        const { data: urlData } = _supabase.storage.from('product-images').getPublicUrl(fileName);

        const selectedSizes = Array.from(document.querySelectorAll('#sizes-selector input:checked')).map(cb => cb.value);
        const selectedColors = Array.from(document.querySelectorAll('#colors-selector input:checked')).map(cb => cb.value);

        const newProduct = {
            name: document.getElementById('p-name').value.trim(),
            category: document.getElementById('p-category').value,
            price: parseFloat(document.getElementById('p-price').value),
            fabric: document.getElementById('p-fabric').value.trim(),
            description: document.getElementById('p-desc').value.trim(),
            sizes: selectedSizes.length > 0 ? selectedSizes : ['Free Size'],
            colors: selectedColors.length > 0 ? selectedColors : ['أساسي'],
            image_url: urlData.publicUrl,
            is_available: true
        };

        await _supabase.from('products').insert([newProduct]);
        showToast("تم نشر القطعة بنجاح!");
        document.getElementById('product-form').reset();
        await fetchProducts();
        renderProducts();
        renderAdminProductsList();
    } catch (err) { alert("خطأ: " + err.message); }
    finally { saveBtn.disabled = false; saveBtn.innerText = "نشر القطعة"; }
}

async function toggleProductAvailability(id, currentStatus) {
    await _supabase.from('products').update({ is_available: !currentStatus }).eq('id', id);
    await fetchProducts(); renderProducts(); renderAdminProductsList();
}

async function deleteProduct(id) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await _supabase.from('products').delete().eq('id', id);
    await fetchProducts(); renderProducts(); renderAdminProductsList();
}

async function submitReview(e) {
    e.preventDefault();
    const name = document.getElementById('review-name').value.trim();
    const comment = document.getElementById('review-text').value.trim();
    await _supabase.from('reviews').insert([{ name, comment }]);
    showToast("تم نشر تعليقك بنجاح!");
    document.getElementById('review-name').value = '';
    document.getElementById('review-text').value = '';
    await fetchReviews(); renderReviews();
}

async function deleteReview(id) {
    await _supabase.from('reviews').delete().eq('id', id);
    await fetchReviews(); renderReviews(); renderAdminReviewsList();
}

function saveStoreSettings() {
    storeSettings.whatsapp = document.getElementById('admin-whatsapp').value.trim();
    storeSettings.fb = document.getElementById('admin-fb').value.trim();
    storeSettings.ig = document.getElementById('admin-ig').value.trim();
    storeSettings.aboutText = document.getElementById('admin-about-text').value.trim();
    storeSettings.contactText = document.getElementById('admin-contact-text').value.trim();
    storeSettings.payments.cod = document.getElementById('pay-cod').checked;
    storeSettings.payments.instapay = document.getElementById('pay-instapay').checked;
    storeSettings.payments.visa = document.getElementById('pay-visa').checked;
    storeSettings.payments.bank = document.getElementById('pay-bank').checked;

    localStorage.setItem('eval_settings', JSON.stringify(storeSettings));
    renderDynamicContent();
    showToast("تم حفظ الإعدادات بنجاح!");
}

function renderCategories() {
    const container = document.getElementById('category-filters');
    const select = document.getElementById('p-category');
    container.innerHTML = `<button onclick="filterByCategory('all')" class="cat-btn active px-6 py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white whitespace-nowrap shadow-sm">الكل</button>`;
    select.innerHTML = '';
    categories.forEach(c => {
        container.innerHTML += `<button onclick="filterByCategory('${c}')" class="cat-btn px-6 py-2.5 rounded-xl text-sm font-bold bg-white text-gray-600 hover:bg-gray-100 border border-gray-100 shadow-sm">${c}</button>`;
        select.innerHTML += `<option value="${c}">${c}</option>`;
    });
}

function renderAdminCategories() {
    document.getElementById('admin-cat-list').innerHTML = categories.map(c => `
        <span class="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700">${c}</span>
    `).join('');
}

function renderProducts(filter = 'all') {
    const grid = document.getElementById('products-grid');
    const items = filter === 'all' ? products : products.filter(p => p.category === filter);
    if (items.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-16 text-gray-400 font-bold">لا توجد منتجات متوفرة حالياً.</div>`;
        return;
    }
    grid.innerHTML = items.map(p => {
        const avail = p.is_available !== false;
        return `
            <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative">
                ${!avail ? '<div class="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center"><span class="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow">نفذت الكمية</span></div>' : ''}
                <img src="${p.image_url}" onclick="openProductDetailModal('${p.id}')" class="w-full h-52 sm:h-64 object-cover cursor-pointer hover:opacity-95 transition-all" alt="${p.name}">
                <div class="p-4 flex flex-col flex-grow space-y-2">
                    <span class="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md w-fit">${p.category}</span>
                    <h3 onclick="openProductDetailModal('${p.id}')" class="font-bold text-gray-900 text-sm line-clamp-1 cursor-pointer hover:text-emerald-800 transition-all">${p.name}</h3>
                    <div class="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
                        <span class="font-black text-emerald-800 text-base">${p.price} ج.م</span>
                        ${avail ? `<button onclick="openProductDetailModal('${p.id}')" class="p-2 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 text-xs font-bold flex items-center gap-1"><i class="fa-solid fa-eye"></i> عرض وتخصيص</button>` : '<span class="text-xs font-bold text-gray-400">غير متوفر</span>'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterByCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => { b.classList.remove('bg-gray-900', 'text-white'); b.classList.add('bg-white', 'text-gray-600'); });
    event.target.classList.add('bg-gray-900', 'text-white');
    renderProducts(cat);
}

function renderReviews() {
    const list = document.getElementById('reviews-list');
    if(reviews.length === 0) { list.innerHTML = `<p class="text-sm text-gray-400">لا توجد تعليقات حتى الآن.</p>`; return; }
    list.innerHTML = reviews.map(r => `
        <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <h4 class="font-bold text-sm text-gray-900">${r.name}</h4>
            <p class="text-xs text-gray-600">${r.comment}</p>
        </div>
    `).join('');
}

function renderAdminProductsList() {
    document.getElementById('admin-products-list').innerHTML = products.map(p => `
        <div class="py-3 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <img src="${p.image_url}" class="w-12 h-12 rounded-xl object-cover" alt="">
                <div><h4 class="font-bold text-sm text-gray-900">${p.name}</h4><p class="text-xs text-gray-500">${p.price} ج.م</p></div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="toggleProductAvailability(${p.id}, ${p.is_available !== false})" class="px-3 py-1.5 rounded-xl text-xs font-bold ${p.is_available !== false ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-800'}">${p.is_available !== false ? 'إيقاف' : 'تفعيل'}</button>
                <button onclick="deleteProduct(${p.id})" class="p-2 text-rose-600"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function renderAdminReviewsList() {
    document.getElementById('admin-reviews-list').innerHTML = reviews.map(r => `
        <div class="py-3 flex items-center justify-between gap-4">
            <div><h4 class="font-bold text-sm text-gray-900">${r.name}</h4><p class="text-xs text-gray-600">${r.comment}</p></div>
            <button onclick="deleteReview(${r.id})" class="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold">حذف التعليق</button>
        </div>
    `).join('');
}

function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (cart.length > 0) { badge.innerText = cart.length; badge.classList.remove('hidden'); }
    else { badge.classList.add('hidden'); }
}

function renderCart() {
    updateCartBadge();
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    const payContainer = document.getElementById('payment-methods-container');

    if (cart.length === 0) {
        container.innerHTML = `<p class="text-center py-8 text-gray-400 font-bold">السلة فارغة حالياً.</p>`;
        summary.classList.add('hidden');
        return;
    }

    summary.classList.remove('hidden');
    let total = 0;
    container.innerHTML = cart.map((item, idx) => {
        total += Number(item.price);
        return `
            <div class="flex items-center justify-between gap-4 border-b pb-3 last:border-0">
                <div class="flex items-center gap-3">
                    <img src="${item.image_url}" class="w-14 h-14 rounded-xl object-cover" alt="">
                    <div>
                        <h4 class="font-bold text-sm text-gray-900">${item.name}</h4>
                        <div class="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <span>المقاس: ${item.size || 'Free Size'}</span> | 
                            <span>اللون: ${item.color || 'أساسي'}</span>
                        </div>
                        <p class="text-xs text-emerald-800 font-bold mt-0.5">${item.price} ج.م</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${idx})" class="text-rose-500 text-xs font-bold">إزالة</button>
            </div>
        `;
    }).join('');

    document.getElementById('cart-total-price').innerText = `${total} ج.م`;

    let payHTML = '';
    if(storeSettings.payments.cod) payHTML += `<label class="flex items-center gap-2 p-3 bg-gray-50 border rounded-xl cursor-pointer"><input type="radio" name="pay_method" value="الدفع عند الاستلام" checked> الدفع عند الاستلام</label>`;
    if(storeSettings.payments.instapay) payHTML += `<label class="flex items-center gap-2 p-3 bg-gray-50 border rounded-xl cursor-pointer"><input type="radio" name="pay_method" value="Instapay / فودافون كاش"> InstaPay / فودافون كاش</label>`;
    if(storeSettings.payments.visa) payHTML += `<label class="flex items-center gap-2 p-3 bg-gray-50 border rounded-xl cursor-pointer"><input type="radio" name="pay_method" value="بطاقة ائتمانية / Visa"> Visa / Master</label>`;
    if(storeSettings.payments.bank) payHTML += `<label class="flex items-center gap-2 p-3 bg-gray-50 border rounded-xl cursor-pointer"><input type="radio" name="pay_method" value="تحويل بنكي مباشر"> تحويل بنكي مباشر</label>`;
    payContainer.innerHTML = payHTML;
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    localStorage.setItem('eval_cart', JSON.stringify(cart));
    renderCart();
}

function checkoutWhatsApp() {
    if (cart.length === 0) return;
    const selectedPay = document.querySelector('input[name="pay_method"]:checked')?.value || 'الدفع عند الاستلام';
    let msg = `مرحباً EVAL، أود تأكيد الطلب التفصيلي التالي:\n\n`;
    let total = 0;
    cart.forEach((item, i) => {
        msg += `📌 قطعة رقم (${i + 1}): ${item.name}\n`;
        msg += `   - السعر: ${item.price} ج.م\n`;
        msg += `   - المقاس المختار: ${item.size || 'Free Size'}\n`;
        msg += `   - اللون المختار: ${item.color || 'أساسي'}\n\n`;
        total += Number(item.price);
    });
    msg += `💳 طريقة الدفع: ${selectedPay}\n`;
    msg += `💰 إجمالي المبلغ: ${total} ج.م`;

    const cleanPhone = storeSettings.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}
