// ==========================================
// 1. FITUR NAVIGASI & DARK MODE
// ==========================================
function navigate(targetView) {
    if (targetView === 'track' && !isLoggedIn) {
        alert("Silakan Log In atau Sign Up terlebih dahulu untuk melacak pesananmu.");
        return;
    }
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('nav-active'));

    document.getElementById(`view-${targetView}`).classList.add('active');
    if(document.getElementById(`nav-btn-${targetView}`)) document.getElementById(`nav-btn-${targetView}`).classList.add('nav-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    document.getElementById('theme-icon').innerText = body.classList.contains('light-mode') ? '🌙' : '☀️';
}

// ==========================================
// 2. DATABASE SEMENTARA & STATUS PESANAN
// ==========================================
let isLoggedIn = false;
let orderStatus = "empty"; 
let currentOrder = { name: "", price: 0 };
let currentDiscount = 0;

let usersDB = []; 
let tempPhone = ""; 
let tempPass = "";
let isSignupFlow = false; 

const indoPhoneRegex = /^(08|\+62)\d{8,11}$/;

// KONTAK ADMIN (Sesuai yang diminta)
const adminWA = "https://wa.me/6283898115619";
const adminEmail = "mailto:basrenganyuk@gmail.com";

// ==========================================
// 3. FITUR AUTENTIKASI (LOGIN/SIGN UP/OTP)
// ==========================================
function openAuthModal(type) {
    document.getElementById('auth-overlay').style.display = 'flex';
    switchAuthView(type);
}
function closeAuthModal() {
    document.getElementById('auth-overlay').style.display = 'none';
}
function switchAuthView(type) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(`form-${type}`).classList.add('active');
}
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    if (input.type === "password") {
        input.type = "text"; icon.innerText = "🙈";
    } else {
        input.type = "password"; icon.innerText = "👁️";
    }
}

function processSignup(event) {
    event.preventDefault(); 
    const phone = document.getElementById('signup-phone').value;
    const pass = document.getElementById('signup-pass').value;
    
    if(!indoPhoneRegex.test(phone)) {
        alert("Gagal! Gunakan format nomor telepon Indonesia (mulai dengan 08 atau +62).");
        return;
    }

    const userExists = usersDB.find(u => u.phone === phone);
    if(userExists) {
        alert("Pemberitahuan: Nomor WhatsApp ini sudah terdaftar! Anda akan dialihkan ke halaman Log In.");
        switchAuthView('login');
        document.getElementById('login-phone').value = phone; 
        return;
    }

    // REGEX: Minimal 8 karakter, wajib ada Huruf Kapital, Angka, dan Simbol
    const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if(!passRegex.test(pass)) {
        alert("Gagal! Password MINIMAL 8 karakter, serta wajib mengandung kombinasi Huruf Kapital, Angka, dan Simbol (contoh: Bsrng@12345).");
        return;
    }

    tempPhone = phone; 
    tempPass = pass;
    isSignupFlow = true;
    sendOTP();
}

function processLogin(event) {
    event.preventDefault();
    const phone = document.getElementById('login-phone').value;
    const pass = document.getElementById('login-pass').value;
    
    const user = usersDB.find(u => u.phone === phone && u.password === pass);
    
    if(user) {
        tempPhone = phone;
        isSignupFlow = false;
        sendOTP();
    } else {
        alert("Nomor WhatsApp atau Password salah! Pastikan kamu sudah mendaftar dengan benar.");
    }
}

function sendOTP() {
    alert(`[SIMULASI WHATSAPP]\n\nPesan otomatis dikirim ke: ${tempPhone}\n\nHalo!\nKode OTP Rahasia Anda adalah: 1234`);
    switchAuthView('otp');
}

function verifyOTP(event) {
    event.preventDefault();
    const otp = document.getElementById('otp-code').value;
    
    if(otp === '1234') {
        alert("Verifikasi Berhasil! Selamat datang.");
        
        if(isSignupFlow) {
            usersDB.push({ phone: tempPhone, password: tempPass });
        }

        closeAuthModal();
        isLoggedIn = true;
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('nav-btn-track').classList.remove('locked');
        
        document.getElementById('form-signup').reset();
        document.getElementById('form-login').reset();
        document.getElementById('form-otp').reset();
        updateTrackView();
    } else {
        alert("Kode OTP salah.");
    }
}

