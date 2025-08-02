Dokumentacja techniczna integracji sklepu z bramką płatności imoje
Introduction
Instrukcja integracji sklepu z bramką płatności imoje.

Dokumentacja w języku angielskim

Zobacz również naszą dokumentację dla integracji RESTful API

Wymagane dane do integracji
Identyfikator klienta - merchantId

Identyfikator sklepu - serviceId

Klucz sklepu - serviceKey

Token autoryzacyjny

Gdzie znaleźć dane do integracji
Po zalogowaniu się do panelu administracyjnego imoje należy przejść do zakładki Sklepy, wybrać odpowiedni sklep i przejść do jego Szczegółów. Następnie do zakładki Dane do integracji. W tym miejscu znajduje się: identyfikator klienta, identyfikator sklepu oraz klucz sklepu.

Token autoryzacyjny znajduje się w ustawieniach, w prawym górnym rogu panelu imoje obok imienia i nazwiska. Następnie należy przejść do zakładki Klucze API, wybrać istniejący klucz (default) i wejść w jego Szczegóły, gdzie należy skopiować istniejący klucz.

Panel administracyjny dla środowiska testowego sandbox

Wykonanie transakcji
Aby wykonać transakcję, należy wysłać żądanie metodą POST lub GET na adres:

Produkcyjny URL: https://paywall.imoje.pl/payment

Sandbox URL: https://sandbox.paywall.imoje.pl/payment

następujące parametry:

Parametr	Typ	Parametr wymagany	Opis
serviceId	string(36)	TAK	Identyfikator sklepu klienta jako UUID v4
merchantId	string(20)	TAK	Identyfikator klienta
amount	string	TAK	Kwota transakcji w najmniejszej jednostce waluty np. grosze
currency	string(3)	TAK	Waluta transakcji w standardzie ISO 4217
orderId	string(100)	TAK	Numer zamówienia
Dopuszczalne znaki: A-Za-z0-9#_-./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne)
customerFirstName	string(100)	TAK	Imię osoby składającej zamówienie
Dopuszczalne znaki: A-Za-z0-9-,. oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), 0400 - 04FF (cyrylica)
customerLastName	string(100)	TAK	Nazwisko osoby składającej zamówienie
Dopuszczalne znaki: A-Za-z0-9-,. oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), 0400 - 04FF (cyrylica)
signature	string	TAK	Wyliczona sygnatura
customerEmail	string(200)	NIE	Adres e-mail w formacie zgodnym ze standardem RFC 5322 oraz RFC 6531
customerPhone	string(20)	NIE	Numer telefonu osoby składającej zamówienie
Dopuszczalne znaki: -+0-9 oraz spacja. Wartość parametru zawierać może maksymalnie 20 znaków
orderDescription	string(255)	NIE	Tytuł transakcji
Dopuszczalne znaki: A-Za-z0-9#&_-,./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne)
additionalDescription	string	NIE	Szczegóły zamówionych produktów lub usług
urlSuccess	string(300)	NIE	Adres URL, na który użytkownik będzie przekierowany po pomyślnie zakończonej transakcji
urlFailure	string(300)	NIE	Adres URL, na który użytkownik będzie przekierowany po błędnie dokonanej transakcji
urlReturn	string(300)	NIE	Adres URL, na który użytkownik będzie przekierowany po dokonaniu transakcji
urlNotification	string(300)	NIE	Dynamiczny adres notyfikacji, możliwość ustawienia konkretnego adresu dla pojedynczej transakcji.
visibleMethod	string	NIE	Metody płatności widoczne na bramce płatności
Dostępne wartości: card, wallet, pbl, blik, imoje_paylater, wt, lease, imoje_installments
Jeśli tego pola nie ma lub jest puste to są wyświetlane wszystkie włączone w sklepie klienta metody płatności. Istnieje wiele konfiguracji wyświetlanych metod płatności. Należy je zawsze rozdzielać przecinkiem (np. card,pbl)
validTo	string	NIE	Data ważności linku jako timestamp w sekundach. Brak realizacji płatności do tego czasu spowoduje jej anulowanie. Jeżeli nie jest przekazane to link ważny jest do czasu ustawionego w parametrze Aktywność płatności w Panelu Administracyjnym imoje (ustawienia sklepu) lub po upływie 15 miesięcy. Przekazanie parametru validTo= NULL powoduje brak wygaśnięcia linku z pominięciem ustawień w parametrze Aktywność płatności na Panelu Administracyjnym imoje (ustawienia sklepu). Minimalny czas ważności linku to 60 sekund.
preselectMethodCode	string(20)	NIE	Kanał płatności ustawiony jako domyślny i automatycznie wybrany po otwarciu bramki płatności. Jeśli tego pola nie ma to bramka otwiera się bez wybranego zaznaczonego kanału płatności. Pole nie może być zdefiniowane i pozostawione bez wartości.
Dostępne wartości: Metody i kanały realizacji transakcji
billing	string	NIE	Dane płatnika - zobacz tabelę poniżej
shipping	string	NIE	Dane dostawy - zobacz tabelę poniżej
Parametry dla tablicy billing:

Parametr	Typ	Parametr wymagany	Opis
firstName	string(100)	TAK	Imię klienta,
dopuszczalne znaki: A-Za-z0-9#&_-"',./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), 0400 - 04FF (cyrylica)
lastName	string(100)	TAK	Nazwisko klienta,
dopuszczalne znaki: A-Za-z0-9#&_-"',./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), 0400 - 04FF (cyrylica)
company	string(200)	NIE	Nazwa firmy,
dopuszczalne znaki: A-Za-z0-9 oraz znak spacji (0x20)
street	string(200)	NIE	Ulica,
dopuszczalne znaki: A-Za-z0-9 oraz znak spacji (0x20)
city	string(100)	NIE	Miasto,
dopuszczalne znaki: A-Za-z0-9 oraz znak spacji (0x20)
region	string(100)	NIE	Region,
Dopuszczalne znaki: A-Za-z0-9 oraz znak spacji (0x20)
postalCode	string(30)	NIE	Kod pocztowy
countryCodeAlpha2	string(20)	NIE	Kod kraju Alpha2
taxId	string(12)	NIE	Numer identyfikacji podatkowej
Parametry dla tablicy shipping:

Parametr	Typ	Parametr wymagany	Opis
firstName	string(100)	TAK	Imię klienta,
dopuszczalne znaki: A-Za-z0-9#&_-"',./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), 0400 - 04FF (cyrylica)
lastName	string(100)	TAK	Nazwisko klienta,
dopuszczalne znaki: A-Za-z0-9#&_-"',./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), 0400 - 04FF (cyrylica)
company	string(200)	NIE	Nazwa firmy,
dopuszczalne znaki: A-Za-z0-9 oraz znak spacji (0x20)
street	string(200)	NIE	Ulica,
dopuszczalne znaki: A-Za-z0-9 oraz znak spacji (0x20)
city	string(100)	NIE	Miasto,
dopuszczalne znaki: A-Za-z0-9 oraz znak spacji (0x20)
region	string(100)	NIE	Region,
dopuszczalne znaki: A-Za-z0-9 oraz znak spacji (0x20)
postalCode	string(30)	NIE	Kod pocztowy
countryCodeAlpha2	string(2)	NIE	Kod kraju Alpha2
Przykładowa zawartość formularza:

<input type="hidden" value="63f574ed-d90d-4abe-9cs1-39117584a7b7" name="serviceId">
<input type="hidden" value="6yt3gjtm9p1odfgx8491" name="merchantId">
<input type="hidden" value="300" name="amount">
<input type="hidden" value="PLN" name="currency">
<input type="hidden" value="123" name="orderId">
<input type="hidden" value="Example transaction" name="orderDescription">
<input type="hidden" value="John" name="customerFirstName">
<input type="hidden" value="Doe" name="customerLastName">
<input type="hidden" value="johndoe@domain.com" name="customerEmail">
<input type="hidden" value="501501501" name="customerPhone">
<input type="hidden" value="https://your-shop.com/success" name="urlSuccess">
<input type="hidden" value="https://your-shop.com/failure" name="urlFailure">
<input type="hidden" value="https://your-shop.com/return" name="urlReturn">
<input type="hidden" value="John" name="shipping[firstName]">
<input type="hidden" value="Doe" name="shipping[lastName]">
<input type="hidden" value="Doe sp. z o.o." name="shipping[company]">
<input type="hidden" value="1589792912" name="shipping[taxId]">
<input type="hidden" value="John" name="billing[firstName]">
<input type="hidden" value="Doe" name="billing[lastName]">
<input type="hidden" value="Doe sp. z o.o." name="billing[company]">
<input type="hidden" value="Prosta 1" name="billing[street]">
<input type="hidden" value="Warszawa" name="billing[city]">
<input type="hidden" value="00-001" name="billing[postalCode]">
<input type="hidden" value="PL" name="billing[countyCodeAlpha2]">
<input type="hidden" value="cd5024f5ce5e6ff47990fe60572758fbcbcd6e3c04895d6815932b2d14e04ffd;sha256" name="signature">
Każdy nieopłacony link wygaśnie automatycznie po upływie 15 miesięcy od daty jego utworzenia. Jeśli chcesz aby wygasał szybciej, skorzystaj z parametru validTo

Wartości parametrów z adresami powinny być pełnymi adresami (absolute URL).

Chcesz uzyskać logo wybranej metody płatności? Skorzystaj z tego zapytania lub skontaktuj się z nami.

Masz pytanie? Zobacz nasze FAQ

Autoryzacja - wyliczanie sygnatury
Do autoryzacji transakcji wykorzystywana jest sygnatura, którą wyliczamy w następujący sposób:

Sortujemy alfabetycznie, rosnąco, po kluczach parametry zamówienia.

Łączymy parametry w następujący sposób: parametr1=wartosc1&parametr2=wartosc2...parametrN=wartoscN. Wynik zapisujemy do zmiennej (zwanej dalej body).

