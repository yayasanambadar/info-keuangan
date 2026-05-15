# 🏫 Portal Informasi Tagihan Pendidikan
## SMP & SMK Al-Aqsyar Islamic School

Website statis untuk mengecek rincian tagihan pendidikan siswa berdasarkan Nomor Induk Siswa (NIS). Dibangun dengan HTML, CSS, dan Vanilla JavaScript — tanpa framework dan tanpa backend.

---

## 📁 Struktur File

```
portal-tagihan-al-aqsyar/
├── index.html      → Halaman utama
├── style.css       → Gaya tampilan
├── script.js       → Logika aplikasi & CSV parser
├── data.csv        → Data tagihan siswa
├── logo.png        → Logo sekolah (ganti dengan file asli)
└── README.md       → Dokumentasi ini
```

---

## 📊 Format data.csv

File `data.csv` menggunakan delimiter **koma (`,`)** atau **titik koma (`;`)**.

### Kolom yang tersedia:

| Kolom        | Keterangan                         |
|--------------|------------------------------------|
| NIS          | Nomor Induk Siswa (Primary Key)    |
| NAMA         | Nama lengkap siswa                 |
| KELAS        | Kelas siswa                        |
| UANG PANGKAL | Uang pangkal (0 jika sudah bayar)  |
| SPP (TOTAL)  | Total SPP setahun                  |
| OSIS         | Iuran OSIS                         |
| PRAKTIK      | Biaya praktik                      |
| SERAGAM      | Biaya seragam                      |
| BUKU         | Biaya buku                         |
| KEGIATAN     | Biaya kegiatan                     |
| MPLS         | Biaya MPLS (kelas baru)            |
| JUMLAH       | Total semua tagihan                |

### Format nominal yang didukung:
- `2550000`
- `Rp2.550.000`
- `Rp 2.550.000`

### Contoh baris:
```csv
NIS,NAMA,KELAS,UANG PANGKAL,SPP (TOTAL),OSIS,PRAKTIK,SERAGAM,BUKU,KEGIATAN,MPLS,JUMLAH
20240001,Ahmad Fauzi Ramadhan,XI DKV 1,0,3600000,150000,500000,850000,400000,300000,0,5800000
```

---

## 🖥️ Cara Menjalankan Secara Lokal

### Opsi 1 — VS Code Live Server (Direkomendasikan)
1. Install ekstensi **Live Server** di VS Code.
2. Buka folder `portal-tagihan-al-aqsyar` di VS Code.
3. Klik kanan `index.html` → **Open with Live Server**.

### Opsi 2 — Python HTTP Server
```bash
cd portal-tagihan-al-aqsyar
python -m http.server 8000
# Buka: http://localhost:8000
```

### Opsi 3 — Node.js http-server
```bash
npx http-server portal-tagihan-al-aqsyar -p 8080
# Buka: http://localhost:8080
```

> ⚠️ **Penting:** Jangan buka `index.html` langsung via `file://` — browser akan memblokir fetch CSV karena CORS policy.

---

## 🚀 Deploy ke GitHub Pages

1. Buat repository baru di GitHub (contoh: `portal-tagihan`).
2. Upload semua file ke repository tersebut.
3. Masuk ke **Settings → Pages**.
4. Di bagian **Source**, pilih branch `main` dan folder `/ (root)`.
5. Klik **Save**.
6. Website akan aktif di: `https://username.github.io/portal-tagihan/`

### Update data:
Cukup edit `data.csv` dan push ke GitHub — perubahan langsung aktif.

---

## 🖼️ Mengganti Logo Sekolah

1. Siapkan file logo berformat PNG dengan background transparan.
2. Beri nama `logo.png`.
3. Ganti file `logo.png` yang ada dengan file logo baru.
4. Ukuran optimal: **200×200 piksel** atau rasio 1:1.

---

## 💳 Informasi Pembayaran

| Item            | Detail              |
|-----------------|---------------------|
| Bank            | Bank BSI            |
| No. Rekening    | 7131094439          |
| Atas Nama       | SMP SMK AL-AQSYAR   |

Untuk mengubah informasi rekening, edit bagian payment di `index.html`.

---

## 📞 Kontak Admin

- **PIC Keuangan:** Finance Yayasan Am Badar
- **WhatsApp:** 081953159573
- **Jam Operasional:** Senin – Jumat, 08.00 – 14.30 WIB

---

## 🛠️ Teknologi

- HTML5 (Semantic)
- CSS3 (Mobile-first, Print-friendly)
- Vanilla JavaScript (ES6+)
- Google Fonts (Plus Jakarta Sans, DM Serif Display)
- GitHub Pages (Static Hosting)

---

*Dibuat untuk Yayasan Am Badar — SMP & SMK Al-Aqsyar Islamic School, Bogor.*
