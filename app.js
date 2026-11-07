const SUPABASE_URL = "https://nrrujezwgyuivzxqvjxh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycnVqZXp3Z3l1aXZ6eHF2anhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3OTExMDEsImV4cCI6MjEwOTM2NzEwMX0.h2YArv0ru7kWK5wU60fO-VjtHIuYUQLBk9SkRJ6gBRw";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let products = [];
let reviews = [];
let staffList = [];
let categories = ['عبايات', 'طرح', 'فساتين', 'ملابس كاجوال'];
let cart = [];
let currentCategoryFilter = 'all';
let currentProductColors = ['أسود', 'بيج', 'أبيض'];

let storeSettings = {
    announcement: '✨ خصم حصري لفترة محدودة على تشكيلة الموسم الجديد - الشحن مجاني للطلبات الكبرى',
    heroBg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
    heroBadge: 'موسم الأزياء الراقية 2026',
    heroTitle: 'EVAL',
    heroDesc: 'تصاميم حصرية وخامات فريدة صنعت خصيصاً لتناسب ذوقك الراقي وتمنحك إطلالة استثنائية لا تُنسى.',
    whatsapp: '201108396536',
    fb: 'https://www.facebook.com/share/1GwJYnjzeE/',
    ig: 'https://www.instagram.com/eval_store_fashion?psln=ejN5dTl4czhxdDE=',
    aboutText: 'نؤمن في EVAL بأن الأناقة الحقيقية هي انعكاس للشخصية والفرادة. وُلدت علامتنا لتلبي تطلعات أصحاب الذوق الرفيع، حيث ندمج الأصالة بالتصاميم المعاصرة لنقدم لكم قطعاً حصرية صُنعت بكل عناية وإتقان.',
    contactText: 'يسعدنا دائماً تواصلكم واستقبال استفساراتكم وآرائكم. فريق خدمة العملاء في EVAL في خدمتكم على مدار الساعة لتقديم الدعم والمساعدة.',
    payments: { cod: true, instapay: true, visa: true, bank: true }
};

window.addEventListener('DOMContentLoaded', async () => {
    try {
        loadLocalState();
        await fetchStoreSettings();
        await fetchProducts();
        await fetchReviews();
        renderCategories();
        renderProducts('all');
        renderCart();
        renderDynamicContent();
        renderProductColorsTags();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'eval2026') {
            openAuthModal();
        }
    } catch (err) {
        console.error("Initialization error:", err);
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toast-message').innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
}

function loadLocalState() {
    const savedCats = localStorage.getItem('eval_categories');
    if (savedCats) categories = JSON.parse(savedCats);
    const savedCart = localStorage.getItem('eval_cart');
    if (savedCart) cart = JSON.parse(savedCart);
    
    if(document.getElementById('pay-cod')) document.getElementById('pay-cod').checked = storeSettings.payments.cod;
    if(document.getElementById('pay-instapay')) document.getElementById('pay-instapay').checked = storeSettings.payments.instapay;
    if(document.getElementById('pay-visa')) document.getElementById('pay-visa').checked = storeSettings.payments.visa;
    if(document.getElementById('pay-bank')) document.getElementById('pay-bank').checked = storeSettings.payments.bank;
}

async function fetchStoreSettings() {
    try {
        const { data, error } = await _supabase.from('site_settings').select('*').eq('id', 1).single();
        if (data) {
            storeSettings.heroBg = data.hero_bg || storeSettings.heroBg;
            storeSettings.heroBadge = data.hero_badge || storeSettings.heroBadge;
            storeSettings.heroTitle = data.hero_title || storeSettings.heroTitle;
            storeSettings.heroDesc = data.hero_desc || storeSettings.heroDesc;
            storeSettings.announcement = data.announcement || '';
            storeSettings.whatsapp = data.whatsapp || storeSettings.whatsapp;
            storeSettings.fb = data.facebook || storeSettings.fb;
            storeSettings.ig = data.instagram || storeSettings.ig;
            storeSettings.aboutText = data.about_text || storeSettings.aboutText;
            storeSettings.contactText = data.contact_text || storeSettings.contactText;

            if(document.getElementById('admin-announcement')) document.getElementById('admin-announcement').value = storeSettings.announcement;
            if(document.getElementById('admin-hero-bg')) document.getElementById('admin-hero-bg').value = storeSettings.heroBg;
            if(document.getElementById('admin-hero-badge')) document.getElementById('admin-hero-badge').value = storeSettings.heroBadge;
            if(document.getElementById('admin-hero-title')) document.getElementById('admin-hero-title').value = storeSettings.heroTitle;
            if(document.getElementById('admin-hero-desc')) document.getElementById('admin-hero-desc').value = storeSettings.heroDesc;
            if(document.getElementById('admin-whatsapp')) document.getElementById('admin-whatsapp').value = storeSettings.whatsapp;
            if(document.getElementById('admin-fb')) document.getElementById('admin-fb').value = storeSettings.fb;
            if(document.getElementById('admin-ig')) document.getElementById('admin-ig').value = storeSettings.ig;
            if(document.getElementById('admin-about-text')) document.getElementById('admin-about-text').value = storeSettings.aboutText;
            if(document.getElementById('admin-contact-text')) document.getElementById('admin-contact-text').value = storeSettings.contactText;
            
            renderDynamicContent();
        }
    } catch (err) {
        console.error("Error fetching store settings:", err);
    }
}

function switchTab(tab) {
    ['store', 'cart', 'contact', 'reviews', 'about', 'admin'].forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if(el) el.classList.add('hidden');
    });
    const target = document.getElementById(`view-${tab}`);
    if(target) target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if(tab === 'reviews') renderReviews();
}