Wyliczamy sygnaturę metodą hashowania sha224, sha256, sha384 lub sha512 np. sha256(body + serviceKey. Wynik hashowania zapisujemy do zmiennej (zwanej dalej signature).

Do wyliczonej sygnatury dopisujemy po średniku użytą metodę hashowania: signature + ';sha256'.

Przykład wyliczenia sygnatury
/**
 * @param array  $orderData
 * @param string $serviceKey
 * @param string $hashMethod
 *
 * @return string
 */
function createSignature($orderData, $serviceKey, $hashMethod)
{
    $data = prepareData($orderData);

    return hash($hashMethod, $data . $serviceKey);
}

/**
 * @param array  $data
 * @param string $prefix
 *
 * @return string
 */
function prepareData(
    $data,
    $prefix = ''
) {
    ksort($data);
    $hashData = [];
    foreach($data as $key => $value) {
       if($prefix) {
         $key = $prefix . '[' . $key . ']';
       }
       if(is_array($value)) {
         $hashData[] = prepareData($value, $key);
       } else {
         $hashData[] = $key . '=' . $value;
       }
    }

    return implode('&', $hashData);
}

$hashMethod = 'sha256';

$serviceKey = 'eAyhFLuHgwl5hu-32GM8QVlCVMWRU0dGjH1c';

$fields = [
 'merchantId' => '6yt3gjtm9p1odfgx8491',
  'serviceId' => '63f574ed-d90d-4abe-9cs1-39117584a7b',
  'amount' => '300',
  'currency' => 'PLN',
  'orderId' => '123',
  'orderDescription' => 'Example transaction',
  'customerFirstName' => 'John',
  'customerLastName' => 'Doe',
  'customerEmail' => 'johndoe@domain.com',
  'customerPhone' => '501501501',
  'urlSuccess' => 'https://your-shop.com/success',
  'urlFailure' => 'https://your-shop.com/failure',
  'urlReturn' => 'https://your-shop.com/return',
];
$result = createSignature($fields, $serviceKey, $hashMethod) . ';' . $hashMethod;
Dla podanego powyżej przykładu wartość zmiennej $result będzie miała następującą postać:

0dd0c7b26d2bb0ea0b87c1cb10d83ab54a2ce18f72c7be8ef1b4bb31ad7515c2;sha256
Język bramki płatności imoje (paywall)
Ważne: domyślnie bramka płatnicza imoje wykrywa język na podstawie ustawień przeglądarki. Takie zachowanie możliwe jest jedynie przy podstawowym adresie zapytania: https://paywall.imoje.pl/payment

Aby wymusić wyświetlanie bramki płatności imoje w konkretnym języku należy zmodyfikować podstawowy adres dodając w nim warość odpowiadającą danemu językowi:

https://paywall.imoje.pl/[lang]/payment
gdzie:

Parametr	Typ	Opis
lang	string(2)	Określa język komunikacji bramki płatniczej do Płatnika - paywall, maile oraz status
Dopuszczalne wartości: pl, en, cs, de, es, fr, it, lt, ru, sk, sl, uk, nl, hu, ro.
Przykład: dla języka angielskiego adres będzie miał postać: https://paywall.imoje.pl/en/payment

Wyświetlanie wybranych metod płatności na bramce
W imoje istnieje możliwość wyświetlenia tylko konkretnych metod płatności Płatnikowi. Do sandardowego zapytania tworzącego transakcję z punktu wykonanie transakcji należy dodać parametr visibleMethod z przynajmniej jedną z poniższych wartości:

Nazwa	Wartość parametru	Opis
Karty płatnicze	card	Płatność kartą: Visa, MasterCard
Portfele elektroniczne	wallet	Płatność portfelem elektronicznym: Apple Pay, Google Pay, Visa Mobile, PayPal
Przelew online	pbl	Płatność przelewem online
BLIK	blik	Płatność BLIK
Płatności odroczone	imoje_paylater	Płatności imoje płacę później: Twisto, PayPo, PragmaGO, Blik płacę później
Leaseing online	lease	Płatność ING Lease Now
Przelew tradycyjny	wt	Płatność przelewem tradycyjnym
imoje raty	imoje_installments	Płatność w ratach
Ważne! Dla poprawnego działania płatności PayPal nie należy usuwać adresów URL w webhookach. W przypadku zmian kluczy integracyjnych w PayPal, należy je również zaktualizować w panelu administracyjnym imoje.

Przykładowa struktura danych
$billing = [
    'firstName' => 'John',
    'lastName' => 'Doe',
    'company' => 'Nazwa firmy 1'
];

$shipping = [
    'firstName' => 'John',
    'lastName' => 'Doe',
    'postalCode' => '00-001'
];

$hashMethod = 'sha256';
$serviceKey = 'PIcMy86ssE5wuNHAuQn5zPKf6hCAwX3Oxvjw';

$fields = [
    'merchantId' => '6yt3gjtm9p7b8h9xsdqz',
    'serviceId' => '62f574ed-d4ad-4a7e-9981-89ed7284aaba',
    'amount' => '20000',
    'currency' => 'PLN',
    'orderId' => '12345',
    'orderDescription' => 'description',
    'customerFirstName' => 'John',
    'customerLastName' => 'Doe',
    'customerEmail' => 'email@example.com',
    'customerPhone' => '501501501',
    'urlSuccess' => 'https://domain.com/success',
    'urlFailure' => 'https://domain.com/failure',
    'urlReturn' => 'https://domain.com/return',
    'shipping' => $shipping,
    'billing' => $billing
];
Notyfikacje
Dla poprawnej konfiguracji wysyłki notyfikacji, należy wprowadzić odpowiedni adres url notyfikacji w panelu administracyjnym imoje.

Aby dodać adres należy po zalogowaniu się do panelu imoje przejść do zakładki Sklepy, później należy wybrać sklep w którym wykonywana jest integracja i kliknąć w Szczegóły. Następnie przejść do sekcji Dane do integracji i edytować pole Adres notyfikacji.

Notyﬁkacje są wysyłane z adresów IP z zakresów:
5.196.116.32/28,
51.195.95.0/28,
54.37.185.64/28,
54.37.185.80/28,
147.135.151.16/28

Notyfikacje wysyłane są na domyślne porty HTTP (80) i HTTPS (443).

W momencie zmiany statusu transakcji serwery imoje wysyłają powiadomienia na wskazany w panelu administracyjnym adres URL. Wymagane jest by serwer akceptanta (np. sklep) odpowiedział statusem 200 OK z body {"status":"ok"}, który będzie oznaczał poprawne odebranie i przetworzenie notyfikacji przez serwer akceptanta. Notyfikacje wysyłane są w następującym cyklu:

3 razy co 10 milisekund, następnie,

5 razy co 5 minut, następnie,

5 razy co 60 minut, następnie,

5 razy co 360 minut, następnie,

5 razy co 720 minut.

Jeśli serwer akceptanta zwróci status 200 OK, lub notyfikacja nie zostanie odebrana do czasu zakończenia trwania całego cyklu, serwery imoje zaprzestają powtórzeń wysyłki notyfikacji.

W przypadku otrzymania z serwerów imoje dwóch identycznych notyfikacji pierwszą należy obsłużyć zgodnie z punktem metoda weryfikacji podpisu notyfikacji, natomiast drugą (duplikat) należy zignorować.

Zawartość BODY notyfikacji
Notyfikacje wysyłane są jako obiekt JSON metodą POST i mają następującą postać:

{
    "transaction": {
        "id": "06138437-cae3-4d46-877d-e1b9d6e6c58f",
        "type": "sale",
        "status": "pending",
        "source": "api",
        "created": 1666339083,
        "modified": 1666339083,
        "notificationUrl": "https://qaz54.requestcatcher.com/",
        "serviceId": "a33f331b-23fc-42b0-9fd1-67f310028b46",
        "amount": 100,
        "currency": "PLN",
        "title": "",
        "orderId": "Zamowienie test",
        "paymentMethod": "pbl",
        "paymentMethodCode": "ipko"
    },
    "payment": {
        "id": "07980a69-a884-46f7-ad16-216c88a13b98",
        "title": "",
        "amount": 100,
        "status": "pending",
        "created": 1666339083,
        "orderId": "Zamowienie test",
        "currency": "PLN",
        "modified": 1666339083,
        "serviceId": "a33f331b-23fc-42b0-9fd1-67f310028b46",
        "notificationUrl": "https://qaz54.requestcatcher.com/"
    },
    "action": {
        "type": "redirect",
        "url": "https://sandbox.paywall.imoje.pl/sandbox/07980a69-a884-46f7-ad16-216c88a13b98",
        "method": "GET",
        "contentType": "",
        "contentBodyRaw": ""
    }
}
Notyfikacja może składać się z następujących obiektów:

transaction - zawiera informacje o transakcji jeśli została utworzona po wybraniu metody płatności przez płatnika

payment - zawiera informacje o utworzonym linku płatności

action - zawiera informacje na temat danych użytych do przekierowania na zewnętrzną stronę banku

Obiekt payment będzie jedynym wysłanym obiektem, gdy link płatności straci swój czas ważności lub zostanie ręcznie anulowany.

Parametry notyfikacji
Parametry dla obiektu transaction:

Parametr	Typ	Opis
id	string(36)	Identyfikator transakcji UUID v4
type	string	Typ transakcji, dopuszczalne wartości: sale, refund
status	string	Status transakcji, dopuszczalne wartości: new, pending, settled, cancelled, rejected
source	string	Źródło transakcji, dopuszczalne wartości: api, web
created	integer(10)	Data utworzenia transakcji
modified	integer(10)	Data modyfikacji transakcji
notificationUrl	varchar(300)	Adres notyfikacji
serviceId	string(36)	Identyfikator sklepu UUID v4
amount	integer(9)	Kwota transakcji, maksymalna wartość: 999999999
currency	string(3)	Waluta transakcji w standardzie ISO 4217
title	string(255)	Tytuł zamówienia, dopuszczalne znaki: A-Za-z0-9#&_-"',./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne)
orderId	string(100)	Numer zamówienia, dopuszczalne znaki: A-Za-z0-9#_-./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne)
paymentMethod	string	Metoda realizacji zamówienia, dokładna lista w punkcie Metody i kanały realizacji transakcji
paymentMethodCode	string	Oznaczenie kanału płatności, dokładna lista w punkcie Metody i kanały realizacji transakcji
statusCode	string(24)	Kod statusu zwracany do transakcji kartami
statusCodeDescription	string(113)	Opis kodu statusu zwracany do transakcji kartami
Parametry dla obiektu payment:

Parametr	Typ	Opis
id	string(36)	Identyfikator zamówienia UUID v4
title	string(255)	Tytuł zamówienia, dopuszczalne znaki: A-Za-z0-9#&_-"',./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne)
amount	integer(9)	Kwota zamówienia, maksymalna wartość: 999999999
status	string	Status zamówienia, dopuszczalne wartości: new, pending, settled, cancelled, rejected
created	integer(10)	Data utworzenia zamówienia
orderId	string(100)	Numer zamówienia, dopuszczalne znaki: A-Za-z0-9#_-./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne)
currency	string(3)	Waluta zamówienia w standardzie ISO 4217
modified	integer(10)	Data modyfikacji zamówienia
serviceId	string(36)	Identyfikator sklepu UUID v4
notificationUrl	varchar(300)	Adres notyfikacji
Parametry dla obiektu action:

Parametr	Typ	Opis
type	string	Typ przekierowania, dopuszczalne wartości: redirect, transfer
url	string(2083)	Adres przekierowania
method	string	Metoda przekierowania, dopuszczalne wartości: POST, GET
contentType	varchar(100)	Typ formatu danych
contentBodyRaw	text	Parametry przekierowania
ban	string(26)	Numer rachunku bankowego, zwracany dla metody płatności Przelew tradycyjny
Zawartość nagłówków notyfikacji
Dodatkowo w nagłówkach HTTP umieszczane są następujące parametry:

Accept: "text/plain",
User-Agent: "imoje",
Content-Type: "application/json; charset=UTF-8",
X-Imoje-Signature: "merchantid={merchantid};serviceid={serviceid};signature={signature};alg={alg}"
gdzie:

merchantid - identyfikator klienta

serviceid - identyfikator sklepu

signature - podpis notyfikacji

alg - algorytm funkcji skrótu, dopuszczalne wartości: sha224, sha256, sha384, sha512

Przykład nagłówka X-Imoje-Signature
X-Imoje-Signature: "merchantid=6yt3gjtm9p7b8h9xsdqz;serviceid=63f574ed-d4ad-407e-9981-39ed7584a7b7;signature=20cdc8646eb268ea754842bdf0db1df21a2cf0b1c6e3e16e74ef7f7cca8f5450;alg=sha256"
Metoda weryfikacji podpisu notyfikacji
Weryfikacja podpisu notyfikacji jest krytycznym elementem uwierzytelnienia informacji przesyłanych w pakiecie notyfikacji.

Nagłówek zawierający podpis notyfikacji ma postać:

X-Imoje-Signature: merchantid=[...];serviceid=[...];signature=[...];alg=[...]
Aby uwierzytelnić pochodzenie oraz zweryfikować integralność wiadomości powiadomienia należy wykonać następujące czynności:

Z nagłówków pakietu przychodzącego na adres notyfikacji należy pobrać zawartość X-IMoje-Signature,

Następnie należy pobrać wartość parametru signature oraz alg,

W zależności od algorytmu funkcji skrótu określonego w parametrze alg należy obliczyć odpowiednią funkcją skrót:

string incoming_signature = x_imoje_signature[signature]
string body = notification_body
string own_signature = hash(body + service_key, alg)
Obliczoną wartość own_signature należy porównać z wartością incoming_signature, która została pobrana z nagłówka,

Jeżeli wartości own_signature i incoming_signature są identyczne oznacza to, że wiadomość notyfikacji jest poprawna i pochodzi z zaufanego źródła.

Zmiany statusów transakcji należy dokonywać tylko gdy weryfikacja podpisu przebiegła poprawnie.

Przykład weryfikacji podpisu notyfikacji
W nagłówku otrzymujemy sygnaturę imoje:

X-Imoje-Signature: merchantid=mdy7zxvxudgarxbsou9n;serviceid=a33f331b-23fc-42b0-9fd1-67f310028b46;signature=b73321c9e8bcc414b8c08198db4084dafb1b4dc252f512ffe71b1fbce857fd23;alg=sha256
W treści pakietu notyfikacji otrzymujemy JSON:

{
    "transaction": {
        "id": "07938437-cae3-4d46-877d-e1b9d6e6c58f",
        "type": "sale",
        "status": "pending",
        "source": "api",
        "created": 1666339083,
        "modified": 1666339083,
        "notificationUrl": "https://qaz54.requestcatcher.com/",
        "serviceId": "a33f331b-23fc-42b0-9fd1-67f310028b46",
        "amount": 100,
        "currency": "PLN",
        "title": "",
        "orderId": "Zamowienie test",
        "paymentMethod": "pbl",
        "paymentMethodCode": "ipko"
    },
    "payment": {
        "id": "07980a69-a884-46f7-ad16-216c88a13b98",
        "title": "",
        "amount": 100,
        "status": "pending",
        "created": 1666339083,
        "orderId": "Zamowienie test",
        "currency": "PLN",
        "modified": 1666339083,
        "serviceId": "a33f331b-23fc-42b0-9fd1-67f310028b46",
        "notificationUrl": "https://qaz54.requestcatcher.com/"
    },
    "action": {
        "type": "redirect",
        "url": "https://sandbox.paywall.imoje.pl/sandbox/07980a69-a884-46f7-ad16-216c88a13b98",
        "method": "GET",
        "contentType": "",
        "contentBodyRaw": ""
    }
}
Obliczamy sygnaturę:

service_key:PIcMy86ssE5wuNHAuQn5zPKf6hCAwX3Oxvjw

own_signature = sha256(body + service_key)

own_signature:b73321c9e8bcc414b8c08198db4084dafb1b4dc252f512ffe71b1fbce857fd23

Porównujemy sygnaturę obliczoną z otrzymaną w nagłówku notyfikacji:

const crypto = require('crypto')
let body = "{...}";
let headerSignature = "b73321c9e8bcc414b8c08198db4084dafb1b4dc252f512ffe71b1fbce857fd23";
let serviceKey = "PIcMy86ssE5wuNHAuQn5zPKf6hCAwX3Oxvjw";
let mySignature = crypto.createHash("sha256").update(body + serviceKey).digest("hex");
if (mySignature === headerSignature) {
    // Notyfikacja zweryfikowana poprawnie. Przetwarzaj dalej.
} else {
    // Notyfikacja zweryfikowana negatywnie. Ignoruj notyfikację.
}
Wykonanie zwrotu
Podczas wykonywania wielu transakcji zwrotu jednocześnie, należy wprowadzić co najmniej 5-cio sekundowe opóźnienie pomiędzy kolejnymi transakcjami.

Ze względów bezpieczeństwa zwroty można wykonywać:

w przypadku BLIK maksymalnie do 12 miesięcy
dla imoje płacę później maksymalnie do 12 miesięcy
dla kart płatniczych do 3 lat
Masz pytanie? Zobacz nasze FAQ

Poprawne wykonanie zwrotu polega na wysłaniu żądania metodą POST na adres:

produkcja
https://api.imoje.pl/v1/merchant/{merchantId}/transaction/{transactionId}/refund
sandbox
https://sandbox.api.imoje.pl/v1/merchant/{merchantId}/transaction/{transactionId}/refund
gdzie:

merchantId - identyfikator klienta

transactionId - unikalny identyfikator dla każdej transakcji której dotyczy zwrot

W zawartości żądania należy wprowadzić:

{
  "type": "refund",
  "serviceId": "24737aab-a507-4feb-8248-3f42bfdbb006",
  "amount": 100
}
Parametr	Typ	Parametr wymagany	Opis
type	string	TAK	Typ akcji
serviceId	string(36)	TAK	Identyfikator sklepu jako UUID v4
amount	integer	TAK	Kwota zwrotu w najmniejszej jednostce waluty - grosze
title	string(255)	NIE	Tytuł zamówienia,
dopuszczalne znaki: A-Za-z0-9#&_-"',./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne)
W żądaniu powinny być również zawarte nagłówki:

Content-Type: application/json
Authorization: Bearer {token}
Metoda	Zawartość nagłówka
Token autoryzacyjny	Bearer {token}
Parametr token - to ciąg znaków dostępny w ustawieniach panelu administracyjnego imoje.

imoje płacę później
Płatności imoje płacę później nie wymagają odrębnej integracji. Aby rozpocząć płatność imoje płacę póżniej, należy wykonać standardową transakcję według punktu Wykonanie transakcji.

Użycie dodatkowo parametru visibleMethod z wartością imoje_paylater spowoduje wyświetlenie tylko imoje płacę później na bramce. Takie działanie daje możliwość na wyodrębnienie danej metody jako osobnej na podsumowaniu.

Masz pytanie? Zobacz nasze FAQ

Płatności oneclick - widżet
Widżet dla środowiska testowego (sandbox) znajduje się pod adresem: https://sandbox.paywall.imoje.pl/js/widget.min.js

Masz pytanie? Zobacz nasze FAQ

Metoda integracji przez widżet pozwala na zintegrowanie płatności kartą płatniczą z poziomu sklepu. W takim przypadku nie jest wymagane przekierowanie na bramkę płatności. Aby zastosować tę metodę należy osadzić skrypt JavaScript:

<script
    src="https://paywall.imoje.pl/js/widget.min.js"
    id="imoje-widget__script"

    data-merchant-id="6yt3gjtm9p1odfgx8491"
    data-service-id="63f574ed-d90d-4abe-9cs1-39117584a7b"
    data-amount="200"
    data-currency="PLN"
    data-order-id="123"
    data-customer-id="123"
    data-customer-first-name="John"
    data-customer-last-name="Doe"
    data-customer-email="johndoe@domain.com"
    data-signature="5d8b909fd777f1e2a4bbf9af8a9dca248c4fe9b14ae70610d051e29358cb62b1;sha256">
</script>
gdzie

src - adres URL do skryptu widget.min.js

id - ID skryptu. Zawsze musi mieć wartość imoje-widget__script

Powyższych parametrów src,id należy nie uwzględniać przy wyliczaniu sygnatury.

Parametry wymagane:

data-merchant-id - identyfikator klienta

data-service-id - identyfikator sklepu klienta

data-amount - kwota transakcji podana w groszach

data-currency - waluta

data-order-id - ID zamówienia, dopuszczalne znaki: A-Za-z0-9#_-./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne)

data-customer-id - ID płatnika, dopuszczalne znaki: A-Za-z0-9_-

data-customer-first-name - imię osoby składającej zamówienie, dopuszczalne znaki: A-Za-z0-9-,. oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), 0400 - 04FF (cyrylica)

