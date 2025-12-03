window.addEventListener("load", function() {
    const loader = document.getElementById("loader-wrapper");
    setTimeout(function() {
        loader.classList.add("loader-hidden");
        loader.addEventListener("transitionend", function() { loader.remove(); });
    }, 800);
});

window.onpopstate = function(event) {
    if(!window.location.hash) goHome(false);
    else {
        const catName = decodeURIComponent(window.location.hash.substring(1));
        if(allData[catName]) openCategory(catName, false);
    }
};

function toggleFab() { document.getElementById('fab-container').classList.toggle('active'); }

let allData = {};
let currentCategory = "";
let selectedVariant = null;

fetch('/api/data').then(res => res.json()).then(data => {
    allData = data.categories;
    const catImages = data.category_images || {}; // Ambil data gambar kategori
    const catList = document.getElementById('category-list');
    
    for (const [catName, items] of Object.entries(allData)) {
        // 1. Cek apakah ada gambar kategori khusus dari Admin
        let catImg = catImages[catName];

        // 2. Jika tidak ada, gunakan gambar dari produk pertama (Fallback 1)
        if (!catImg && items.length > 0) {
            catImg = items[0].image;
        }
        
        const lowerCat = catName.toLowerCase();
        
        // --- LOGIKA CEK ITEM BARU (24 JAM) ---
        let hasNewItem = false;
        const oneDay = 24 * 60 * 60 * 1000; 
        const now = new Date();

        for(let item of items) {
            if(item.createdAt) {
                const itemDate = new Date(item.createdAt);
                if((now - itemDate) < oneDay) {
                    hasNewItem = true;
                    break; 
                }
            }
        }

        // 3. Jika masih tidak ada gambar, gunakan gambar default lokal (Fallback 2)
        if(!catImg) {
             if(lowerCat.includes('iphone') || lowerCat.includes('ios')) catImg = 'images/iphone.jpg';
             else if(lowerCat.includes('android')) {
                if(lowerCat.includes('aim') || lowerCat.includes('head')) catImg = 'images/aimhead.jpg';
                else if(lowerCat.includes('injector')) catImg = 'images/injector.jpg';
                else if(lowerCat.includes('sensix')) catImg = 'images/sensix.jpg';
                else if(lowerCat.includes('drip')) catImg = 'images/drip.jpg';
                else if(lowerCat.includes('hg')) catImg = 'images/hgcheat.jpg';
                else catImg = 'images/android.jpg';
             } else if(lowerCat.includes('headlock')) catImg = 'images/headlock.jpg';
             else catImg = 'https://placehold.co/100x100?text=GAME';
        }

        let badgeHtml = '';
        // Badge NEW (Prioritas)
        if(hasNewItem) {
            badgeHtml += '<div class="badge-new-item">NEW</div>';
        }

        // Badge Platform
        if(lowerCat.includes('iphone') || lowerCat.includes('ios')) badgeHtml += '<div class="platform-label lbl-ios">iOS</div>';
        else if(lowerCat.includes('android')) badgeHtml += '<div class="platform-label lbl-android">Android</div>';

        catList.innerHTML += `<div class="game-card" onclick="openCategory('${catName}', true)">${badgeHtml}
                <div class="card-top"><img src="${catImg}" onerror="this.src='https://placehold.co/100x100?text=IMG'">
                    <div class="card-wave"><svg viewBox="0 0 1440 320" preserveAspectRatio="none"><path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg></div>
                </div>
                <div class="card-content"><div class="game-name">${catName}</div></div>
                <div class="game-btn-area"><a class="btn-download"><i class="fa fa-download"></i> BELI</a></div></div>`;
    }
    loadContacts(data.config.contacts);

    const hash = window.location.hash.substring(1);
    if(hash) {
        const decoded = decodeURIComponent(hash);
        if(allData[decoded]) openCategory(decoded, false);
        else {
            const key = Object.keys(allData).find(k => k.toLowerCase() === decoded.toLowerCase());
            if(key) openCategory(key, false);
        }
    }
});