function openAuthModal() { 
    const modal = document.getElementById('auth-modal');
    if(modal) modal.classList.remove('hidden'); 
}

function closeAuthModal() { 
    const modal = document.getElementById('auth-modal');
    if(modal) modal.classList.add('hidden'); 
}

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
            currentUser = { username: data.username, role: 'staff' };
            setupDashboard();
        } else { alert("بيانات الدخول غير صحيحة!"); }
    } catch (err) { alert("بيانات الدخول غير صحيحة!"); }
}

async function setupDashboard() {
    closeAuthModal();
    switchTab('admin');
    document.getElementById('admin-welcome-title').innerText = `أهلاً بك، ${currentUser.username}`;
    
    const superPanel = document.getElementById('super-admin-panel');
    const storeSettingsPanel = document.getElementById('store-settings-panel');
    const categoriesPanel = document.getElementById('admin-categories-panel');

    if (currentUser.role === 'admin') {
        document.getElementById('admin-role-badge').innerText = 'صلاحية: المدير الرئيسي';
        if(superPanel) superPanel.classList.remove('hidden');
        if(storeSettingsPanel) storeSettingsPanel.classList.remove('hidden');
        if(categoriesPanel) categoriesPanel.classList.remove('hidden');
        await fetchStaffList();
    } else {
        document.getElementById('admin-role-badge').innerText = 'صلاحية: موظف (إضافة وإدارة توفر المنتجات فقط)';
        if(superPanel) superPanel.classList.add('hidden');
        if(storeSettingsPanel) storeSettingsPanel.classList.add('hidden');
        if(categoriesPanel) categoriesPanel.classList.add('hidden');
    }

    document.getElementById('stat-products-count').innerText = products.length;
    document.getElementById('stat-reviews-count').innerText = reviews.length;
    document.getElementById('stat-staff-count').innerText = staffList.length || 1;

    renderAdminCategories();
    renderAdminProductsList();
    await fetchReviews();
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
}

function logoutAdmin() { currentUser = null; switchTab('store'); }

async function fetchStaffList() {
    try {
        const { data } = await _supabase.from('staff_users').select('*').order('created_at', { ascending: false });
        if (data) {
            staffList = data;
            document.getElementById('stat-staff-count').innerText = staffList.length;
        }
        renderStaffList();
    } catch (err) { console.error(err); }
}

async function handleCreateStaff(e) {
    e.preventDefault();
    if(currentUser.role !== 'admin') { alert("غير مسموح لك بهذه العملية!"); return; }
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
    if(currentUser.role !== 'admin') return;
    await _supabase.from('staff_users').update({ is_active: !currentActive }).eq('id', id);
    await fetchStaffList();
}

async function deleteStaff(id) {
    if(currentUser.role !== 'admin') return;
    if (!confirm("هل أنت متأكد من حذف الحساب؟")) return;
    await _supabase.from('staff_users').delete().eq('id', id);
    await fetchStaffList();
}

function renderStaffList() {
    const container = document.getElementById('staff-users-list');
    if(!container) return;
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
        const { data, error } = await _supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
            products = data;
            renderProducts(currentCategoryFilter);
        }
    } catch (err) { console.error("Error fetching products:", err); }
}

async function fetchReviews() {
    try {
        const { data } = await _supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (data) {
            reviews = data;
            document.getElementById('stat-reviews-count').innerText = reviews.length;
            renderReviews();
            renderAdminReviewsList();
        }
    } catch (err) { console.error(err); }
}