data-customer-last-name - nazwisko osoby składającej zamówienie, dopuszczalne znaki: A-Za-z0-9-,. oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), 0400 - 04FF (cyrylica)

data-customer-email - adres e-mail w formacie zgodnym ze standardem RFC 5322 oraz RFC 6531

data-signature - wyliczona sygnatura

Parametry opcjonalne:

data-customer-phone - numer telefonu osoby składającej zamówienie, dopuszczalne znaki: -+0-9 oraz spacja. Wartość parametru zawierać może maksymalnie 20 znaków

data-order-description - tytuł transakcji, dopuszczalne znaki: A-Za-z0-9#&_-,./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne)

data-url-success - adres URL, na który użytkownik będzie przekierowany po pomyślnie zakończonej transakcji

data-url-failure - adres URL, na który użytkownik będzie przekierowany po błędnie dokonanej transakcji

data-url-return - adres URL, na który użytkownik będzie przekierowany po dokonaniu transakcji

data-url-cancel - adres URL, na który użytkownik będzie przekierowany po naciśnięciu przycisku Anuluj

data-widget-type - oznaczenie typu płatności Dopuszczalne wartości:

oneclick - (wartość domyślna) tworzy profil płatnika pozwalający na płatność bez autoryzacji
recurring - tworzy profil płatnika, który będzie obciążany okresowo, na tą samą kwotę
ecom3ds - standardowa płatność kartą, nie tworzy profilu kartowego
data-valid-to - data ważności linku płatności jako timestamp w sekundach, jeżeli nie jest przekazane to link ważny jest zawsze