function loadContacts(contacts) {
    const sidebarMenu = document.getElementById('sidebar-menu');
    sidebarMenu.innerHTML = ''; 
    // Bagian footerSocials dihapus total agar tidak error
    
    contacts.forEach(contact => {
        let iconSvg = ''; let color = '#fff'; 
        if(contact.type === 'wa') {
            color = '#25D366'; 
            iconSvg = '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>';
        } else if(contact.type === 'tg') {
            color = '#229ED9'; 
            iconSvg = '<path d="M9.78 18.65L10.03 14.39L17.85 7.33C18.19 7.03 17.77 6.86 17.33 7.13L7.67 13.21L3.54 11.92C2.64 11.64 2.63 11.02 3.74 10.59L19.9 4.36C20.65 4.09 21.31 4.54 21.06 5.68L18.3 18.68C18.09 19.63 17.5 19.86 16.69 19.41L12.5 16.32L10.47 18.27C10.25 18.49 10.06 18.65 9.78 18.65Z"/>';
        } else {
            color = '#ffffff';
            iconSvg = '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>';
        }
        
        // Hanya inject ke sidebar menu
        sidebarMenu.innerHTML += `<a href="${contact.url}" class="menu-item"><svg style="width:16px;height:16px;fill:${color}" viewBox="0 0 24 24">${iconSvg}</svg><div><div>${contact.title}</div>${contact.label ? `<div class="menu-label">${contact.label}</div>` : ''}</div></a>`;
    });
}

function zoomQR(img) { document.getElementById('zoomed-qr').src = img.src; document.getElementById('qrZoomModal').style.display = 'flex'; }
function closeZoomQR() { document.getElementById('qrZoomModal').style.display = 'none'; }
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if(sidebar.classList.contains('active')) { sidebar.classList.remove('active'); overlay.style.display = 'none'; } 
    else { sidebar.classList.add('active'); overlay.style.display = 'block'; }
}
function switchTab(t) {
    const td = document.getElementById('tab-desc'), tv = document.getElementById('tab-video');
    const ad = document.getElementById('desc-area'), av = document.getElementById('video-area');
    if(t==='desc'){ td.classList.add('active'); tv.classList.remove('active'); ad.style.display='block'; av.style.display='none'; }
    else { td.classList.remove('active'); tv.classList.add('active'); ad.style.display='none'; av.style.display='block'; }
}

function openCategory(catName, pushToHistory = true) {
    currentCategory = catName;
    if(pushToHistory) history.pushState({page: 'detail', cat: catName}, "", "#" + catName);
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('detail-page').style.display = 'block';
    document.getElementById('sticky-footer').style.display = 'flex';
    document.getElementById('d-category-name').innerText = catName;
    switchTab('desc');
    document.getElementById('d-desc-text').innerHTML = "<i>Sila pilih pakej di bawah.</i>";
    
    const items = allData[catName];
    const vList = document.getElementById('variant-list');
    vList.innerHTML = '';
    
    // Logic 24 Jam untuk Varian
    const oneDay = 24 * 60 * 60 * 1000; 
    const now = new Date();

    items.forEach(item => {
        const desc = item.deskripsiPanjang ? item.deskripsiPanjang.replace(/\|\|/g, '<br>') : "-";
        
        let newTag = '';
        if(item.createdAt) {
            if((now - new Date(item.createdAt)) < oneDay) {
                newTag = '<span style="background:red; color:white; font-size:9px; padding:2px 4px; border-radius:3px; margin-left:5px; animation:pulse 1s infinite;">NEW</span>';
            }
        }

        vList.innerHTML += `<div class="variant-item" onclick="selectVariant(this, '${item.nama}', ${item.harga}, \`${desc}\`)">
            <div class="variant-name">${item.nama} ${newTag}</div>
            <div class="variant-price">RM ${item.harga}</div>
        </div>`;
    });
    window.scrollTo(0, 0);
}

function selectVariant(el, name, price, desc) {
    document.querySelectorAll('.variant-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    selectedVariant = { name, price };
    document.getElementById('display-price').innerText = "RM " + price;
    document.getElementById('d-desc-text').innerHTML = desc;
    switchTab('desc');
}
function goHome(pushToHistory = true) {
    if(pushToHistory) history.pushState({page: 'home'}, "", window.location.pathname);
    document.getElementById('home-page').style.display = 'block';
    document.getElementById('detail-page').style.display = 'none';
    document.getElementById('sticky-footer').style.display = 'none';
    window.scrollTo(0, 0);
}
function openUploadModal() {
    if(!selectedVariant || !document.getElementById('user_id').value) { alert('Sila lengkapkan maklumat!'); return; }
    const full = `${currentCategory} - ${selectedVariant.name} (${document.getElementById('user_id').value})`;
    document.getElementById('m-item').innerText = full;
    document.getElementById('wa_item').value = full;
    document.getElementById('wa_price').value = "RM " + selectedVariant.price;
    document.getElementById('wa_url').value = window.location.href;
    document.getElementById('uploadModal').style.display = 'flex';
}
function submitToWA(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.innerText = 'Menghantar...';
    fetch('api.php', { method:'POST', body: new FormData(document.getElementById('paymentForm')) })
    .then(res=>res.json()).then(d=>{ window.location.href=d.whatsapp_url; })
    .catch(e=>{ alert('Gagal menghantar (Perlukan Server PHP/Node)'); btn.innerText='Hantar'; });
}
