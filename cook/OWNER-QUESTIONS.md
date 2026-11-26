# Pytania do właściciela (SIMAX)

Rzeczy, które strona obiecuje albo pokazuje, a które musi potwierdzić właściciel. Przy każdym punkcie jest miejsce w kodzie, żeby od razu wpisać odpowiedź. Na stronie beta placeholdery typu **XX** są wyróżnione tak samo jak `t.b.d.`.

## 1. Proces projektowania (najważniejsze)

Strona obiecuje teraz **proces oparty na rozmowie**: pytamy, proponujemy, poprawiamy, a przed szyciem klient potwierdza komplet ustaleń (wymiary, tkanina, wypełnienie, cena, termin). Strona nie obiecuje konkretnego dokumentu.

- [ ] Co klient dostaje do akceptacji przed szyciem?
  - rysunek z wymiarami (odręczny albo z programu)?
  - wizualizacja / render 3D?
  - sama lista ustaleń w mailu / SMS?
- [ ] Czy akceptacja jest na piśmie (mail, podpisane zamówienie)?
- [ ] Ile zwykle trwa etap projektu? Ile rund poprawek jest w cenie?
- [ ] Czy projekt jest płatny osobno, albo czy jest zaliczka przed szyciem?
- [ ] Czy klient może przyjechać do pracowni (obejrzeć tkaniny, mebel w trakcie)?

Gdzie: `site/src/data/custom.json` → `stages`, `faq`.

## 2. Co da się zmienić (sekcja „Co możesz zmienić”)

Po rozmowie z właścicielem (26.11) strona mówi teraz: **fotele i sofy składamy ze sprawdzonych modeli i elementów**, a tkaninę, kolor, wzór, przeszycia, nogi (z naszych wzorów) i twardość pianki dobiera klient. **Łóżka** robimy w całości u siebie, więc tam zmienić można najwięcej (rozmiar, wezgłowie, pojemnik). Zupełnie nowa bryła jest opisana jako możliwa, ale rzadka, droższa i dłuższa. Proszę potwierdzić albo poprawić każdą pozycję:

- [ ] Model jako baza: czy w fotelu da się łączyć elementy z różnych modeli (np. bryła GRANDE z bokami lub nogami z innego modelu)? Jakie są „klocki”: korpus, oparcie, boki, siedzisko, nogi?
- [ ] Nogi: jakie rodzaje nóg są do wyboru (ile wzorów, drewniane / metalowe, wysokości)? Czy są zdjęcia? Paleta kolorów drewna (bejce)?
- [ ] Przeszycia: które faktycznie robicie w fotelach i sofach? Pikowanie guzikami, przeszycia pionowe, poziome, karo, lamówka (także w innym kolorze)? Czy wszystkie w każdym modelu?
- [ ] Wzór: dwie tkaniny na jednym meblu, czy w każdym modelu? Czy ustalacie z klientem ułożenie wzoru?
- [ ] Wypełnienie: czy klient może wybrać twardość siedziska? Ile wariantów (np. miękkie / średnie / twarde)? Czy oparcie też?
- [ ] Wymiar foteli i sof: czy w ogóle zmieniacie wymiar (szerokość, wysokość siedziska, długość sofy)? Jeśli tak, w jakim zakresie i w których modelach? Teraz strona pisze „wymiar zależy od modelu, zapytaj”. Strona kategorii **sofy** nadal obiecuje „sofę na konkretne centymetry”: czy to zostaje?
- [ ] Mebel nietypowy (nowa bryła): czy przyjmujecie takie zamówienia? Orientacyjnie o ile drożej i dłużej niż model z kolekcji?
- [ ] Które elementy robicie sami, a które kupujecie (ramy foteli, nogi, stelaże łóżek)? Na stronie piszemy ogólnie „przygotowujemy konstrukcję”.
- [ ] Strona „O nas” i `/dla-firm/` wspominają o projekcie od zera dla firm (np. ławy pod ścianę). Czy dla firm robicie nietypowe bryły częściej niż dla klientów domowych?
- [ ] Funkcje: pojemnik na pościel, funkcja spania, podnóżek do kompletu. Przy których modelach?

Gdzie: `site/src/data/custom.json` → `options`, `optionsLead`; strona foteli: `site/src/data/category-copy.json` → `fotele` (`parts`, `introHtml`).

## 2a. Doradztwo i materiały (pianki Pionier)

Strona ma nową sekcję „Doradzamy przy wyborze materiałów” (pianka, tkanina, przeszycia) i pisze, że pianki są od **Pionier Pianki z Baranowa**, z linkiem do pionier-pianki.pl.