function renderDynamicContent() {
    const bar = document.getElementById('announcement-bar');
    const barText = document.getElementById('announcement-text');
    if(bar && barText) {
        if(storeSettings.announcement && storeSettings.announcement.trim() !== '') {
            barText.innerText = storeSettings.announcement;
            bar.classList.remove('hidden');
        } else {
            bar.classList.add('hidden');
        }
    }

    const heroSection = document.getElementById('hero-banner-section');
    if(heroSection) {
        const bgUrl = storeSettings.heroBg && storeSettings.heroBg.trim() !== '' ? storeSettings.heroBg : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop';
        heroSection.style.backgroundImage = `linear-gradient(to bottom, rgba(5,5,5,0.45), rgba(5,5,5,0.75)), url('${bgUrl}')`;
    }

    if(document.getElementById('hero-display-badge')) document.getElementById('hero-display-badge').innerText = storeSettings.heroBadge;
    if(document.getElementById('hero-display-title')) document.getElementById('hero-display-title').innerText = storeSettings.heroTitle;
    if(document.getElementById('hero-display-desc')) document.getElementById('hero-display-desc').innerText = storeSettings.heroDesc;

    const aboutDiv = document.getElementById('dynamic-about-content');
    if(aboutDiv) aboutDiv.innerHTML = `<p>${storeSettings.aboutText.replace(/\n/g, '<br>')}</p>`;
    
    const contactDiv = document.getElementById('dynamic-contact-content');
    if(contactDiv) {
        const cleanWa = storeSettings.whatsapp.replace(/[^0-9]/g, '');
        contactDiv.innerHTML = `
            <p>${storeSettings.contactText.replace(/\n/g, '<br>')}</p>
            <div class="pt-4 flex items-center gap-3">
                <i class="fa-brands fa-whatsapp text-2xl text-emerald-700"></i>
                <a href="https://wa.me/${cleanWa}?text=${encodeURIComponent('مرحباً EVAL، أود الاستفسار عن منتجاتكم.')}" target="_blank" class="text-emerald-800 font-bold hover:underline text-lg">
                    رقم الواتساب: ${storeSettings.whatsapp}
                </a>
            </div>
        `;
    }
    
    if(document.getElementById('footer-fb')) document.getElementById('footer-fb').href = storeSettings.fb;
    if(document.getElementById('footer-ig')) document.getElementById('footer-ig').href = storeSettings.ig;
    if(document.getElementById('footer-wa')) document.getElementById('footer-wa').href = `https://wa.me/${storeSettings.whatsapp}`;
}

function addProductColor() {
    const input = document.getElementById('custom-color-input');
    const val = input.value.trim();
    if(val && !currentProductColors.includes(val)) {
        currentProductColors.push(val);
        input.value = '';
        renderProductColorsTags();
    }
}

function removeProductColor(color) {
    currentProductColors = currentProductColors.filter(c => c !== color);
    renderProductColorsTags();
}

function renderProductColorsTags() {
    const container = document.getElementById('product-colors-tags');
    if(!container) return;
    if(currentProductColors.length === 0) {
        container.innerHTML = `<p class="text-xs text-rose-500 font-bold">يجب إضافة لون واحد على الأقل!</p>`;
        return;
    }
    container.innerHTML = currentProductColors.map(c => `
        <span class="inline-flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-800 border border-stone-200 shadow-sm">
            ${c}
            <button type="button" onclick="removeProductColor('${c}')" class="text-rose-500 hover:text-rose-700 ml-1"><i class="fa-solid fa-xmark"></i></button>
        </span>
    `).join('');
}

function openProductDetailModal(pId) {
    const p = products.find(prod => String(prod.id) === String(pId));
    if (!p) return;

    const modalContent = document.getElementById('modal-product-content');
    if(!modalContent) return;
    
    let imagesArr = [];
    if (p.images) {
        if (Array.isArray(p.images) && p.images.length > 0) {
            imagesArr = p.images;
        } else if (typeof p.images === 'string') {
            try {
                let parsed = JSON.parse(p.images);
                if (Array.isArray(parsed) && parsed.length > 0) imagesArr = parsed;
            } catch(e) {
                imagesArr = [p.images];
            }
        }
    }
    
    if (imagesArr.length === 0 && p.image_url) {
        imagesArr = [p.image_url];
    }
    
    if (imagesArr.length === 0) {
        imagesArr = ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop'];
    }
    
    const mainImg = imagesArr[0];

    const thumbsHTML = imagesArr.map((img, idx) => `
        <img src="${img}" onclick="
            document.getElementById('main-modal-img').src='${img}';
            document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('border-2', 'border-stone-900'));
            this.classList.add('border-2', 'border-stone-900');
        " class="modal-thumb w-16 h-16 object-cover rounded-xl border cursor-pointer hover:border-stone-900 transition-all ${idx === 0 ? 'border-2 border-stone-900' : ''}" alt="thumb">
    `).join('');

    const sizesArr = (p.sizes && p.sizes.length) ? p.sizes : ['Free Size'];
    const sizesHTML = sizesArr.map((s, idx) => `
        <label class="flex items-center gap-1.5 px-3.5 py-2.5 border rounded-xl cursor-pointer text-xs font-bold hover:bg-stone-50 transition-all">
            <input type="radio" name="modal_selected_size" value="${s}" ${idx === 0 ? 'checked' : ''} class="accent-stone-900">
            ${s}
        </label>
    `).join('');

    const colorsArr = (p.colors && p.colors.length) ? p.colors : ['أساسي'];
    const colorsHTML = colorsArr.map((c, idx) => `
        <label class="flex items-center gap-1.5 px-3.5 py-2.5 border rounded-xl cursor-pointer text-xs font-bold hover:bg-stone-50 transition-all">
            <input type="radio" name="modal_selected_color" value="${c}" ${idx === 0 ? 'checked' : ''} class="accent-stone-900">
            ${c}
        </label>
    `).join('');

    modalContent.innerHTML = `
        <div class="space-y-4">
            <img id="main-modal-img" src="${mainImg}" class="w-full h-80 sm:h-96 object-cover rounded-2xl border shadow-md" alt="${p.name}">
            <div class="flex items-center gap-2 overflow-x-auto pb-1">${thumbsHTML}</div>
        </div>
        <div class="flex flex-col justify-between space-y-4">
            <div class="space-y-4">
                <div>
                    <span class="text-xs font-bold px-3 py-1 bg-stone-100 text-stone-800 rounded-full">${p.category}</span>
                    <h3 class="text-2xl font-black text-stone-900 mt-2 tracking-tight">${p.name}</h3>
                    <div class="flex items-baseline gap-2 mt-2">
                        <p class="text-stone-900 font-black text-2xl">${p.price} ج.م</p>
                        ${p.old_price ? `<p class="text-sm font-bold text-stone-400 line-through">${p.old_price} ج.م</p>` : ''}
                    </div>
                </div>
                ${p.fabric ? `<p class="text-xs font-bold text-stone-500">الخامة المصنعة: <span class="text-stone-900">${p.fabric}</span></p>` : ''}
                <p class="text-sm text-stone-600 leading-relaxed">${p.description || 'تصميم حصري من متجر EVAL بأرقى معايير الجودة.'}</p>
                
                <div class="space-y-2 border-t pt-3">
                    <label class="block text-xs font-bold text-stone-900">اختر المقاس المناسب:</label>
                    <div class="flex flex-wrap gap-2">${sizesHTML}</div>
                </div>

                <div class="space-y-2 border-t pt-3">
                    <label class="block text-xs font-bold text-stone-900">اختر اللون:</label>
                    <div class="flex flex-wrap gap-2">${colorsHTML}</div>
                </div>
            </div>

            <div class="space-y-2.5 pt-4 border-t">
                <button onclick="addConfiguredToCart('${p.id}')" class="w-full py-4 bg-stone-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm transition-all">
                    <i class="fa-solid fa-cart-plus text-lg"></i> إضافة للسلة بالتفاصيل المختارة
                </button>
                <button onclick="shareProduct('${p.name}', '${p.price}')" class="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all">
                    <i class="fa-solid fa-share-nodes"></i> مشاركة القطعة مع الأصدقاء
                </button>
            </div>
        </div>
    `;
    const modal = document.getElementById('product-detail-modal');
    if(modal) modal.classList.remove('hidden');
}