function simulateLogout() {
    isLoggedIn = false;
    orderStatus = "empty"; 
    document.getElementById('auth-buttons').style.display = 'flex';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('nav-btn-track').classList.add('locked');
    updateTrackView(); 
    navigate('home'); 
}

// ==========================================
// 4. FITUR PEMESANAN CUSTOM & CHECKOUT
// ==========================================
function processCustomOrder() {
    if (!isLoggedIn) {
        alert("Sobat harus Log In dulu sebelum bisa memesan!");
        openAuthModal('login');
        return;
    }
    
    const flavor = document.getElementById('flavor-select').value;
    if(!flavor) {
        alert("Silakan pilih varian rasa terlebih dahulu!");
        return;
    }

    const itemName = `Paket Basreng (${flavor})`;
    const itemPrice = 10000;

    currentOrder.name = itemName;
    currentOrder.price = itemPrice;
    currentDiscount = 0;
    
    document.getElementById('checkout-phone').value = tempPhone;
    document.getElementById('promo-code').value = '';
    
    renderOrderSummary();
    navigate('checkout');
}

function renderOrderSummary() {
    const total = currentOrder.price - currentDiscount;
    const summaryDiv = document.getElementById('order-summary-content');
    
    let html = `
        <h3 style="margin-bottom:15px; font-size:1.1rem;">Ringkasan Belanja</h3>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>${currentOrder.name}</span>
            <span>Rp ${currentOrder.price.toLocaleString('id-ID')}</span>
        </div>
    `;
    if (currentDiscount > 0) {
        html += `<div style="display:flex; justify-content:space-between; margin-bottom:8px; color:var(--success-color);">
            <span>Diskon Promo</span><span>- Rp ${currentDiscount.toLocaleString('id-ID')}</span></div>`;
    }
    html += `
        <hr style="border-color:var(--border-color); margin:15px 0;">
        <div style="display:flex; justify-content:space-between; font-weight:bold; color:var(--primary-color); font-size:1.1rem;">
            <span>Total Bayar</span><span>Rp ${total.toLocaleString('id-ID')}</span>
        </div>`;
    summaryDiv.innerHTML = html;
}

function applyPromo() {
    const code = document.getElementById('promo-code').value.toUpperCase();
    if (code === 'BSRNG10') {
        currentDiscount = currentOrder.price * 0.1; 
        alert("Hore! Kode promo 'BSRNG10' berhasil digunakan. Kamu dapat diskon 10%.");
    } else {
        currentDiscount = 0;
        alert("Maaf, kode promo tidak valid atau sudah kadaluarsa.");
    }
    renderOrderSummary();
}

function processCheckout(event) {
    event.preventDefault();
    const phone = document.getElementById('checkout-phone').value;
    
    if(!indoPhoneRegex.test(phone)) {
        alert("Pastikan nomor telepon pengiriman menggunakan format Indonesia.");
        return;
    }

    alert("Pesanan berhasil dibuat! Silakan lakukan pembayaran agar pesanan bisa dikonfirmasi oleh Seller.");
    orderStatus = "pending"; 
    updateTrackView();
    document.getElementById('form-checkout').reset();
    navigate('track');
}

function simulateSellerVerification() {
    alert("Notifikasi: Seller telah memverifikasi pembayaran Anda! Pesanan sedang diproses.");
    orderStatus = "processing";
    updateTrackView();
}

function updateTrackView() {
    const emptyTrack = document.getElementById('empty-track');
    const activeTrack = document.getElementById('active-track');
    
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const sellerBtnBox = document.getElementById('seller-verification-box');

    if (orderStatus === "empty") {
        emptyTrack.style.display = 'block';
        activeTrack.style.display = 'none';
    } else if (orderStatus === "pending") {
        emptyTrack.style.display = 'none';
        activeTrack.style.display = 'block';
        
        step1.className = "timeline-item active"; 
        step2.className = "timeline-item"; 
        sellerBtnBox.style.display = 'block'; 
    } else if (orderStatus === "processing") {
        emptyTrack.style.display = 'none';
        activeTrack.style.display = 'block';
        
        step1.className = "timeline-item completed"; 
        step2.className = "timeline-item active"; 
        sellerBtnBox.style.display = 'none'; 
    }
}