- [ ] Czy możemy wymieniać Pionier Pianki z nazwy i linkować do ich strony? Czy oni linkują do Was (np. lista partnerów)? Czy można użyć ich logo?
- [ ] Jakie pianki stosujecie w siedziskach i oparciach (gęstość, np. T25, T30, T35, HR, pianka wysokoelastyczna, nakładki)? Czy klient może wybrać lepszą piankę za dopłatą?
- [ ] Czy są inne materiały do wyboru (sprężyny, pierze / puch w poduchach, włóknina)?
- [ ] Jak wygląda doradztwo w praktyce: telefon, wizyta w pracowni, próbki pianki do wypróbowania?
- [ ] Gwarancja na piankę (czy siedzisko nie siada) i na konstrukcję: ile lat?
- [ ] Inni stali dostawcy, których warto pokazać (tkaniny, np. producenci kolekcji)?

Gdzie: `site/src/data/custom.json` → `advice`, `faq`.

## 3. Współpraca z firmami (HoReCa)

Na stronie `/dla-firm/` są placeholdery:

| Pozycja | Teraz na stronie | Odpowiedź |
| --- | --- | --- |
| Minimalna seria | „od XX sztuk” | |
| Montaż na miejscu | „XX” | |
| Atesty trudnopalności dla obiektu (np. PN-EN 1021, BS 5852) | „XX” | |
| Ceny dla firm | „indywidualnie, zależnie od serii” | potwierdzić |
| Faktura | „faktura VAT” | potwierdzić |

- [ ] Czy SIMAX realizował już zlecenia dla restauracji, hoteli, biur? Które można pokazać?
- [ ] Czy dowóz serii jest własnym transportem?

Gdzie: `site/src/routes/dla-firm.tsx` → `terms`, `site/src/data/custom.json` → `b2b`.

## 4. Realizacje

- [ ] Lista realizacji, które klient zgodził się pokazać (dom / firma, miejscowość, rok).
- [ ] Do każdej, jeśli są: zdjęcie pomysłu lub szkicu klienta, projekt (rysunek / render), zdjęcia gotowego mebla.
- [ ] Oryginalne zdjęcia z Instagrama w pełnej rozdzielczości. Najprościej: Instagram → Ustawienia → „Pobierz swoje informacje”, albo pliki z telefonu. Instagram blokuje automatyczne pobieranie, a do tego zdjęcia z Instagrama są skompresowane.
- [ ] Czy któryś model z kolekcji powstał najpierw jako zamówienie indywidualne? To najlepsza historia do strony („projekt wrócił do kolekcji”).

Gdzie: `site/src/data/projects.json` (format opisany w `_help`), zdjęcia do `site/public/img/realizacje/`. Dopóki lista jest pusta, `/realizacje/` jest wyłączona z Google (noindex).

## 5. Domena i marka

- [ ] Docelowa domena (teraz roboczo `simax-custom.pl` w `site/src/data/site.json` → `url`). Propozycje na końcu pliku.
- [ ] Czy na simaxmeble.pl może pojawić się link do nowej strony (menu albo baner „Meble na zamówienie”)?
- [ ] Kto założy Google Search Console dla nowej domeny?

## 6. Kontakt

- [ ] Czy zapytania o meble na zamówienie mają iść na `sklep@simaxmeble.pl`, czy na inny adres?
- [ ] Czy wiadomości na Instagramie są odczytywane (czy wolno zachęcać do pisania tam)?

## 7. Zaległe dane z poprzedniej wersji

- [ ] Koszt dostawy (teraz nie podajemy).
- [ ] Brakujące parametry tkanin (ścieralność, skład), oznaczone na stronie jako t.b.d.
- [ ] Zasady zwrotu: 14 dni dla gotowych modeli, brak zwrotu dla zamówień indywidualnych (art. 38 pkt 3). Proszę potwierdzić.
- [ ] Zgody klientów na zdjęcia w „Meble u Was”.
- [ ] Brakujące wymiary w tabelach produktów (klienci porównują je z miejscem w domu):
  - Wszystkie fotele (GRANDE, CARMO, CARMO GLAMOUR, FIGARO, ETERNO, ALLURE, BOSTON, LITENO, BALTIC): szerokość siedziska i wysokość podłokietnika.
  - Fotel retro PRL: brak wszystkich wymiarów.
  - Podnóżek GRANDE: szerokość, wysokość, głębokość.
  - Kanapy NUVEM i SIMPLE: głębokość całkowita (po złożeniu i po rozłożeniu), wymiar powierzchni spania, szerokość siedziska, wysokość podłokietnika.
  - Łóżko DIA: szerokość całkowita (COMO ma 213 cm). Dla obu łóżek: wysokość pojemnika i prześwit pod łóżkiem.
- [ ] Kanapa NUVEM w tkaninie Catch Me (nowe wizualizacje, kolory 02, 05, 07 i dwa szare): jaka jest cena? Teraz pokazujemy 2199 zł jak za boucle. Który z dwóch szarych to Catch Me 01, a który 22?