function closeProductDetailModal() { 
    const modal = document.getElementById('product-detail-modal');
    if(modal) modal.classList.add('hidden'); 
}

function shareProduct(name, price) {
    const text = `تأملي هذا التصميم الراقي من متجر EVAL: ${name} بسعر ${price} ج.م. تصفحيه الآن!`;
    if (navigator.share) {
        navigator.share({ title: 'EVAL Store', text: text, url: window.location.href }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text + " " + window.location.href);
        showToast("تم نسخ رابط ورسالة المشاركة للحافظة!");
    }
}

function addConfiguredToCart(pId) {
    const p = products.find(prod => String(prod.id) === String(pId));
    if (!p) return;

    const selectedSize = document.querySelector('input[name="modal_selected_size"]:checked')?.value || 'Free Size';
    const selectedColor = document.querySelector('input[name="modal_selected_color"]:checked')?.value || 'أساسي';
    
    let imagesArr = [];
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
        imagesArr = p.images;
    } else if (p.image_url) {
        imagesArr = [p.image_url];
    } else {
        imagesArr = ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop'];
    }

    const cartItem = {
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: imagesArr[0],
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
    if(currentProductColors.length === 0) {
        alert("يرجى إضافة لون واحد على الأقل للقطعة!");
        return;
    }
    const saveBtn = document.getElementById('save-btn');
    if(saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = 'جاري رفع الصور والنشر...'; }
    try {
        const fileInput = document.getElementById('p-images');
        if (!fileInput || fileInput.files.length === 0) throw new Error("يرجى اختيار صورة واحدة على الأقل للقطعة");
        
        let uploadedUrls = [];
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            const fileName = `${Date.now()}_${i}.${file.name.split('.').pop()}`;
            await _supabase.storage.from('product-images').upload(fileName, file);
            const { data: urlData } = _supabase.storage.from('product-images').getPublicUrl(fileName);
            uploadedUrls.push(urlData.publicUrl);
        }

        const selectedSizes = Array.from(document.querySelectorAll('#sizes-selector input:checked')).map(cb => cb.value);

        const newProduct = {
            name: document.getElementById('p-name').value.trim(),
            category: document.getElementById('p-category').value,
            price: parseFloat(document.getElementById('p-price').value),
            fabric: document.getElementById('p-fabric').value.trim(),
            description: document.getElementById('p-desc').value.trim(),
            sizes: selectedSizes.length > 0 ? selectedSizes : ['Free Size'],
            colors: [...currentProductColors],
            image_url: uploadedUrls[0],
            images: uploadedUrls,
            is_available: true
        };

        await _supabase.from('products').insert([newProduct]);
        showToast("تم نشر القطعة بنجاح!");
        document.getElementById('product-form').reset();
        currentProductColors = ['أسود', 'بيج', 'أبيض'];
        renderProductColorsTags();
        await fetchProducts();
        renderAdminProductsList();
    } catch (err) { alert("خطأ: " + err.message); }
    finally { 
        if(saveBtn) { saveBtn.disabled = false; saveBtn.innerText = "نشر القطعة"; }
    }
}

