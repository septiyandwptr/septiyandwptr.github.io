# Website portofolio Septiyan Dwi Putra

## Struktur folder

```
index.html              -> kerangka halaman (HTML saja, tanpa teks panjang)
assets/css/style.css    -> semua tampilan (warna, ukuran, layout, animasi)
assets/js/app.js        -> logika (navigasi, tab, animasi, tombol CV)
data/content.json       -> SEMUA teks dan data (ID + EN), kontak, pengalaman, proyek
assets/img/             -> gambar latar, avatar, halaman pratinjau CV
assets/docs/            -> file PDF CV
build.py                -> membuat satu file gabungan: dist/portfolio.html
dist/portfolio.html     -> versi satu file (bisa dibuka langsung tanpa server)
```

## Cara memperbarui data (cukup edit `data/content.json`)

Teks dwibahasa memakai pasangan `{ "id": "...", "en": "..." }`.

| Bagian di JSON | Isinya |
|---|---|
| `meta` | email, LinkedIn, nama file CV |
| `experience` | tab dan isi Pengalaman (halaman Tentang) |
| `story` | tab Perjalanan / Latar belakang / Passion |
| `projects` | kartu di halaman Proyek (`cat`, `title`, `desc`, `tags`, `viz`, `data`) |
| `filters` | tombol filter di halaman Proyek |
| `career` | batang karier di kartu Karier (Beranda) |
| `strings` | teks lain di semua kartu, menu, dan jendela CV |

Kunci di `strings` mengikuti pola `halaman.kartu.urutan`, misalnya `home.t-hero.1` adalah teks pertama
di kartu utama Beranda. Cara paling mudah: cari (Ctrl+F) kalimat yang ingin diubah di `content.json`.

Menambah proyek: salin satu blok di `projects`, ubah isinya. Tipe grafik (`viz`): `bars`, `line`, `steps`, `scatter`, `dots`, `curve`.
Mengganti CV: timpa `assets/docs/Septiyan_Dwi_Putra_-_CV.pdf` dan dua gambar pratinjau `assets/img/cv-page-1.webp` dan `cv-page-2.webp`.
Angka yang dihitung naik (mis. 14+ tahun, 04 perusahaan) ada di `index.html` pada atribut `data-to`.

## Cara memasang di hosting

Unggah isi folder ini: `index.html`, folder `assets/`, dan folder `data/` (build.py, dist, README.md tidak wajib).
Tidak perlu pengaturan server.

## Menjalankan di komputer sendiri

Browser memblokir pemuatan `content.json` bila `index.html` dibuka dengan klik ganda. Pilih salah satu:

1. Buka `dist/portfolio.html` (versi satu file, langsung jalan), atau
2. Jalankan server lokal di folder ini: `python3 -m http.server 8000`, lalu buka http://localhost:8000

## Membuat ulang versi satu file

Setelah mengedit file apa pun: `python3 build.py` (butuh Python 3, tanpa tambahan paket).
