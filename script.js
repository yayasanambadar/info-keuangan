/**
 * PORTAL TAGIHAN PENDIDIKAN — SMP & SMK Al-Aqsyar Islamic School
 * script.js
 *
 * Fitur:
 * - Load & parse CSV (support koma/titikoma, BOM, quotes)
 * - Pencarian by NIS
 * - Format Rupiah
 * - Copy to clipboard
 * - WhatsApp URL dinamis
 * - Print support
 * - Close result + feedback
 * - Enter key support
 * - Error handling lengkap
 */

// =============================================
// STATE
// =============================================
let dataTagihan = [];   // Array of row objects
let dataLoaded  = false;
let dataError   = false;
let currentData = null; // Hasil pencarian aktif

// =============================================
// INISIALISASI
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Tahun di footer
  document.getElementById('tahun').textContent = new Date().getFullYear();

  // Tanggal "Data per" akan diisi saat CSV berhasil dibaca (#UPDATED).
  // Fallback jika CSV tidak memiliki metadata:
  const elDate = document.getElementById('dataDate');
  if (elDate) elDate.textContent = '—';

  // Enter key
  const input = document.getElementById('nisInput');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') cariTagihan();
    });
  }

  // Load CSV
  loadCSV();
});

// =============================================
// CSV LOADER
// =============================================
async function loadCSV() {
  try {
    const resp = await fetch('data.csv');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    dataTagihan = parseCSV(text);
    dataLoaded = true;
    console.log(`[Portal] CSV loaded: ${dataTagihan.length} baris data.`);
  } catch (err) {
    dataError = true;
    console.error('[Portal] Gagal memuat data.csv:', err);
  }
}

// =============================================
// CSV PARSER
// =============================================
function parseCSV(raw) {
  // Hapus BOM UTF-8 jika ada
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);

  const lines = raw.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  let startIdx = 0;

  // Cek apakah baris pertama adalah metadata #UPDATED
  const firstCols = parseLine(lines[0], ',');
  if (firstCols[0].trim().toUpperCase() === '#UPDATED') {
    const tglUpdate = (firstCols[1] || '').trim();
    // Tampilkan ke elemen dataDate jika tersedia
    const elDate = document.getElementById('dataDate');
    if (elDate && tglUpdate) elDate.textContent = tglUpdate;
    startIdx = 1; // lewati baris metadata, mulai dari header NIS
  }

  // Deteksi delimiter dari baris header
  const headerLine = lines[startIdx];
  const delimiter = headerLine.includes(';') ? ';' : ',';

  // Parse header
  const headers = parseLine(headerLine, delimiter).map(h => h.trim().toUpperCase());

  const result = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseLine(line, delimiter);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] || '').trim();
    });

    // Gunakan NIS sebagai key (skip baris tanpa NIS)
    if (row['NIS']) result.push(row);
  }
  return result;
}

/**
 * Parse satu baris CSV dengan dukungan field bertanda kutip.
 */
function parseLine(line, delim) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delim && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// =============================================
// PENCARIAN
// =============================================
function cariTagihan() {
  const input = document.getElementById('nisInput');
  const nis   = (input ? input.value : '').trim();

  // Validasi kosong
  if (!nis) {
    setStatus('Mohon masukkan Nomor Induk Siswa (NIS) terlebih dahulu.', 'error');
    if (input) input.focus();
    return;
  }

  // Data belum selesai dimuat
  if (!dataLoaded && !dataError) {
    setStatus('Data sedang dimuat, silakan tunggu sebentar...', 'info');
    return;
  }

  // Error membaca CSV
  if (dataError) {
    setStatus('Gagal memuat data. Pastikan file data.csv tersedia dan coba muat ulang halaman.', 'error');
    return;
  }

  // Cari NIS (case-insensitive, trim)
  const found = dataTagihan.find(row => row['NIS'] === nis);

  if (!found) {
    setStatus(`NIS "${escapeHTML(nis)}" tidak ditemukan. Periksa kembali nomor Anda.`, 'error');
    sembunyikanHasil();
    return;
  }

  setStatus('', '');
  currentData = found;
  tampilkanHasil(found);
}