data-invoice - zakodowane dane do faktury, konieczne podczas korzystania z usługi ING Księgowość. Dane należy zakodować zgodnie z instrukcją opisaną tutaj

data-multipayout - dane określające odbiorcę płatności dla funkcji multiwypłat, gdzie:

ban - numer konta bankowego
amount - kwota transakcji podana w groszach
label - nazwa odbiorcy (max 35 znaków), dopuszczalne znaki: A-Za-z0-9-,. oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne),
title - tytuł przelewu (max 105 znaków), dopuszczalne znaki: A-Za-z0-9#&_-,./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), parametr opcjonalny. Jego obecność powoduje wyodrębnienie danej transakcji na koncie odbiorcy. Podanie parametru dla jednego elementu warunkuje konieczność dostarczenia go dla pozostałych.
Przykładowa struktura parametru data-multipayout powinna wyglądać w następujący sposób:

data-multipayout=[{"ban":"39109024028943913168514519","label":"Test1","amount":100},{"ban":"72105000028166973380325415","label":"Test2","amount":100}]
Parametry konfiguracyjne - nie należy ich uwzględniać przy wyliczaniu sygnatury:

data-locale - dwuznakowy kod języka.
Dopuszczalne wartości: pl, en, cs, de, es, fr, it, lt, ru, sk, sl, uk, nl, hu, ro, bg, sv. Domyślnie pl, gdy zostanie przekazana nieznana wartość to wyświetli en.

data-inline - jeżeli jest ustawione na true to istnieje możliwość aby iframe był osadzony w elemencie o identyfikatorze imoje-widget__wrapper (element o takim identyfikatorze musi istnieć). Jeżeli tego parametru nie ma lub jest ustawiony na false wtedy iframe będzie wyświetlony na cały ekran,

data-element-id - wskazanie identyfikatora elementu który ma być interaktywny z widżetem, domyślnie jest false,

data-element-event - wskazanie jaki event ma rozpocząć interakcję z widżetem, domyślnie jest click.

Wyliczanie sygnatury
Nazwy parametrów do wyliczenia sygnatury należy zamienić zgodnie z przykładem:

parametr data-order-id na orderId.
Sygnaturę należy wyliczyć w taki sam sposób jak jest to opisane w punkcie wyliczanie sygnatury

Otrzymanie profilu klienta
Dla każdej płatności metodą oneclick/recurring w notyfikacji wysyłany jest profil instrumentu płatniczego. Profil ten jest identyfikowany za pomocą parametru data-customer-id.

Należy pamiętać, że każdy instrument płatniczy powinien mieć swoją unikalną wartość tego parametru.

Notyfikacja z uwzględnionym profilem instrumentu płatniczego (np. karty płatniczej) ma strukturę notyfikacji przy zwykłej płatności wzbogaconą o dodatkowe pole statusCode, statusCodeDescription oraz sekcje profile. Parametr status jest polem kluczowym świadczącym o wyniku obiążenia profilu. Pozostałe statusy - statusCode oraz statusCodeDescription są przesyłane informacyjnie.

{
    "payment": {
        "id": "ce30e112-2272-4238-9312-1b3d5efca1f2",
        "title": "test1",
        "amount": 200,
        "status": "settled",
        "created": 1657206612,
        "orderId": "123",
        "currency": "PLN",
        "modified": 1657206635,
        "serviceId": "eb751aad-c300-4d9a-b677-7efc31ef7ab6",
        "notificationUrl": "https://sklep.com/notyfikacje"
    },
    "transaction": {
        "amount": 200,
        "created": 1657206632,
        "currency": "PLN",
        "id": "570dd3cd-cf91-45a4-9ab7-caedfb713e6a",
        "modified": 1657206635,
        "notificationUrl": "https://sklep.com/notyfikacje",
        "orderId": "123",
        "paymentMethod": "card",
        "paymentMethodCode": "recurring",
        "paymentProfile": {
            "id": "19bbd89c-8f49-4020-8bfc-7472dac828c2",
            "year": "2029",
            "month": "12",
            "profile": "RECURRING",
            "isActive": 1,
            "lastName": "Kowalski",
            "firstName": "Jan",
            "merchantMid": "24vmh3tzmcfguuf4m987",
            "maskedNumber": "****0567",
            "organization": "VISA",
            "merchantCustomerId": "14"
        },
        "serviceId": "eb751aad-c300-4d9a-b677-7efc61ef5cb4",
        "source": "web",
        "status": "settled",
        "statusCode": "CODE_000",
        "statusCodeDescription": "CODE_000 - OK",
        "title": "test1",
        "type": "sale"
    }
}
gdzie:

statusCode - kod odpowiedzi od dostawcy. W przypadku braku kodu zwracana zostaje wartość bezpośrednio od dostawcy

statusCodeDescription - opis błędu. W przypadku braku kodu zwracana jest pusta wartość

obiekt paymentProfile:

id - identyfikator profilu
merchantMid - identyfikator klienta
merchantCustomerId - identyfikator płatnika, dopuszczalne znaki: A-Za-z0-9_-
firstName - imię posiadacza instrumentu płatniczego na który jest zarejestrowany profil
lastName - nazwisko posiadacza instrumentu płatniczego na który jest zarejestrowany profil
maskedNumber - cztery gwiazdki oraz ostatnie cztery cyfry instrumentu płatniczego
month - data ważności karty: miesiąc
year - data ważności karty: rok
organization - organizacja płatnicza która wydała zarejestrowaną kartę
isActive - aktywność profilu: 1 - aktywna, 0 - nieaktywna
profile - rodzaj profilu
W przypadku próby obciążenia nieaktywnego profilu odpowiedź będzie wyglądać:

