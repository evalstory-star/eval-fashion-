// دالة عرض تفاصيل المنتج في النافذة المنبثقة مع معالجة الصور
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
            document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('border-2', 'border-emerald-800'));
            this.classList.add('border-2', 'border-emerald-800');
        " class="modal-thumb w-16 h-16 object-cover rounded-xl border cursor-pointer hover:border-emerald-800 transition-all ${idx === 0 ? 'border-2 border-emerald-800' : ''}" alt="thumb">
    `).join('');

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
        <div class="space-y-4">
            <img id="main-modal-img" src="${mainImg}" class="w-full h-80 sm:h-96 object-cover rounded-2xl border shadow-sm" alt="${p.name}">
            <div class="flex items-center gap-2 overflow-x-auto pb-1">${thumbsHTML}</div>
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

            <div class="space-y-2">
                <button onclick="addConfiguredToCart('${p.id}')" class="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-base">
                    <i class="fa-solid fa-cart-plus text-xl"></i> إضافة للسلة بالتفاصيل المختارة
                </button>
                <button onclick="shareProduct('${p.name}', '${p.price}')" class="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                    <i class="fa-solid fa-share-nodes"></i> مشاركة القطعة مع الأصدقاء
                </button>
            </div>
        </div>
    `;
    const modal = document.getElementById('product-detail-modal');
    if(modal) modal.classList.remove('hidden');
}
