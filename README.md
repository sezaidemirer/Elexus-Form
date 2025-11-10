# Elexus Form Uygulaması

Tek sayfalık formları toplayıp sonuçları GitHub deposunda saklayan bu uygulama, Express tabanlı bir API ve statik bir arayüzden oluşur. Her gönderim GitHub deposundaki JSON dosyasına eklenir; hiçbir kayıt silinmez.

## Kurulum

1. **Depoyu klonla**
   ```bash
   git clone https://github.com/sezaidemirer/Elexus-Form.git
   cd Elexus-Form
   ```

2. **Bağımlılıkları yükle**
   ```bash
   npm install
   ```

3. **Ortam değişkenlerini ayarla**
   - `env.example` dosyasını `.env` olarak kopyalayın.
   - Aşağıdaki değişkenleri güncelleyin:
     - `GITHUB_TOKEN`: Depoda yazma izni olan bir kişisel erişim tokenı (repo kapsamı yeterlidir).
     - `GITHUB_OWNER`: GitHub kullanıcı adı veya organizasyon.
     - `GITHUB_REPO`: Verilerin kaydedileceği depo adı (varsayılan `Elexus-Form`).
     - `GITHUB_BRANCH`: (Opsiyonel) Hedef branch, varsayılan `main`.
     - `GITHUB_FILE_PATH`: (Opsiyonel) Kayıtların saklanacağı dosya yolu, varsayılan `data/submissions.json`.

## Çalıştırma

```bash
npm start
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışır. Bu adres üzerinden form arayüzüne ulaşabilirsiniz.

> Not: İlk çalıştırmadan önce hedef depoda `data/` klasörünün bulunmasına gerek yoktur; uygulama göndermeler sırasında dosyayı otomatik oluşturur.

## Akış

- Formu doldurup **Kaydet ve Gönder** dediğinizde, JSON formatında bir payload Express API'ına gönderilir.
- API, GitHub REST API üzerinden belirtilen JSON dosyasını okur, yeni kaydı ekler ve dosyayı geri yazar.
- **Test sonuçları** düğmesi tıklandığında, aynı dosyadaki kayıtlar okunur ve son giriş en üstte olacak şekilde listelenir.

## Önemli Notlar

- GitHub tokenınızı istemci tarafında paylaşmayın; `.env` yalnızca sunucu tarafında kullanılmalıdır.
- Veri bütünlüğü için API hiçbir kaydı silmeyecek şekilde tasarlanmıştır; tüm eklenen kayıtlar JSON dosyasına ardışık olarak eklenir.
- GitHub API kısıtlamalarına takılmamak için çok sık arka arkaya gönderim yapmamaya özen gösterin.