{
    "apiErrorResponse": {
        "code": "TRX-ERROR-120301",
        "message": "Payment profile inactive.",
        "instance": {
            "serviceId": "6879ff96-3efa-4ea2-b193-59401da40f18",
            "paymentProfileId": "d6a5bd6c-8e9c-496e-beb2-f0ca08215645",
            "amount": 100,
            "currency": "PLN",
            "orderId": "2171ef23-828e-47e1-a3f6-80fdd4030863"
        },
        "errors": []
    }
}
5.2.1. Kody odpowiedzi dostawcy
StatusCode	StatusCodeDescription	Opis
INT_CREDIT_CARD_DISABLED	INT_CREDIT_CARD_DISABLED	Płatność niedostępna dla kart kredytowych
CODE_000	CODE_000 - OK	Płatność zaakceptowana
CODE_01	CODE_01 - Refer to card issuer	Skontaktuj się z wystawcą karty
CODE_02	CODE_02 - Refer to card issuer, special condition	Błąd wystawcy karty, skontaktuj się z wystawcą karty
CODE_03	CODE_03 - Invalid merchant or service provider	Błąd konfiguracji sklepu
CODE_04	CODE_04 - Pickup card	Zatrzymaj kartę
CODE_05	CODE_05 - Do not honor	Odmowa banku, skontaktuj się z wystawcą karty
CODE_06	CODE_06 - General error	Błąd
CODE_07	CODE_07 - Pick up card, special condition (fraud account)	Zatrzymaj kartę, próba oszustwa
CODE_08	CODE_08 - Honor with ID	Karta obsługiwana jedynie z dowodem osobistym
CODE_10	CODE_10 - Partial approval	Częściowe zatwierdzenie
CODE_11	CODE_11 - Approved (V.I.P)	Płatność zaakceptowana
CODE_12	CODE_12 - Invalid transaction	Nieprawidłowa transakcja
CODE_13	CODE_13 - Invalid amount	Limit dla transakcji internetowych został przekroczony
CODE_14	CODE_14 - Invalid account number (no such number)	Nieprawidłowy numer konta (nie ma takiego rachunku)
CODE_15	CODE_15 - Invalid issuer/No such issuer (first 8 digits of account number do not relate to an issuing identifier)	Nie ma takiego wydawcy
CODE_19	CODE_19 - Re-enter transaction	Wprowadź transakcję ponownie
CODE_30	CODE_30 - Message format error	Błąd formatu wiadomości
CODE_33	CODE_33 - Expired Card - Pick Up	Karta utraciła ważność - karta zgubiona albo zgłoszona
CODE_39	CODE_39 - No credit account	Brak rachunku karty kredytowej
CODE_41	CODE_41 - Lost card, pick up (fraud account)	Karta złoszona jako zagubiona
CODE_43	CODE_43 - Pickup card (stolen card)	Karta zgloszona jako skradziona
CODE_51	CODE_51 - Insufficient funds	Brak środków na karcie
CODE_52	CODE_52 - No checking account	Brak rachunku karty kredytowej
CODE_53	CODE_53 - No savings account	Brak rachunku karty
CODE_54	CODE_54 - Expired card	Karta wygasła lub Płacący podał niepoprawne daty ważności karty.
CODE_56	CODE_56 - No Card Record	Brak zapisu karty
CODE_57	CODE_57 - Card disabled for e-commerce or cross-border transactions	Karta wyłączona dla e-commerce lub transakcji transgranicznych
CODE_59	CODE_59 - Suspected fraud	Podejrzenie oszustwa
CODE_61	CODE_61 - Exceeds approval amount	Przekroczony limit karty
CODE_62	CODE_62 - Restricted card / Country exclusion table	Ograniczenie karty ( karta nieważna w tym regionie lub kraju)
CODE_63	CODE_63 - Security violation (source is not correct issuer)	Naruszenie bezpieczeństwa
CODE_64	CODE_64 - Transaction does not fulfill AML requirement	Transakcja nie spełnia wymogu AML
CODE_65	CODE_65 - Exceeds withdrawal frequency limit	Przekroczenie limitu ilości transakcji
CODE_75	CODE_75 - Allowable number of PIN-entry tries exceeded	Przekroczono dopuszczalną liczbę prób wprowadzenia kodu PIN
CODE_83	CODE_83 - Fraud/Security (Mastercard use only)	Oszustwo/bezpieczeństwo (tylko do użytku Mastercard)
CODE_90	CODE_90 - Destination not available	Miejsce docelowe niedostępne
CODE_93	CODE_93 - Card disabled for e-commerce transactions	Karta wyłączona dla transakcji e-commerce
CODE_99	CODE_99 - Authorization error – default	Błąd autoryzacji
CODE_114	CODE_114 - No account of type requested	Brak żądanego konta typu
CODE_570	CODE_570 - 3D Secure authentication failed	Uwierzytelnianie 3D Secure nie powiodło się
CODE_581	CODE_581 - Exceeded limit of unsuccessful transaction attempts for the specified card	Przekroczony limit nieudanych prób transakcji dla określonej karty
CODE_AC	CODE_AC - Account closed (do not try again)	Konto zamknięte (nie próbuj ponownie)
CODE_N0	CODE_N0 - Unable to authorize / Force STIP	Niepowodzenie autoryzacji karty
CODE_N8	CODE_N8 - Transaction amount exceeds preauthorized approval amount	Zbyt wysoka kwota transakcji
CODE_P1	CODE_P1 - Over daily limit (try again later)	Przekroczono dzienny limit
CODE_P9	CODE_P9 - Enter lesser amount	Wprowadź mniejszą kwotę
CODE_PF	CODE_PF - Possible fraud (do not try again)	Podejrzenie oszustwa (nie próbuj ponownie)
CODE_Q1	CODE_Q1 - Card Authentication failed	Niepowodzenie autoryzacji karty
CODE_SD	CODE_SD - Soft decline (strong authentication required)	Miękkie odrzucenie (wymagane silne uwierzytelnienie)
CODE_T3	CODE_T3 - Card not supported	Karta nie obsługiwana
CODE_T5	CODE_T5 - Card inactive or closed (updated information needed)	Karta nieaktywna lub zamknięta (potrzeba zaktualizować informacje)
CODE_T8	CODE_T8 - Invalid account	Nieważne konto
CODE_Z3	CODE_Z3 - Unable to go online	Błąd komunikacji z wydawcą
5.2.2. Kody odpowiedzi dostawcy - sandbox
W środowisku testowym sandbox możliwa jest symulacja zwracanego kodu poprzez ustawienie odpowiedniej kwoty wraz z wybraną kartą zwracającą status rejected (odrzucona)

StatusCode	StatusCodeDescription	Opis
CODE_05	CODE_05 - Do not honor	Domyślny kod odpowiedzi dla transakcji odrzuconych
CODE_51	CODE_51 - Insufficient funds	Kod zwracany dla transakcji odrzuconej na kwote 1 zł
Obciążanie istniejącego profilu
Profil kartowy możesz obciążyć tylko za pomocą odpowiedniego zapytania HTTP w ramach integracji RESTful API.

Szczegółowy opis obciążenia znajdziesz tutaj.

imoje raty
W ramach tej metody płatności możliwe jest rozłożenie przez płatnika kwoty zamówienia na raty.

WAŻNE! imoje raty są dostępne tylko dla klientów indywidualnych Twojego sklepu.

Dostępne są dwie opcje rat:

do 60 rat, RRSO zmienne, zależne od ilości rat

do 10 rat, RRSO 0%

Minimalna kwota wymagana do skorzystania z imoje raty to 300 PLN, a maksymalna to 50000 PLN.

imoje raty wyświetlą się domyślnie wraz z innymi metodami płatności. Jeśli korzystasz z tablicy visibleMethod to należy dodać wartość imoje_installments.

Masz pytanie? Zobacz nasze FAQ

Utworzenie transakcji z imoje raty
imoje raty wyświetlą się domyślnie wraz z innymi metodami płatności. Jeśli korzystasz z tablicy visibleMethod to należy dodać wartość imoje_installments.

Przykład zapytania:
<input type="hidden" value="63f574ed-d90d-4abe-9cs1-39117584a7b7" name="serviceId">
<input type="hidden" value="6yt3gjtm9p1odfgx8491" name="merchantId">
<input type="hidden" value="5000000" name="amount">
<input type="hidden" value="PLN" name="currency">
<input type="hidden" value="imoje raty" name="orderId">
<input type="hidden" value="imoje raty" name="orderDescription">
<input type="hidden" value="John" name="customerFirstName">
<input type="hidden" value="Doe" name="customerLastName">
<input type="hidden" value="johndoe@domain.com" name="customerEmail">
<input type="hidden" value="501501501" name="customerPhone">
<input type="hidden" value="https://your-shop.com/success" name="urlSuccess">
<input type="hidden" value="https://your-shop.com/failure" name="urlFailure">
<input type="hidden" value="https://your-shop.com/return" name="urlReturn">
<input type="hidden" value="imoje_installments" name="visibleMethod">
<input type="hidden" value="cd5024f5ce5e6ff47990fe60572758fbcbcd6e3c04895d6815932b2d14e04ffd;sha256" name="signature">
Kalkulator imoje raty - widżet
Widżet imoje raty pozwala na wyświetlenie na podsumowaniu sklepu kalkulatora rat, za pomocą którego Płatnik może wstępnie ustalić ile wyniosą raty dla wybranego okresu. Wstępne ustawienie ilości rat można pobrać z kalkulatora i przekazać następnie w zapytaniu tworzącym transakcję.

W celu wywołania kalkulatora należy wykorzystać odpowiedni skrypt JavaScript i wywołać go w obiekcie o id imoje-installments__wrapper

Adresy URL widżetu
PRODUKCJA: https://paywall.imoje.pl/js/installments.js

SANDBOX: https://sandbox.paywall.imoje.pl/js/installments.js

ID skryptu
imoje-installments__script

Parametry Wymagane
Parametr	Opis
merchantId	Identyfikator klienta
serviceId	Identyfikator sklepu klienta jako UUID v4
amount	Kwota transakcji w najmniejszej jednostce waluty np. grosze.
Minimalna wartość: 30000
Maksymalna wartość: 5000000
currency	Waluta transakcji w standardzie ISO 4217, dopuszczalna wartość: PLN
signature	Wyliczona sygnatura
Przykład wywołania skryptu
    (function () {
      const form = document.getElementById('form');

      function onSubmit(event) {
        event.preventDefault();

        let script = document.getElementById('imoje-installments__script');
        if (!script) {
          script = document.createElement('script');
          script.id = 'imoje-installments__script';
          script.src = 'https://paywall.imoje.pl/js/installments.js';
          script.onload = () => onSubmit(event);
          document.body.appendChild(script);
          return;
        }

        const options = {
          merchantId: "Twój identyfikator Klienta",
          serviceId: "Twój identyfikator sklepu",
          amount: "Kwota zamówienia",
          currency: "PLN",
          signature: "Wyliczona sygnatura"
        };

        document.getElementById('imoje-installments__wrapper').imojeInstallments(options);
      }

      form.addEventListener('submit', onSubmit);
    })();