// =============================================
// TAMPILKAN HASIL
// =============================================
function tampilkanHasil(data) {
  const section = document.getElementById('resultSection');

  // Siswa info
  const nama  = data['NAMA']  || '—';
  const kelas = data['KELAS'] || '—';

  document.getElementById('siswaNama').textContent  = nama;
  document.getElementById('siswaKelas').textContent = 'Kelas: ' + kelas;

  // Avatar: inisial nama
  const avatar = document.getElementById('siswaAvatar');
  avatar.textContent = nama.charAt(0).toUpperCase();

  // Komponen tagihan
  const komponen = [
    ['Uang Pangkal',  'UANG PANGKAL'],
    ['SPP (Total)',   'SPP (TOTAL)'],
    ['OSIS',          'OSIS'],
    ['Praktik',       'PRAKTIK'],
    ['Seragam',       'SERAGAM'],
    ['Buku',          'BUKU'],
    ['Kegiatan',      'KEGIATAN'],
    ['MPLS',          'MPLS'],
  ];

  const tbody = document.getElementById('tagihanBody');
  tbody.innerHTML = '';

  komponen.forEach(([label, key]) => {
    const rawVal = data[key] || '0';
    const nominal = parseNominal(rawVal);
    const tr = document.createElement('tr');
    if (nominal === 0) tr.classList.add('zero-row');
    tr.innerHTML = `
      <td>${escapeHTML(label)}</td>
      <td>${formatRupiah(nominal)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Total
  const rawJumlah = data['JUMLAH'] || '0';
  const total = parseNominal(rawJumlah);
  document.getElementById('tagihanTotal').textContent = formatRupiah(total);

  // Tampilkan section
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =============================================
// TUTUP HASIL
// =============================================
function tutupHasil() {
  sembunyikanHasil();
  setStatus('Terima kasih. Silakan masukkan NIS lain untuk melihat tagihan siswa berikutnya.', 'ok');
  currentData = null;
  const input = document.getElementById('nisInput');
  if (input) {
    input.value = '';
    input.focus();
  }
}

function sembunyikanHasil() {
  const section = document.getElementById('resultSection');
  if (section) section.style.display = 'none';
}

// =============================================
// STATUS MESSAGE
// =============================================
function setStatus(msg, type) {
  const el = document.getElementById('statusMsg');
  if (!el) return;
  el.innerHTML = escapeHTML(msg);
  el.className = 'status-msg ' + (type || '');
}

// =============================================
// COPY NOMOR REKENING
// =============================================
function copyNorek() {
  const norek = document.getElementById('norek');
  const nomor = norek ? norek.textContent : '7131094439';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(nomor)
      .then(() => showCopyNotif('✅ Nomor rekening berhasil disalin!'))
      .catch(() => fallbackCopy(nomor));
  } else {
    fallbackCopy(nomor);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showCopyNotif('✅ Nomor rekening berhasil disalin!');
  } catch {
    showCopyNotif('❌ Gagal menyalin. Salin manual: ' + text);
  }
  document.body.removeChild(ta);
}

function showCopyNotif(msg) {
  const el = document.getElementById('copyNotif');
  if (!el) return;
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 3000);
}

// =============================================
// KONFIRMASI WHATSAPP
// =============================================
function konfirmasiWA() {
  if (!currentData) return;

  const nama   = currentData['NAMA']   || '—';
  const kelas  = currentData['KELAS']  || '—';
  const jumlah = formatRupiah(parseNominal(currentData['JUMLAH'] || '0'));

  const pesan =
`Assalamu'alaikum,

Saya ingin melakukan konfirmasi pembayaran tagihan pendidikan.

Nama Siswa: ${nama}
Kelas: ${kelas}
Total Tagihan: ${jumlah}

Mohon dilakukan verifikasi pembayaran.

Jazakumullahu khairan.`;

  const encoded = encodeURIComponent(pesan);
  const url = `https://wa.me/6281953159573?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// =============================================
// CETAK TAGIHAN
// =============================================
function cetakTagihan() {
  window.print();
}

// =============================================
// UTILITIES
// =============================================

/**
 * Parse nominal dari berbagai format ke angka.
 * Support: 2550000, Rp2.550.000, Rp 2.550.000, 2.550.000
 */
function parseNominal(str) {
  if (!str) return 0;
  // Hapus Rp, spasi, titik ribuan
  const clean = String(str)
    .replace(/Rp\.?\s*/gi, '')
    .replace(/\./g, '')
    .replace(/,/g, '')
    .trim();
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
}

/**
 * Format angka ke Rupiah Indonesia.
 */
function formatRupiah(val) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Escape HTML untuk mencegah XSS.
 */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
