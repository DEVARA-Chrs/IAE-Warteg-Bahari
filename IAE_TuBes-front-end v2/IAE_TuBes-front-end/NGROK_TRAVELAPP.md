# Integrasi lintas internet (Ngrok) — Travel App

Dokumen ini menjelaskan cara agar **Travel App** dan **Maskapai** tetap saling terhubung walaupun beda jaringan (jarak jauh via internet).

## Ringkas arsitektur (yang ditunnel)
Agar integrasi tetap jalan, yang perlu bisa diakses antar-laptop hanya:

1) Travel App → Maskapai:
- Flight Schedule (asalnya port 4002)
- Flight Booking (asalnya port 4003)

2) Maskapai → Travel App:
- Endpoint booking-service Travel App (port 4003 di host Travel App)

Pada versi ini, **Maskapai sudah punya edge-proxy** di port `8080` yang memetakan:
- `/schedule` → flight-schedule-service
- `/booking` → flight-booking-service

Jadi Travel App cukup diarahkan ke **1 URL publik** maskapai (ngrok) + path.

## 1) Jalankan Travel App (docker)
```bash
docker compose up --build
```

Pastikan booking-service Travel App jalan dan bisa diakses lokal:
- http://localhost:4003  (UI / route frontend tergantung project)

## 2) Jalankan ngrok untuk booking-service Travel App (port 4003)
Install ngrok, login authtoken, lalu:

```bash
ngrok http 4003
```

Ambil URL publik HTTPS yang muncul. Contoh:
`https://wxyz-12-34-56-78.ngrok-free.app`

## 3) Set `.env` Travel App (URL maskapai via ngrok)
Isi `.env` Travel App seperti ini:

```env
# URL publik maskapai (edge-proxy) + path
AIRLINE_FLIGHT_SCHEDULE_SERVICE=https://<NGROK_MASKAPAI>/schedule
AIRLINE_FLIGHT_BOOKING_SERVICE=https://<NGROK_MASKAPAI>/booking

# Shared key (harus sama dengan PARTNER_API_KEY di maskapai)
PARTNER_API_KEY=PARTNER_SECRET
```

## 4) Set `.env` maskapai (callback ke Travel App via ngrok)
Di `.env` maskapai:

```env
KELOMPOK2_BOOKING_SERVICE=https://<NGROK_TRAVELAPP>/
PARTNER_API_KEY=PARTNER_SECRET
```

## Catatan penting tentang limit ngrok free
Di dokumentasi free plan, ngrok membatasi jumlah **Agents** dan **Active Endpoints**. Artinya, paling aman:
- pakai **akun ngrok berbeda** untuk masing-masing laptop (Travel App vs Maskapai),
- atau gunakan plan berbayar,
- atau gunakan alternatif VPN seperti Tailscale/ZeroTier (lebih simpel untuk “seperti 1 LAN”).

## Testing cepat
- Dari Travel App: query jadwal flight (yang asalnya dari maskapai)
- Lakukan booking flight dari Travel App
- Dari Maskapai: cek `partnerImportedBookings` untuk memastikan booking masuk.