Pobranie ustawień z kalkulatora
W zależności od wybranego na kalkulatorze kanału imoje raty oraz ilości rat, widżet za każdym razem tworzy nowe wydarzenie, na podstawie którego można pobrać wartości i przekazać je w zapytaniu tworzącym transakcję.

Przykład pobrania danych
    window.addEventListener('message', function (data) {
        if (data.data.channel && data.data.period) {
            var channel = data.data.channel;
            var period = data.data.period;
        }
    }, false);
Zwroty do imoje raty
W przypadku tej metody płatności to dostawca decyduje w jakiej wysokości można wykonać zwrot do danej transakcji.

W celu pobrania informacji o maksymalnej kwocie zwrotu pełnego i częściowego należy skorzystać z zapytania w punkcie Pobieranie informacji o możliwości dokonania zwrotu

Przelewy tradycyjne Split Payment
Płatności Split Payment polegają na rozdzieleniu kwoty przelewu tradycyjnego na kwotę netto i podatek VAT, które trafiają oddzielnie na dedykowane numery rachunków. Ten typ płatności dotyczy tylko podatników VAT.

W celu skorzystania z płatności Split Payment należy do zapytania dołączyć obiekt invoice wraz z parametrami invoiceId (numer faktury) oraz taxAmount (wysokość podatku). Dokładny opis obiektu invoice znajdziesz poniżej.

Masz pytanie? Zobacz nasze FAQ

Utworzenie transakcji Split Payment
Do podstawowego zapytania tworzącego transakcję zgodnie z opisem punktu wykonanie transakcji należy załączyć obiekt invoice. Obiekt ten składa się z obiektu buyer oraz tablicy positions z następujacymi parametrami:

Obiekt buyer:

Parametr	Typ	Parametr wymagany	Opis
invoiceId	string	TAK	Numer faktury
type	string	TAK	Przyjmuje wartość PERSON (odbiorca indywidualny) lub COMPANY (firma)
email	string(200)	TAK	Adres e-mail w formacie zgodnym ze standardem RFC 5322 oraz RFC 6531
fullName	string(200)	TAK	Imię i nazwisko nabywcy/nazwa firmy,
dopuszczalne znaki: A-Za-z0-9#_-./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), 0400 - 04FF (cyrylica)
street	string(200)	TAK	Ulica
city	string(100)	TAK	Miasto
postalCode	string(30)	TAK	Kod pocztowy
countryCodeAlpha2	string(2)	TAK	Kod kraju Alpha2
idCountryCodeAlpha2	string(2)	NIE	Identyfikator kodu kraju Alpha2. Wymagane dla wartości VAT_ID parametru idType
idType	string	NIE	Typ numeru identyfikacyjnego. Wymagane dla wartości COMPANY parametru type. Przyjmuje wartość ID (PESEL) lub VAT_ID (NIP)
idNumber	string(30)	NIE	NIP lub numer PESEL. Wymagane w przypadku wartości COMPANY dla parametru type
Tablica positions:

Parametr	Typ	Parametr wymagany	Opis
name	string	TAK	Nazwa produktu
code	string	TAK	Kod produktu
quantity	number	TAK	Ilość. Minimalna wartość to 0
unit	string	TAK	Jednostka
grossAmount	integer	TAK	Wartość jednostkowa brutto
taxStake	string lub number	TAK	Stawka podatku. Dostępne wartości: TAX_23, TAX_22, TAX_8, TAX_7, TAX_5, TAX_3, TAX_0, TAX_EXEMPT, TAX_NOT_LIABLE, TAX_REVERSE_CHARGE, TAX_EXCLUDING. Typ string dla TAX_23 lub numeryczny dla 23.
taxAmount	integer	TAK	Wartość podatku w groszach
discountAmount	integer	NIE	Wartość upustu
Przykładowa struktura danych
$invoiceData = [
    "invoiceId" => "04/12/23",
    "buyer"     => [
        "type"                => "COMPANY",
        "idType"              => "VAT_ID",
        "idNumber"            => "5354235387",
        "email"               => "nazwafirmy@example.com",
        "fullName"            => "Nazwa firmy",
        "street"              => "Ulica",
        "city"                => "Miasto",
        "postalCode"          => "12-345",
        "countryCodeAlpha2"   => "PL",
        "idCountryCodeAlpha2" => "PL"
    ],
    "positions" => [
        [
            "name"        => "Produkt",
            "code"        => "produkt-01",
            "quantity"    => 1,
            "unit"        => "Sztuki",
            "taxStake"    => "TAX_23",
            "grossAmount" => 12300,
            "taxAmount" =>  2300
        ],
    ],
];
Powyższe parametry należy uwzględnić podczas wyliczania sygnatury zgodnie z punktem wyliczanie sygnatury

Przygotowanie obiektu invoice
Za pomocą funkcji PHP
Dane zebrane z powyższych parametrów należy zakodować za pomocą funkcji: base64_encode(gzencode(json_encode($invoiceData), 5));

gdzie:

$invoiceData - przygotowane wcześniej parametry według struktury z punktu przykladowa struktura danych

$invoiceData = [
    "invoiceId" => "04/12/23",
    "buyer"     => [
        "type"                => "COMPANY",
        "idType"              => "VAT_ID",
        "idNumber"            => "5354235387",
        "email"               => "nazwafirmy@example.com",
        "fullName"            => "Nazwa firmy",
        "street"              => "Ulica",
        "city"                => "Miasto",
        "postalCode"          => "12-345",
        "countryCodeAlpha2"   => "PL",
        "idCountryCodeAlpha2" => "PL"
    ],
    "positions" => [
        [
            "name"        => "Produkt",
            "code"        => "produkt-01",
            "quantity"    => 1,
            "unit"        => "Sztuki",
            "taxStake"    => "TAX_23",
            "grossAmount" => 12300,
            "taxAmount" =>  2300
        ],
    ],
];
$invoice = base64_encode(gzencode(json_encode($invoiceData), 5));

$fields = [
    'serviceId' => '63f574ed-d90d-4abe-9cs1-39117584a7b7',
    'merchantId' => '6yt3gjtm9p1odfgx8491',
    'amount' => '12300',
    'currency' => 'PLN',
    'orderId' => 'Split payment',
    'orderDescription' => 'Split payment',
    'customerFirstName' => 'Jan',
    'customerLastName' => 'Kowalski',
    'customerEmail' => 'jan.kowalski@example.com',
    'customerPhone' => '501501501',
    'visibleMethod' => 'wt',
    'urlSuccess' => 'https://domain.com/success',
    'urlFailure' => 'https://domain.com/failure',
    'urlReturn' => 'https://domain.com/return',
    'invoice' => $invoice,
];
$serviceKey = 'eAyhFLuHgwl5hu-32GM8QVlCVMWRU0dGjH1c';
$hashMethod = 'sha256';
$signature= createSignature(
    $fields,
    $serviceKey,
    $hashMethod
) . ';' . $hashMethod;
Przykład zakodowanego obiektu invoice
Przykładowa zawartość obiektu invoice po użyciu funkcji kodowania

H4sIAAAAAAAACm2QXU+DMBSG/4rp9eaAQjRcSfBmiUOSodE4s3TQaUM/EE51jPDfPe3inZfneT/6phMR+tuImq8bkpIg3q3CaLeKKFmQgx15T9KJwNhxFPPHTZkVr6iIprqg56zar+89Kaw6ODtJaBJHNKG3N8i5YkIi1Oz8w46iV+MdPzHVSX5dG4WGo5WyYMqVFc5z5U0oDNBzDoifpKgZglrAiOdGsAEM3p0ZgMncNC4bRksaJ85lrIZ+dDiT3SeLUCwf/ML8f2n2VQKE0QNJ3ybc6ueUvWlsC77Tv9FdwDIIkX1ZpsEvChfEauGWbs9gW4EisNMWWOtCVfay97/50ZthyJTbgJmIBoH3/REH5vf5FyK2JcWPAQAA
Przykładowa zawartość formularza
<input type="hidden" value="63f574ed-d90d-4abe-9cs1-39117584a7b7" name="serviceId">
<input type="hidden" value="6yt3gjtm9p1odfgx8491" name="merchantId">
<input type="hidden" value="12300" name="amount">
<input type="hidden" value="PLN" name="currency">
<input type="hidden" value="Split payment" name="orderId">
<input type="hidden" value="Split payment" name="orderDescription">
<input type="hidden" value="Jan" name="customerFirstName">
<input type="hidden" value="Kowalski" name="customerLastName">
<input type="hidden" value="jan.kowalski@example.com" name="customerEmail">
<input type="hidden" value="501501501" name="customerPhone">
<input type="hidden" value="wt" name="visibleMethod">
<input type="hidden" value="https://domain.com/success" name="urlSuccess">
<input type="hidden" value="https://domain.com/failure" name="urlFailure">
<input type="hidden" value="https://domain.com/return" name="urlReturn">
<input type="hidden" value="<?= $invoice ?>" name="invoice">
Multiwypłaty
Opcja dostępna w przypadku włączonej funkcji multiwypłaty. Do podstawowego zapytania należy załączyć dodatkową tablicę multipayout z następującymi parametrami:

Parametr	Typ	Parametr wymagany	Opis
ban	string	TAK	Numer konta bankowego
amount	integer	TAK	Kwota transakcji w najmniejszej jednostce waluty np. grosze
label	string(70)	TAK	Nazwa odbiorcy, dopuszczalne znaki: A-Za-z0-9-"',. oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne)
title	string(105)	NIE	Tytuł przelewu, dopuszczalne znaki: A-Za-z0-9#&_-"',./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne).
Jego obecność powoduje wyodrębnienie danej transakcji na koncie odbiorcy. Podanie parametru dla jednego elementu warunkuje konieczność dostarczenia go dla pozostałych
Każda wypłata zawarta w formularzu poniżej powinna zawierać kolejne indexy numerowane od 0.

Przykładowa zawartość formularza:

