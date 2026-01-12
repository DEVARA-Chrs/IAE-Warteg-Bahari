# Integrasi Travel-app <-> Maskapai (API Exchange)

## Inti Integrasi
- Travel-app (booking-service) **mengambil flight schedule** dari maskapai (flight-schedule-service).
- Saat booking FLIGHT dibuat di Travel-app, Travel-app akan **memanggil** mutation `syncKelompok2Booking(bookingId)` di maskapai.
- Maskapai lalu **mengambil balik** detail booking dari Travel-app via query `bookingById(id)`.

## ENV yang bisa di-set
Buat file `.env` di folder root project (selevel `docker-compose.yml`) dengan isi seperti `.env.example`.

Jika beda laptop:
- Set `AIRLINE_FLIGHT_SCHEDULE_SERVICE=http://<IP_LAPTOP_MASKAPAI>:4002`
- Set `AIRLINE_FLIGHT_BOOKING_SERVICE=http://<IP_LAPTOP_MASKAPAI>:4003`

## Jalankan
```bash
docker compose up --build
```

## Catatan
Repo ini aslinya mereferensikan `promo-service` di compose & gateway tapi foldernya tidak ada.
Di versi integrated ini, `promo-service` dibuat sebagai **stub minimal** supaya semua service bisa jalan.
