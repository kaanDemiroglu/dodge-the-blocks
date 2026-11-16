# Dodge the Blocks

[English](./README.md) | **Türkçe**

**Ders:** NMED 3203 — Interactive Media Applications
**Seçilen temalar:** Agency / Eylemlilik (01) + Temporality / Zamansallık (04)

**Tek cümleyle deneyim:** Mavi bir kareyi kaydırarak ödülleri topla, gerisinden kaç. Hayatta kaldıkça her şey daha hızlı düşer.

> **v2 "Eşyalar":** Düşen bloklar artık farklı eşyalar. Tüm kurallar için [SPEC.md](./SPEC.md) dosyasına bak (İngilizce). Oyunun yanındaki Items kartı her ikonu açıklar.

## Nasıl oynanır

1. **Normal** veya **Fast** modunu seç ve **Start Game**'e bas.
2. Mavi kareyi sağa sola hareket ettir. **Ödülleri topla** (yuvarlak hap şekilleri), **harcamalardan** (çizgili bloklar) ve **kötü modlardan** (sekizgenler) kaç.
3. Eşyalar rastgele zamanlarda, aynı anda birkaç tane gelir. Harcamaların arasından geçiş için her zaman bir yol vardır. Sana değmeden geçen her harcama veya kötü mod **1 puan** verir.
4. **0 kalple** başlarsın (sol üstte, en fazla 3; **Extra life** ile kazanılır). Bir kalp seni bir **Block** ya da bomba (Small/Big expense) darbesinden kurtarır. Kalbin yokken Block oyunu bitirir, Small expense (−1) ve Big expense (−5) doğrudan puanından düşer. **Crash** canın olsa bile oyunu bitirir. Düşenlerin yaklaşık yarısı klasik Block'tur.
5. Ödüller: **x2 Bonus**, **Extra life**, **Shield** (kalkan), **Slow time**. Kötü modlar: **Speed x2**, **Reverse** (yön ters), **Ghost** (5 saniye görünmez olursun). Aktif etkiler geri sayımla sağ üstte görünür.
6. Her 10 saniyede her şey daha hızlı düşer.
7. Kalbin yokken **Block**'a ya da her durumda **Crash**'e değersen oyun biter. Tekrar denemek için **Restart**'a bas. "−1" ve "−5" eşyaları doğrudan puanından düşer, puan 0'ın altına bile inebilir.

## Kontroller

| Eylem | Klavye | Dokunmatik / fare |
| --- | --- | --- |
| Sola git | `←` veya `A` | **Left** butonunu basılı tut |
| Sağa git | `→` veya `D` | **Right** butonunu basılı tut |

- Sol ve sağa aynı anda basarsan hareket birbirini götürür (kare durur).
- Ekrandaki butonlar klavyeyle de çalışır: `Tab` ile seç, `Space` veya `Enter` tuşunu basılı tut.
- Tuşu bırakmak, pencereden çıkmak veya sekme değiştirmek hareketi durdurur.

## Temalar

- **Agency (Eylemlilik):** Girdin kareyi hareket ettirir; bloğa çarpıp çarpmayacağını yalnızca konumun belirler. İyi dodge puan kazandırır, kötü konum oyunu bitirir.
- **Temporality (Zamansallık):** Oyunun kendi geçen süresi, belirli aralıklarla blok hızını artırır. Aynı mesafeyi bir blok daha kısa sürede kat eder, yani aynı hamleyi daha hızlı yapman gerekir.
- **Etkileşim:** Hareket üzerindeki kontrol tamamen sende kalır, ama zaman bu kontrolü ne kadar iyi kullanabildiğini değiştirir. **Normal** ve **Fast** modlarını (sadece başlangıç hızı farklıdır) ya da aynı dodge'u bir oyunun başında ve sonunda karşılaştırabilirsin.

## GitHub Pages bağlantısı

`https://USERNAME.github.io/dodge-the-blocks/` — **henüz yayınlanmadı.** Yayınlayıp test ettikten sonra `USERNAME` kısmını değiştir.

## Yerelde çalıştırma

ES modülleri `file://` üzerinden yüklenmez, bu yüzden küçük bir yerel sunucu kullan:

```bash
cd dodge-the-blocks
python3 -m http.server 8000
# sonra http://localhost:8000 adresini aç
```

## Dosyalar