<input type="hidden" value="63f574ed-d90d-4abe-9cs1-39117584a7b7" name="serviceId">
<input type="hidden" value="6yt3gjtm9p1odfgx8491" name="merchantId">
<input type="hidden" value="300" name="amount">
<input type="hidden" value="PLN" name="currency">
<input type="hidden" value="123" name="orderId">
<input type="hidden" value="Example transaction" name="orderDescription">
<input type="hidden" value="John" name="customerFirstName">
<input type="hidden" value="Doe" name="customerLastName">
<input type="hidden" value="johndoe@domain.com" name="customerEmail">
<input type="hidden" value="501501501" name="customerPhone">
<input type="hidden" value="https://your-shop.com/success" name="urlSuccess">
<input type="hidden" value="https://your-shop.com/failure" name="urlFailure">
<input type="hidden" value="https://your-shop.com/return" name="urlReturn">
<input type="hidden" value="card,pbl" name="visibleMethod">
<input type="hidden" value="72105000028166973380325415" name="multipayout[0][ban]">
<input type="hidden" value="100" name="multipayout[0][amount]">
<input type="hidden" value="Nazwa firmy 0" name="multipayout[0][label]">
<input type="hidden" value="58105000025503268251444948" name="multipayout[1][ban]">
<input type="hidden" value="200" name="multipayout[1][amount]">
<input type="hidden" value="Nazwa firmy 1" name="multipayout[1][label]">
<input type="hidden" value="1a466af99a18c4691576bbbf5b935e2ac082285ae28a88f8686ac3317836a6f5;sha256" name="signature">
Przykładowa struktura danych
$fields = [
    'merchantId' => '6yt3gjtm9p1odfgx8491',
    'serviceId' => '63f574ed-d90d-4abe-9cs1-39117584a7b',
    'amount' => '300',
    'currency' => 'PLN',
    'orderId' => '123',
    'orderDescription' => 'Example transaction',
    'customerFirstName' => 'John',
    'customerLastName' => 'Doe',
    'customerEmail' => 'johndoe@domain.com',
    'customerPhone' => '501501501',
    'urlSuccess' => 'https://your-shop.com/success',
    'urlFailure' => 'https://your-shop.com/failure',
    'urlReturn' => 'https://your-shop.com/return',
    'multipayout' => [
        [
        'ban' => '72105000028166973380325415',
        'amount' => '100',
        'label' => 'Nazwa firmy 0',
        ],
        [
        'ban' => '58105000025503268251444948',
        'amount' => '200',
        'label' => 'Nazwa firmy 1',
        ],
    ],
];
Powyższe parametry należy uwzględnić podczas wyliczania sygnatury zgodnie z punktem wyliczanie sygnatury

Masz pytanie? Zobacz nasze FAQ

ING Księgowość
Opcja dostępna w przypadku włączonej usługi ING Księgowość. Do podstawowego zapytania tworzącego transakcję zgodnie z opisem punktu wykonanie transakcji należy załączyć obiekt invoice. Obiekt ten składa się z obiektu buyer oraz tablicy positions z następujacymi parametrami:

Obiekt buyer:

Parametr	Typ	Parametr wymagany	Opis
type	string	TAK	Przyjmuje wartość PERSON (odbiorca indywidualny) lub COMPANY (firma)
email	string(200)	TAK	Adres e-mail w formacie zgodnym ze standardem RFC 5322 oraz RFC 6531
fullName	string(200)	TAK	Imię i nazwisko nabywcy/nazwa firmy,
dopuszczalne znaki: A-Za-z0-9#_-./ oraz znak spacji(0x20) i znaki z zakresu UNICODE 00C0 - 02C0 (m.in. polskie znaki diakrytyczne), 0400 - 04FF (cyrylica)
street	string(200)	TAK	Ulica
city	string(100)	TAK	Miasto
postalCode	string(30)	TAK	Kod pocztowy
countryCodeAlpha2	string(2)	TAK	Kod kraju Alpha2
idCountryCodeAlpha2	string(2)	NIE	Identyfikator kodu kraju Alpha2. Wymagane dla wartości VAT_ID parametru idType
idType	string	NIE	Typ numeru identyfikacyjnego. Wymagane dla wartości COMPANY parametru type. Przyjmuje wartość ID (PESEL) lub VAT_ID (NIP)
idNumber	string(30)	NIE	NIP lub numer PESEL. Wymagane w przypadku wartości COMPANY dla parametru type
Tablica positions:

Parametr	Typ	Parametr wymagany	Opis
name	string	TAK	Nazwa produktu
code	string	TAK	Kod produktu
quantity	number	TAK	Ilość. Minimalna wartość to 0
unit	string	TAK	Jednostka
grossAmount	integer	TAK	Wartość jednostkowa brutto
taxStake	string lub number	TAK	Stawka podatku. Dostępne wartości: TAX_23, TAX_22, TAX_8, TAX_7, TAX_5, TAX_3, TAX_0, TAX_EXEMPT, TAX_NOT_LIABLE, TAX_REVERSE_CHARGE, TAX_EXCLUDING. Typ string dla TAX_23 lub numeryczny dla 23.
discountAmount	integer	NIE	Wartość upustu
W przypadku zwolnienia z podatku, odpowiednie dane należy przekazać w zapytaniu, korzystając z obiektu basisForVatExemption z parametrami:

Parametr	Typ	Parametr wymagany	Opis
type	string	NIE	Dostępne wartości: DENTAL_TECHNICAN_SERVICES,DOCTOR_DENTIST_SERVICES, PHYSIOTHERAPY_SERVICES, NURSING_SERVICES, PSYCHOLOGICAL_SERVICES, MEDICAL_TRANSPORT_SERVICES, CARE_SERVICES, TUTORING, TEACHING_FOREIGN_LANGUAGES, ARTISTS, RENTING_PROPERTY, INSURANCE_SERVICES, CREDITS_AND_LOANS_SERVICES, GUARANTIEES, SPECIAL_CONDITIONS_FOR_EXEMPTION, UE_TRANSACTIONS, SUBJECTIVE_EXEMPTIONS, OTHER, OTHER_OBJECTIVE_EXEMPTIONS
text	string	NIE	Opis. Parametr niezbędny w przypadku podania w parametrze type wartości OTHER
Dodatkowo możliwe jest wskazanie, czy faktura ma być automatycznie wysyłana za pomocą parmetru:

Parametr	Typ	Parametr wymagany	Opis
issueInvoice	boolean	NIE	Automatyczna wysyłka faktury
Masz pytanie? Zobacz nasze FAQ

Przykładowa struktura danych
$invoiceData = [
    "buyer"     => [
        "type"              => "PERSON",
        "email"             => "jan.kowalski@example.com",
        "fullName"          => "Jan Kowalski",
        "street"            => "Street",
        "city"              => "City",
        "postalCode"        => "12-345",
        "countryCodeAlpha2" => "PL",
    ],
    "positions" => [
        [
            "name"        => "Produkt",
            "code"        => "produkt-01",
            "quantity"    => 1,
            "unit"        => "Sztuki",
            "taxStake"    => "TAX_23",
            "grossAmount" => 12300,
        ],
    ],
];
Powyższe parametry należy uwzględnić podczas wyliczania sygnatury zgodnie z punktem wyliczanie sygnatury

Przygotowanie obiektu invoice
Za pomocą funkcji PHP
Dane zebrane z powyższych parametrów należy zakodować za pomocą funkcji: base64_encode(gzencode(json_encode($invoiceData), 5));

gdzie:

$invoiceData - przygotowane wcześniej parametry według struktury z punktu przykladowa struktura danych

$invoiceData = [
    "buyer"     => [
        "type"              => "PERSON",
        "email"             => "jan.kowalski@example.com",
        "fullName"          => "Jan Kowalski",
        "street"            => "Street",
        "city"              => "City",
        "postalCode"        => "12-345",
        "countryCodeAlpha2" => "PL",
    ],
    "positions" => [
        [
            "name"        => "Produkt",
            "code"        => "produkt-01",
            "quantity"    => 1,
            "unit"        => "Sztuki",
            "taxStake"    => "TAX_23",
            "grossAmount" => 12300,
        ],
    ],
];
$invoice = base64_encode(gzencode(json_encode($invoiceData), 5));

$fields = [
    'serviceId' => '63f574ed-d90d-4abe-9cs1-39117584a7b7',
    'merchantId' => '6yt3gjtm9p1odfgx8491',
    'amount' => '12300',
    'currency' => 'PLN',
    'orderId' => '123',
    'orderDescription' => '#Example transaction',
    'customerFirstName' => 'Jan',
    'customerLastName' => 'Kowalski',
    'customerEmail' => 'jan.kowalski@example.com',
    'customerPhone' => '515515515',
    'urlSuccess' => 'https://your-shop.com/success',
    'urlFailure' => 'https://your-shop.com/failure',
    'urlReturn' => 'https://your-shop.com/return',
    'invoice' => $invoice,
];
$serviceKey = 'eAyhFLuHgwl5hu-32GM8QVlCVMWRU0dGjH1c';
$hashMethod = 'sha256';
$signature= createSignature(
    $fields,
    $serviceKey,
    $hashMethod
) . ';' . $hashMethod;
Przykład zakodowanego obiektu invoice
Przykładowa zawartość obiektu invoice po użyciu funkcji z punktu przygotowanie obiektu invoice