async function toggleProductAvailability(id, currentStatus) {
    await _supabase.from('products').update({ is_available: !currentStatus }).eq('id', id);
    await fetchProducts(); 
    renderAdminProductsList();
}

async function deleteProduct(id) {
    if(currentUser.role !== 'admin') {
        alert("عذراً، حذف المنتجات مقتصر على المدير الرئيسي فقط!");
        return;
    }
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await _supabase.from('products').delete().eq('id', id);
    await fetchProducts(); 
    renderAdminProductsList();
}

function openEditProductModal(pId) {
    const p = products.find(prod => String(prod.id) === String(pId));
    if (!p) return;

    let editModal = document.getElementById('edit-product-modal');
    if (!editModal) {
        editModal = document.createElement('div');
        editModal.id = 'edit-product-modal';
        editModal.className = 'fixed inset-0 bg-stone-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4';
        document.body.appendChild(editModal);
    }

    editModal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b pb-3">
                <h3 class="font-black text-lg text-stone-900">تعديل القطعة والخصم: ${p.name}</h3>
                <button onclick="document.getElementById('edit-product-modal').remove()" class="text-stone-400 hover:text-stone-700 font-bold text-lg"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form onsubmit="saveProductChanges(event, '${p.id}')" class="space-y-3">
                <div>
                    <label class="block text-xs font-bold text-stone-700 mb-1">اسم القطعة:</label>
                    <input type="text" id="edit-p-name" value="${p.name}" class="w-full p-3 border rounded-xl text-sm font-bold bg-stone-50" required>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-stone-700 mb-1">السعر الحالي (بعد الخصم):</label>
                        <input type="number" step="0.01" id="edit-p-price" value="${p.price}" class="w-full p-3 border rounded-xl text-sm font-bold bg-stone-50" required>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-stone-700 mb-1">السعر القديم (قبل الخصم):</label>
                        <input type="number" step="0.01" id="edit-p-old-price" value="${p.old_price || ''}" placeholder="مثال: 850" class="w-full p-3 border rounded-xl text-sm font-bold bg-stone-50">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-stone-700 mb-1">الوصف:</label>
                    <textarea id="edit-p-desc" rows="3" class="w-full p-3 border rounded-xl text-sm bg-stone-50">${p.description || ''}</textarea>
                </div>
                <div class="pt-3 flex gap-2">
                    <button type="submit" class="flex-1 py-3 bg-stone-900 text-white font-bold rounded-xl text-sm hover:bg-black shadow">حفظ التعديلات</button>
                    <button type="button" onclick="document.getElementById('edit-product-modal').remove()" class="py-3 px-5 bg-stone-100 text-stone-700 font-bold rounded-xl text-sm">إلغاء</button>
                </div>
            </form>
        </div>
    `;
    editModal.classList.remove('hidden');
}

async function saveProductChanges(e, pId) {
    e.preventDefault();
    const newName = document.getElementById('edit-p-name').value.trim();
    const newPrice = parseFloat(document.getElementById('edit-p-price').value);
    const oldPriceInput = document.getElementById('edit-p-old-price').value;
    const newOldPrice = oldPriceInput ? parseFloat(oldPriceInput) : null;
    const newDesc = document.getElementById('edit-p-desc').value.trim();

    try {
        const updateData = {
            name: newName,
            price: newPrice,
            old_price: newOldPrice,
            description: newDesc
        };

        const { error } = await _supabase.from('products').update(updateData).eq('id', pId);
        if (error) throw error;

        showToast("تم تحديث بيانات القطعة بنجاح!");
        document.getElementById('edit-product-modal').remove();
        await fetchProducts();
        renderAdminProductsList();
    } catch (err) {
        alert("حدث خطأ أثناء التحديث: " + err.message);
    }
}

async function submitReview(e) {
    e.preventDefault();
    const name = document.getElementById('review-name').value.trim();
    const rating = parseInt(document.getElementById('review-rating').value);
    const comment = document.getElementById('review-text').value.trim();
    
    try {
        const { error } = await _supabase.from('reviews').insert([{ name, rating, comment }]);
        if (error) throw error;
        showToast("تم نشر تقييمك بنجاح!");
        document.getElementById('review-name').value = '';
        document.getElementById('review-text').value = '';
        await fetchReviews();
    } catch (err) {
        alert("حدث خطأ أثناء نشر التقييم: " + err.message);
    }
}

async function deleteReview(id) {
    if(currentUser.role !== 'admin') return;
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;
    try {
        await _supabase.from('reviews').delete().eq('id', id);
        showToast("تم حذف التعليق بنجاح");
        await fetchReviews();
    } catch (err) {
        alert("خطأ أثناء الحذف: " + err.message);
    }
}

function handleAddCategory(e) {
    e.preventDefault();
    if(currentUser.role !== 'admin') return;
    const input = document.getElementById('new-category-name');
    if(!input) return;
    const val = input.value.trim();
    if(val && !categories.includes(val)) {
        categories.push(val);
        localStorage.setItem('eval_categories', JSON.stringify(categories));
        input.value = '';
        renderCategories();
        renderAdminCategories();
        showToast("تم إضافة القسم بنجاح!");
    }
}

function deleteCategory(cat) {
    if(currentUser.role !== 'admin') return;
    if(categories.length <= 1) { alert("يجب أن يبقى قسم واحد على الأقل!"); return; }
    if(!confirm(`هل أنت متأكد من حذف قسم "${cat}"؟`)) return;
    categories = categories.filter(c => c !== cat);
    localStorage.setItem('eval_categories', JSON.stringify(categories));
    renderCategories();
    renderAdminCategories();
    showToast("تم حذف القسم!");
}

async function saveStoreSettings() {
    if(currentUser.role !== 'admin') { alert("عذراً، تعديل إعدادات المتجر مقتصر على المدير الرئيسي فقط!"); return; }
    
    let heroBgUrl = document.getElementById('admin-hero-bg') ? document.getElementById('admin-hero-bg').value.trim() : storeSettings.heroBg;
    const heroFileInput = document.getElementById('admin-hero-file');
    
    showToast("جاري حفظ الإعدادات والغلاف والنصوص...");

    try {
        if (heroFileInput && heroFileInput.files.length > 0) {
            const file = heroFileInput.files[0];
            const fileName = `hero_${Date.now()}.${file.name.split('.').pop()}`;
            
            const { error: uploadError } = await _supabase.storage.from('product-images').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = _supabase.storage.from('product-images').getPublicUrl(fileName);
            if (urlData && urlData.publicUrl) {
                heroBgUrl = urlData.publicUrl;
            }
        }

        const newHeroBadge = document.getElementById('admin-hero-badge') ? document.getElementById('admin-hero-badge').value.trim() : storeSettings.heroBadge;
        const newHeroTitle = document.getElementById('admin-hero-title') ? document.getElementById('admin-hero-title').value.trim() : storeSettings.heroTitle;
        const newHeroDesc = document.getElementById('admin-hero-desc') ? document.getElementById('admin-hero-desc').value.trim() : storeSettings.heroDesc;
        const newAnnouncement = document.getElementById('admin-announcement') ? document.getElementById('admin-announcement').value.trim() : storeSettings.announcement;
        const newWhatsapp = document.getElementById('admin-whatsapp') ? document.getElementById('admin-whatsapp').value.trim() : storeSettings.whatsapp;
        const newFb = document.getElementById('admin-fb') ? document.getElementById('admin-fb').value.trim() : storeSettings.fb;
        const newIg = document.getElementById('admin-ig') ? document.getElementById('admin-ig').value.trim() : storeSettings.ig;
        const newAbout = document.getElementById('admin-about-text') ? document.getElementById('admin-about-text').value.trim() : storeSettings.aboutText;
        const newContact = document.getElementById('admin-contact-text') ? document.getElementById('admin-contact-text').value.trim() : storeSettings.contactText;

        storeSettings.heroBg = heroBgUrl;
        storeSettings.heroBadge = newHeroBadge;
        storeSettings.heroTitle = newHeroTitle;
        storeSettings.heroDesc = newHeroDesc;
        storeSettings.announcement = newAnnouncement;
        storeSettings.whatsapp = newWhatsapp;
        storeSettings.fb = newFb;
        storeSettings.ig = newIg;
        storeSettings.aboutText = newAbout;
        storeSettings.contactText = newContact;
        if(document.getElementById('pay-cod')) storeSettings.payments.cod = document.getElementById('pay-cod').checked;
        if(document.getElementById('pay-instapay')) storeSettings.payments.instapay = document.getElementById('pay-instapay').checked;
        if(document.getElementById('pay-visa')) storeSettings.payments.visa = document.getElementById('pay-visa').checked;
        if(document.getElementById('pay-bank')) storeSettings.payments.bank = document.getElementById('pay-bank').checked;

        const payload = {
            id: 1,
            hero_bg: heroBgUrl,
            hero_badge: newHeroBadge,
            hero_title: newHeroTitle,
            hero_desc: newHeroDesc,
            announcement: newAnnouncement,
            whatsapp: newWhatsapp,
            facebook: newFb,
            instagram: newIg,
            about_text: newAbout,
            contact_text: newContact,
            updated_at: new Date()
        };

        const { error: upsertErr } = await _supabase.from('site_settings').upsert(payload);
        if (upsertErr) throw upsertErr;

        renderDynamicContent();
        showToast("تم حفظ وتثبيت الإعدادات والغلاف بنجاح دائم!");
        if(heroFileInput) heroFileInput.value = '';
        if(document.getElementById('admin-hero-bg')) document.getElementById('admin-hero-bg').value = heroBgUrl;
    } catch (err) {
        alert("حدث خطأ أثناء الحفظ: " + err.message);
    }
}

function renderCategories() {
    const container = document.getElementById('category-filters');
    const select = document.getElementById('p-category');
    
    if(container) {
        container.innerHTML = `<button onclick="filterByCategory('all')" class="cat-btn active px-6 py-2.5 rounded-full text-xs font-bold bg-stone-900 text-white whitespace-nowrap shadow-md transition-all shrink-0">الكل</button>`;
        categories.forEach(c => {
            container.innerHTML += `<button onclick="filterByCategory('${c}')" class="cat-btn px-6 py-2.5 rounded-full text-xs font-bold bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80 shadow-sm whitespace-nowrap transition-all shrink-0">${c}</button>`;
        });
    }
    if(select) {
        select.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

function renderAdminCategories() {
    const container = document.getElementById('admin-cat-list');
    if(!container) return;
    container.innerHTML = categories.map(c => `
        <span class="inline-flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-xl text-xs font-bold text-stone-700 border">
            ${c}
            ${currentUser.role === 'admin' ? `<button onclick="deleteCategory('${c}')" class="text-rose-600 hover:text-rose-800 ml-1"><i class="fa-solid fa-xmark"></i></button>` : ''}
        </span>
    `).join('');
}

function filterByCategory(cat) {
    currentCategoryFilter = cat;
    document.querySelectorAll('.cat-btn').forEach(b => { b.classList.remove('bg-stone-900', 'text-white', 'shadow-md'); b.classList.add('bg-white', 'text-stone-600', 'border-stone-200/80', 'shadow-sm'); });
    if(event && event.currentTarget) {
        event.currentTarget.classList.remove('bg-white', 'text-stone-600', 'border-stone-200/80', 'shadow-sm');
        event.currentTarget.classList.add('bg-stone-900', 'text-white', 'shadow-md');
    }
    renderProducts(cat);
}

function handleSortChange() {
    renderProducts(currentCategoryFilter);
}

function renderProducts(filter = 'all') {
    const grid = document.getElementById('products-grid');
    if(!grid) return;
    
    let items = filter === 'all' ? [...products] : products.filter(p => p.category === filter);
    
    const sortVal = document.getElementById('sort-select')?.value || 'newest';
    if (sortVal === 'newest') {
        items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortVal === 'price-asc') {
        items.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortVal === 'price-desc') {
        items.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (items.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-stone-400 font-bold tracking-wide">لا توجد قطع متوفرة حالياً في هذا القسم.</div>`;
        return;
    }
    
    grid.innerHTML = items.map(p => {
        const avail = p.is_available !== false;
        let imagesArr = [];
        if (p.images) {
            if (Array.isArray(p.images) && p.images.length > 0) {
                imagesArr = p.images;
            } else if (typeof p.images === 'string') {
                try {
                    let parsed = JSON.parse(p.images);
                    if (Array.isArray(parsed) && parsed.length > 0) imagesArr = parsed;
                } catch(e) {
                    imagesArr = [p.images];
                }
            }
        }
        
        if (imagesArr.length === 0 && p.image_url) {
            imagesArr = [p.image_url];
        }
        
        if (imagesArr.length === 0) {
            imagesArr = ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop'];
        }

        return `
            <div class="bg-white rounded-3xl border border-stone-200/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative group">
                ${!avail ? '<div class="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex items-center justify-center"><span class="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg tracking-wider">نفذت الكمية</span></div>' : ''}
                <div class="relative overflow-hidden aspect-[4/5] bg-stone-100">
                    <img src="${imagesArr[0]}" onclick="openProductDetailModal('${p.id}')" class="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500" alt="${p.name}">
                    <span class="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-stone-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">${p.category}</span>
                </div>
                <div class="p-5 flex flex-col flex-grow space-y-3">
                    <h3 onclick="openProductDetailModal('${p.id}')" class="font-bold text-stone-900 text-sm sm:text-base line-clamp-1 cursor-pointer hover:text-stone-600 transition-colors">${p.name}</h3>
                    <div class="mt-auto pt-3 flex items-center justify-between border-t border-stone-100">
                        <div>
                            <span class="font-black text-stone-900 text-lg">${p.price} ج.م</span>
                            ${p.old_price ? `<span class="text-xs font-bold text-stone-400 line-through mr-2">${p.old_price} ج.م</span>` : ''}
                        </div>
                        ${avail ? `<button onclick="openProductDetailModal('${p.id}')" class="px-4 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-black text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"><i class="fa-solid fa-eye"></i> عرض</button>` : '<span class="text-xs font-bold text-stone-400">غير متوفر</span>'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderReviews() {
    const list = document.getElementById('reviews-list');
    if(!list) return;
    if(reviews.length === 0) { list.innerHTML = `<p class="text-sm text-stone-400 text-center py-6">لا توجد تقييمات حتى الآن.</p>`; return; }
    
    list.innerHTML = reviews.map(r => {
        const ratingNum = r.rating || 5;
        const stars = '⭐'.repeat(ratingNum);
        return `
            <div class="bg-white p-6 rounded-3xl border border-stone-200/70 shadow-sm space-y-2">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold text-sm text-stone-900">${r.name}</h4>
                    <span class="text-xs text-amber-500">${stars}</span>
                </div>
                <p class="text-xs sm:text-sm text-stone-600 leading-relaxed">${r.comment}</p>
            </div>
        `;
    }).join('');
}

function renderAdminProductsList() {
    const container = document.getElementById('admin-products-list');
    if(!container) return;
    container.innerHTML = products.map(p => {
        let firstImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop';
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
            firstImg = p.images[0];
        } else if (p.image_url) {
            firstImg = p.image_url;
        }
        return `
            <div class="py-3.5 flex items-center justify-between gap-4 border-b border-stone-100 last:border-0">
                <div class="flex items-center gap-3">
                    <img src="${firstImg}" class="w-12 h-12 rounded-2xl object-cover border" alt="">
                    <div>
                        <h4 class="font-bold text-sm text-stone-900">${p.name}</h4>
                        <p class="text-xs text-stone-500">${p.price} ج.م ${p.old_price ? `<span class="line-through text-rose-500 mr-1">${p.old_price} ج.م</span>` : ''}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="openEditProductModal('${p.id}')" class="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all">تعديل</button>
                    <button onclick="toggleProductAvailability('${p.id}', ${p.is_available !== false})" class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${p.is_available !== false ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-800'}">${p.is_available !== false ? 'إيقاف' : 'تفعيل'}</button>
                    ${currentUser.role === 'admin' ? `<button onclick="deleteProduct('${p.id}')" class="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderAdminReviewsList() {
    const container = document.getElementById('admin-reviews-list');
    if(!container) return;
    if (reviews.length === 0) {
        container.innerHTML = `<p class="text-xs text-stone-400 py-3">لا توجد تعليقات مراقبة حالياً.</p>`;
        return;
    }
    container.innerHTML = reviews.map(r => `
        <div class="py-3.5 flex items-center justify-between gap-4 border-b border-stone-100 last:border-0">
            <div>
                <h4 class="font-bold text-sm text-stone-900">${r.name} <span class="text-xs text-amber-500">(${r.rating || 5}⭐)</span></h4>
                <p class="text-xs text-stone-600">${r.comment}</p>
            </div>
            ${currentUser.role === 'admin' ? `<button onclick="deleteReview('${r.id}')" class="px-3.5 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all">حذف التعليق</button>` : ''}
        </div>
    `).join('');
}

function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if(!badge) return;
    if (cart.length > 0) { badge.innerText = cart.length; badge.classList.remove('hidden'); }
    else { badge.classList.add('hidden'); }
}

function renderCart() {
    updateCartBadge();
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    const payContainer = document.getElementById('payment-methods-container');
    if(!container || !summary) return;

    if (cart.length === 0) {
        container.innerHTML = `<p class="text-center py-12 text-stone-400 font-bold">سلة التسوق فارغة حالياً.</p>`;
        summary.classList.add('hidden');
        return;
    }

    summary.classList.remove('hidden');
    let total = 0;
    container.innerHTML = cart.map((item, idx) => {
        total += Number(item.price);
        return `
            <div class="flex items-center justify-between gap-4 border-b border-stone-100 pb-4 last:border-0">
                <div class="flex items-center gap-3">
                    <img src="${item.image_url}" class="w-16 h-16 rounded-2xl object-cover border" alt="">
                    <div>
                        <h4 class="font-bold text-sm text-stone-900">${item.name}</h4>
                        <div class="flex items-center gap-2 text-xs text-stone-500 font-medium mt-1">
                            <span>المقاس: ${item.size || 'Free Size'}</span> | 
                            <span>اللون: ${item.color || 'أساسي'}</span>
                        </div>
                        <p class="text-xs text-stone-900 font-black mt-1">${item.price} ج.م</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${idx})" class="text-rose-500 hover:text-rose-700 text-xs font-bold p-2"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    }).join('');

    const totalPriceEl = document.getElementById('cart-total-price');
    if(totalPriceEl) totalPriceEl.innerText = `${total} ج.م`;

    let payHTML = '';
    if(storeSettings.payments.cod) payHTML += `<label class="flex items-center gap-3 p-4 bg-stone-50/80 border border-stone-200/70 rounded-2xl cursor-pointer hover:bg-stone-100 transition-all font-bold text-sm text-stone-800"><input type="radio" name="pay_method" value="الدفع عند الاستلام" checked class="accent-stone-900 w-4 h-4"> الدفع عند الاستلام</label>`;
    if(storeSettings.payments.instapay) payHTML += `<label class="flex items-center gap-3 p-4 bg-stone-50/80 border border-stone-200/70 rounded-2xl cursor-pointer hover:bg-stone-100 transition-all font-bold text-sm text-stone-800"><input type="radio" name="pay_method" value="Instapay / فودافون كاش" class="accent-stone-900 w-4 h-4"> InstaPay / فودافون كاش</label>`;
    if(storeSettings.payments.visa) payHTML += `<label class="flex items-center gap-3 p-4 bg-stone-50/80 border border-stone-200/70 rounded-2xl cursor-pointer hover:bg-stone-100 transition-all font-bold text-sm text-stone-800"><input type="radio" name="pay_method" value="بطاقة ائتمانية / Visa" class="accent-stone-900 w-4 h-4"> Visa / Master</label>`;
    if(storeSettings.payments.bank) payHTML += `<label class="flex items-center gap-3 p-4 bg-stone-50/80 border border-stone-200/70 rounded-2xl cursor-pointer hover:bg-stone-100 transition-all font-bold text-sm text-stone-800"><input type="radio" name="pay_method" value="تحويل بنكي مباشر" class="accent-stone-900 w-4 h-4"> تحويل بنكي مباشر</label>`;
    if(payContainer) payContainer.innerHTML = payHTML;
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