| Dosya | Ne yapar |
| --- | --- |
| `index.html` | Sayfa yapısı: başlık, skor paneli, canvas, menüler, ekran butonları |
| `styles.css` | Yerleşim, renkler, odak stilleri, telefon düzeni |
| `src/config.js` | **Tüm kural ayarları ve `ITEMS` tablosu. Değişiklik buradan yapılır.** |
| `src/items.js` | Her eşyanın ve ikonun çizimi (oyun ve Items kartı aynı kodu kullanır) |
| `src/game.js` | Oyun durumu, güncelleme döngüsü, rastgele üretim, eşyalar ve etkiler, çarpışma, zorluk, çizim |
| `SPEC.md` | v2 kuralları (İngilizce) |
| `src/scenery.js` | Pixel-art gökyüzü, bulut, şehir, ağaç ve çim (kodla çizilir) |
| `src/main.js` | Butonlar, klavye ve dokunma olayları, sayfa metinlerinin güncellenmesi |
| `RATIONALE.md` | Tasarım gerekçesi ve kaynaklar (İngilizce) |

### Kuralları nerede değiştirirsin

`src/config.js` dosyasını aç, bir sayıyı değiştir, kaydet ve sayfayı yenile.

| Ayar | Etkisi |
| --- | --- |
| `initialObstacleSpeedPxPerSecond` | Blokların başlangıçtaki düşme hızı |
| `speedIncreasePxPerSecond` | Her hızlanma adımında eklenen hız |
| `difficultyIntervalSeconds` | Hızlanma adımları arasındaki süre |
| `maximumObstacleSpeedPxPerSecond` | Hız sınırı |
| `playerSpeedPxPerSecond` | Oyuncunun hareket hızı (eylemlilik gücü) |
| `obstacleWidth` | Blok genişliği (başarılı seçimler için boşluk) |
| `fastModeMultiplier` | Fast modunun başlangıç hızı = başlangıç hızı × bu değer |
| `spawnDelayMinMilliseconds` / `spawnDelayMaxMilliseconds` | Bloklar arası rastgele bekleme (küçüldükçe daha çok blok) |
| `spawnSkipChance` | Bir anda hiç blok gelmeme olasılığı |
| `safeGapMarginPx` | Görünmez güvenli yolun etrafındaki ek boşluk (büyüdükçe daha kolay) |
| `corridorSafetyFactor` | Güvenli yolun ne kadar hızlı kayabileceği (küçüldükçe daha kolay) |
| `startingLives` / `maxLives` | Başlangıç canı ve üst sınır |
| `ITEMS.<eşya>.weight` | Eşyanın ne kadar sık geldiği (büyüdükçe daha sık) |
| `ITEMS.<eşya>.duration` / `multiplier` / `penalty` | Etkilerin süresi ve gücü, harcamaların bedeli |

Bir ayar oyunu imkânsız hale getirebilecekse tarayıcı konsolunda uyarı çıkar (`src/game.js` içindeki `checkFairness`).

## Gerekçe

Bkz. [RATIONALE.md](./RATIONALE.md) (İngilizce).

## Katkılar

- Kod, tasarım ve grafikler bu ders projesi için yazıldı. Pixel-art manzara dahil tüm grafikler HTML canvas ve CSS ile kodla çizildi. Harici görsel, kütüphane veya font kullanılmadı. Görsel stil, öğrencinin verdiği bir pixel-art referans görselinden esinlendi.
- Okumalar ([RATIONALE.md](./RATIONALE.md) içinde listelidir): Wardrip-Fruin vd. (2009); Sicart (2008).
- Ders lab materyalleri: <https://mertseven.com/ima/lab/bibliography.html>

## Yapay zekâ kullanım notu

- **Araç:** Claude Code (Claude Sonnet 5.5, Anthropic), `SPEC.md`'yi izleyerek kodun ilk sürümünü (`index.html`, `styles.css`, `src/*.js`), README'yi ve RATIONALE.md ile CLAUDE.md taslaklarını üretti.
- **Benim yaptığım:** İki temayı ben seçtim, üretilen kodu inceledim, oyunu oynayıp `src/config.js` ayarlarıyla dengeledim, gerekçe metnini ve kaynakçayı düzenledim.
- **Yapım sırasında yapılan düzeltmeler:** İlk sürümden sonra Claude Code oyunu tarayıcıda telefon genişliğinde kontrol etti. Skor panelinde "Mode" kutusu tek başına bir satırda kalıyordu ve bozuk görünüyordu, bu yüzden düzen düzeltildi. Daha sonra otomatik test botu Normal modda çöktü; bunun oyun kurallarından değil, botun yanlış satıra yönelmesinden kaynaklandığı anlaşıldı ve bot düzeltildi.
- **Düzeltme örneği:** Üretilen telefon düzeninde "Mode" kutusu tek başına kalıyordu, düzelttirdim. İlk gerekçe taslağı Wardrip-Fruin vd. (2009) makalesini ezberden özetlemişti; makaleyi açıp okuduktan sonra o cümleyi makalenin söylediğiyle uyumlu olacak şekilde yeniden yazdım.