// ==========================================
// 5. FITUR LAYANAN KONSUMEN (CHATBOT FAQ)
// ==========================================
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.style.display = (chatWindow.style.display === 'none' || chatWindow.style.display === '') ? 'flex' : 'none';
}
function handleEnter(event) { if (event.key === "Enter") sendMessage(); }

function sendMessage() {
    const inputField = document.getElementById('user-input');
    const message = inputField.value.trim().toLowerCase();
    const chatBody = document.getElementById('chat-body');

    if (message === '') return;
    chatBody.innerHTML += `<div class="chat-bubble user">${inputField.value}</div>`;
    inputField.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
        let botReply = "";
        
        if (message.includes('apa itu basreng')) {
            botReply = "Basreng (Bakso Goreng) adalah camilan renyah khas yang digoreng tipis dengan racikan bumbu spesial. Cocok banget jadi 'Your Buddy Snack'!";
        } 
        else if (message.includes('halal') || message.includes('fresh')) {
            botReply = "Tentu! Basreng kami 100% Halal dan selalu dibuat/digoreng fresh setiap hari.";
        } 
        else if (message.includes('harga') || message.includes('paket hemat')) {
            botReply = "Harga promo kami sangat terjangkau, hanya Rp 10.000 saja per paketnya!";
        } 
        else if (message.includes('promo') || message.includes('diskon')) {
            botReply = "Ada dong! Masukkan kode promo 'BSRNG10' saat checkout untuk dapat potongan harga. Pembelian jumlah banyak (reseller/acara) bisa hubungi admin untuk diskon ekstra.";
        } 
        else if (message.includes('varian') || message.includes('rasa') || message.includes('selain basreng')) {
            botReply = "Saat ini kami fokus menyajikan basreng terbaik dengan 3 pilihan varian rasa: Original, Pedas, dan Rendang.";
        } 
        else if (message.includes('level') || message.includes('request')) {
            botReply = "Bisa banget! Kamu bisa pilih rasa 'Pedas' saat memesan. Jika butuh level kepedasan khusus, tambahkan catatan saat checkout atau hubungi admin.";
        } 
        else if (message.includes('cara pesan') || message.includes('pesan melalui website') || message.includes('gofood') || message.includes('shopee')) {
            botReply = "Saat ini pemesanan eksklusif dan termudah bisa dilakukan langsung melalui website ini. Buka tab '🍔 Menu', pilih varian, dan langsung checkout!";
        } 
        else if (message.includes('luar kota') || message.includes('ongkir') || message.includes('pengiriman')) {
            botReply = "Kami bisa mengirim ke seluruh Indonesia! Lama pengiriman dan ongkos kirim (ongkir) tergantung ekspedisi tujuan kota kamu.";
        } 
        else if (message.includes('cod')) {
            botReply = "Tentu tersedia! Pilih metode 'Bayar di Tempat (COD)' saat proses checkout ya.";
        } 
        else if (message.includes('jumlah banyak') || message.includes('reseller') || message.includes('acara')) {
            botReply = "Wah, bisa banget! Kami menerima pesanan partai besar untuk reseller maupun acara. Silakan hubungi admin untuk penawaran menarik.";
        } 
        else if (message.includes('lokasi') || message.includes('toko')) {
            botReply = "Untuk saat ini kami fokus beroperasi secara online untuk melayani pengiriman seluruh Indonesia. Pengiriman dilakukan dari dapur pusat kami.";
        } 
        else if (message.includes('hubungi') || message.includes('admin') || message.includes('whatsapp') || message.includes('wa') || message.includes('email') || message.includes('rusak') || message.includes('kecewa')) {
            botReply = `Butuh bantuan lebih lanjut atau ingin komplain? Tim admin kami siap membantu melalui:<br>
            <a href="${adminWA}" target="_blank" class="wa-link">📱 Chat WA Admin</a>
            <a href="${adminEmail}" class="wa-link">📧 Email Admin</a>`;
        } 
        else {
            botReply = `Maaf, saya belum mengerti. Kamu bisa tanyakan seputar harga, rasa, ongkir, halal, atau ketik 'admin' untuk bantuan langsung.`;
        }

        chatBody.innerHTML += `<div class="chat-bubble bot">${botReply}</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000); 
}