## 8. Płatność, terminy, próbki, usługi (inspiracja: fotelownia.com.pl)

- [ ] Zaliczka przy zamówieniu na wymiar: ile procent? Kiedy płatna jest reszta (przed wysyłką, przy odbiorze)? Regulamin sklepu wspomina już o zaliczce, czy te zasady obowiązują też tutaj?
- [ ] Typowy czas realizacji: „zwykle od X do Y tygodni”? Liczony od zaliczki czy od akceptacji projektu?
- [ ] Próbki tkanin: czy wysyłka jest bezpłatna? Ile próbek naraz? Czy możemy zrobić wzornik tkanin w PDF do pobrania?
- [ ] Czy szyjecie z tkaniny klienta (tkanina powierzona)? Jeśli tak, na jakich warunkach?
- [ ] Kolory nóg: jaka jest paleta bejc / lakierów? Czy są zdjęcia próbek drewna?
- [ ] Czy robicie renowację / nowe obicie mebli klienta? Wycena ze zdjęcia? Jakie meble (fotele, sofy, krzesła, PRL)?
- [ ] Tkaniny we wzory: czy ustalacie z klientem, jak ułożyć wzór na meblu?
- [ ] Dostawa: koszt dla fotela, sofy i łóżka? Kurier czy własny transport? Czy kierowca wnosi mebel? Czy nogi są odkręcane do wysyłki? Odbiór osobisty w pracowni bez opłat?
- [ ] Wysyłka za granicę (np. Niemcy)?
- [ ] Godziny, w których odbieracie telefon (np. pon–pt 8–16)?
- [ ] Czy są meble gotowe od ręki (ekspozycja, nadwyżki), które można pokazać osobno?
- [ ] Dla każdego modelu z kolekcji: co konkretnie da się w nim zmienić (lamówka, guziki, nogi, podnóżek do kompletu)? Patrz też punkt 2.
- [ ] Na zdjęciach z osobą siedzącą w fotelu: ile ta osoba ma wzrostu (dla skali)?

## 9. Konfigurator łóżka (wersja wstępna na /lozko-na-zamowienie/)

Zrobiliśmy prosty konfigurator: rozmiar materaca, kształt i wysokość wezgłowia, pojemnik, nogi, tkanina. Wysyła maila z wybranymi opcjami. Żeby zrobić go lepiej:

- [ ] Jakie kształty wezgłowia faktycznie szyjecie (gładkie zaokrąglone, poduchy, pikowane, pionowe przeszycia, inne)? Czy są zdjęcia albo rysunki?
- [ ] Jakie rozmiary materaca robicie standardowo (140, 160, 180, 200 × 200)? Czy także 90/120 i długość 210–220?
- [ ] W jakim zakresie można zmienić wysokość wezgłowia (np. od 90 do 130 cm)?
- [ ] Pojemnik na pościel: zawsze dostępny? Czy jest wersja bez pojemnika (niższa cena)?
- [ ] Jakie nogi są do wyboru przy łóżkach (metalowe, drewniane, schowane)?
- [ ] Czy robicie samo wezgłowie (na ścianę albo do istniejącej ramy)?
- [ ] Czy można podać orientacyjne ceny dopłat (np. większy rozmiar +XX zł), żeby konfigurator pokazywał cenę „od”?

## 10. Co jeszcze chcecie mieć na stronie? (pomysły z fotelownia.com.pl)

Zaznaczcie, co Was interesuje. Pominęliśmy rzeczy, które nie pasują (wyskakujący newsletter, koszyk, widżety Facebooka).

- [ ] Wzornik tkanin w PDF do pobrania.
- [ ] Zamawianie bezpłatnych próbek przez formularz.
- [ ] Usługa renowacji / nowego obicia z wyceną ze zdjęcia (osobna strona).
- [ ] Tabela kosztów dostawy dla fotela, sofy i łóżka.
- [ ] Lista „od ręki”: meble gotowe, z ekspozycji albo nadwyżki.
- [ ] Paleta kolorów nóg (bejce) ze zdjęciami.
- [ ] Godziny kontaktu przy numerze telefonu.
- [ ] Wersja niemieckojęzyczna, jeśli wysyłacie do Niemiec.
- [ ] Siatka zdjęć z Instagrama (z Waszych plików, bez wtyczek).

## Propozycje domeny

Propozycja do decyzji właściciela:

1. **simaxnawymiar.pl**: zostaje marka i fraza, którą ludzie wpisują w Google („na wymiar”).
2. **simax-nazamowienie.pl**: to samo z frazą z nagłówka strony, ale dłuższe i z myślnikiem.
3. **pracowniasimax.pl**: brzmi jak pracownia, dobrze pasuje do firm, krótkie.