H4sIAAAAAAAAA0WOQQvCNAyF/4rkPGWbenAnh3gTFedBEJGqVcu6dq4pOMf+u8MYeAnJl/fy0sDF17KCpAGsSwkJbJe7bLOGAGQhlCaA0uGcy6jUhO9e67UoZL8zcCHssJISfzAiclVY9zNNpXUo9MLe2BjFw/KkyhrrDVY141SXTxHzAytoO71CZY2D5NiA+QfGna07M6P25YXBLikKwBvFL2Qf9LmiJYp3hiJn7T49nENCj8o6lxacS5ZpGLan9gsKdX5sBQEAAA==
Przykładowa zawartość formularza
<input type="hidden" value="63f574ed-d90d-4abe-9cs1-39117584a7b7" name="serviceId">
<input type="hidden" value="6yt3gjtm9p1odfgx8491" name="merchantId">
<input type="hidden" value="300" name="amount">
<input type="hidden" value="PLN" name="currency">
<input type="hidden" value="123" name="orderId">
<input type="hidden" value="Example transaction" name="orderDescription">
<input type="hidden" value="John" name="customerFirstName">
<input type="hidden" value="Doe" name="customerLastName">
<input type="hidden" value="johndoe@domain.com" name="customerEmail">
<input type="hidden" value="501501501" name="customerPhone">
<input type="hidden" value="https://your-shop.com/success" name="urlSuccess">
<input type="hidden" value="https://your-shop.com/failure" name="urlFailure">
<input type="hidden" value="https://your-shop.com/return" name="urlReturn">
<input type="hidden" value="<?= $invoice ?>" name="invoice">
ING Lease Now
Opcja dostępna w przypadku włączonej usługi ING Lease Now. Do podstawowego zapytania tworzącego transakcję zgodnie z opisem punktu 1. należy załączyć obiekt cart z tablicą items wraz z następujacymi parametrami:

Parametr	Typ	Parametr wymagany	Opis
id	string	TAK	Identyfikator produktu
name	string	TAK	Nazwa produktu
amount	integer	TAK	Wartość jednostkowa produktu netto w najmniejszej jednostce waluty - grosze. Dopuszczalna jest również wartość 0.
tax	integer	TAK	Wartość jednostkowa podatku
taxStake	string	TAK	Stawka podatku. Dostępne wartości: 23, 22, 8, 7, 5, 3, 0, TAX_EXEMPT, TAX_NOT_LIABLE, TAX_REVERSE_CHARGE, TAX_EXCLUDING
quantity	integer	TAK	Ilość. Minimalna wartość to 1
url	string	TAK	Adres url dla danego produktu
categoryId	string	TAK	Nazwa kategorii
unit	string	NIE	Jednostka
state	integer	NIE	Stan produktu. Dostępne wartości: NEW, USED
discount.amount	integer	NIE	Wartość rabatu
discount.tax	integer	NIE	Wartość podatku rabatu
Minimalna wartość dla pojedynczego produktu w Leasingu to 1000 PLN, natomiast wartość całego koszyka musi wynosić minimum 5000 PLN. Podane kwoty są kwotami netto.

Masz pytanie? Zobacz nasze FAQ

Przykładowa struktura danych
$cart = [
    'items' => [
        [
            'id'         => 1,
            'categoryId' => 'category123',
            'name'       => 'Product name',
            'amount'     => 1000,
            'tax'        => 230,
            'taxStake'   => 23,
            'quantity'   => 1,
            'unit'       => 'szt',
            'url'        => 'https://product.url',
            'state'      => 'NEW',
            'discount'   => [
                'amount' => 100,
                'tax'    => 23,
            ]
        ]
    ]
];
Powyższe parametry należy uwzględnić podczas wyliczania sygnatury zgodnie z punktem wyliczanie sygnatury

Przygotowanie obiektu cart
Za pomocą funkcji PHP
Dane zebrane z powyższych parametrów należy zakodować za pomocą funkcji: base64_encode(gzencode(json_encode($cart), 5));

gdzie:

$cart - przygotowane wcześniej parametry według struktury z punktu przykladowa struktura danych

$cart = [
    'items' => [
        [
            'id'         => 1,
            'categoryId' => 'category123',
            'name'       => 'Product name',
            'amount'     => 500000,
            'tax'        => 115000,
            'taxStake'   => 23,
            'quantity'   => 1,
            'unit'       => 'szt',
            'url'        => 'https://product.url',
            'state'      => 'NEW',
            'discount'   => [
                'amount' => 100,
                'tax'    => 23,
            ],
        ],
    ],
];
$cart = base64_encode(gzencode(json_encode($cart), 5));

$fields = [
    'serviceId' => '63f574ed-d90d-4abe-9cs1-39117584a7b7',
    'merchantId' => '6yt3gjtm9p1odfgx8491',
    'amount' => '615000',
    'currency' => 'PLN',
    'orderId' => '123',
    'orderDescription' => '#Example transaction',
    'customerFirstName' => 'Jan',
    'customerLastName' => 'Kowalski',
    'customerEmail' => 'jan.kowalski@example.com',
    'customerPhone' => '515515515',
    'urlSuccess' => 'https://your-shop.com/success',
    'urlFailure' => 'https://your-shop.com/failure',
    'urlReturn' => 'https://your-shop.com/return',
    'cart' => $cart,
];
$serviceKey = 'eAyhFLuHgwl5hu-32GM8QVlCVMWRU0dGjH1c';
$hashMethod = 'sha256';
$signature = createSignature(
    $fields,
    $serviceKey,
    $hashMethod
) . ';' . $hashMethod;
Użycie dodatkowo parametru visibleMethod z wartością lease spowoduje wyświetlenie tylko Leasingu na bramce. Takie działanie daje możliwość na wyodrębnienie danej metody jako osobnej na podsumowaniu.

Przykładowa zawartość formularza
<input type="hidden" value="63f574ed-d90d-4abe-9cs1-39117584a7b7" name="serviceId">
<input type="hidden" value="6yt3gjtm9p1odfgx8491" name="merchantId">
<input type="hidden" value="300" name="amount">
<input type="hidden" value="PLN" name="currency">
<input type="hidden" value="123" name="orderId">
<input type="hidden" value="Example transaction" name="orderDescription">
<input type="hidden" value="John" name="customerFirstName">
<input type="hidden" value="Doe" name="customerLastName">
<input type="hidden" value="johndoe@domain.com" name="customerEmail">
<input type="hidden" value="501501501" name="customerPhone">
<input type="hidden" value="https://your-shop.com/success" name="urlSuccess">
<input type="hidden" value="https://your-shop.com/failure" name="urlFailure">
<input type="hidden" value="https://your-shop.com/return" name="urlReturn">
<input type="hidden" value="<?= $cart ?>" name="cart">
Minimalne i maksymalne wartości kwot transakcji
Dla każdej metody płatności obowiązują limity dokonania transkacji z dokładnością do kanału płatności. Bieżące wartości używanych limitów można uzyskać przez API transakcyjne: Pobieranie danych o sklepach akceptanta

transactionLimits: {

                    "maxTransaction": {

                            "type": "number",

                            "value": 99999999

                        },

                    "minTransaction": {

                            "type": "number",

                            "value": 0

                        }
Środowisko testowe sandbox
Imoje oferuje tryb testowy sandbox w ramach weryfikacji poprawności działania integracji.

Środowisko testowe sandbox można znaleźć przechodząc na stronę: https://sandbox.imoje.ing.pl

Chcąc utworzyć nowe konto należy kliknąć Utwórz konto Akceptanta, a następnie podać adres e-mail, na który zostanie wysłany link do aktywacji konta. Po aktywacji konta wystarczy zalogować się wygenerowanym loginem oraz nadanym wcześniej hasłem. Do konta zostanie przypisany sklep testowy, który posiadać będzie swoje klucze integracyjne.

Karty w środowisku sandbox
W celu przetestowania płatności kartą, należy użyć poniższych danych:

Wystawca karty	Numer karty	Miesiąc	Rok	CVV	3-D Secure	Opis
Visa	4111111111111111	12	29	123	no	Pozytywna autoryzacja - zrealizowana transakcja profilu
Visa	4485201817664006	12	29	123	no	Pozytywna autoryzacja - odrzucona transakcja profilu, dcc odrzucona
Visa	4444333322221111	12	29	123	no	Negatywna autoryzacja
Visa	4012001037141112	12	29	123	yes	Pozytywna autoryzacja - zrealizowana transakcja profilu
Visa	4749601201390567	12	29	123	yes	Pozytywna autoryzacja - odrzucona transakcja profilu
Visa	4934403892699132	12	29	123	yes	Negatywna autoryzacja
Visa	4012001007002005	12	29	123	no	Błąd dostawcy
Visa	4282513338596268	12	29	123	no	Pozytywna autoryzacja - błąd transakcji dostawcy profilu
Transakcje PBL, BLIK na środowisku sandbox.
W celu przetestowania transakcji PBL lub BLIK, należy w podstawowym zapytaniu z punktem wykonanie transakcji przesłać odpowiednią wartość parametru orderDescription

orderDesription	Opis
TEST-100000	Standard - Zrealizowany zwrot, domyślna akcja
TEST-100010	Błąd dostawcy
FAQ
Poniżej znajdziesz odpowiedzi na często zadawane pytania.

Kliknij w wybrane pytanie, by zobaczyć odpowiedź.

Nie ma odpowiedzi na Twoje pytanie? Skontaktuj się z nami.


Gdzie znajdę token autoryzacyjny?

Jak uzupełnić adres notyfikacji?

W jaki sposób obsłużyć przekierowanie z obiektu "action"?

W jaki sposób automatycznie aktualizować status zamówienia w sklepie?

Skąd pobrać logo danej metody płatności?

Dostaję błąd "Cannot process transaction. Plain card data disabled.". Co on oznacza?

Czy dostępne jest środowisko testowe?

Dostaję błąd w odpowiedzi po API. Dlaczego?

Jak sprawdzić dostępność metody płatności?

Nie dostaję notyfikacji. Dlaczego?

Multiwypłaty/ING Księgowość/ING Lease Now nie działają.

Dlaczego nie mogę utworzyć zwrotu do transakcji?

Dane kontaktowe, wsparcie techniczne
Adres e-mail: kontakt.tech@imoje.pl
Telefon: +48 32 319 35 70
WWW: https://www.imoje.pl

alt text