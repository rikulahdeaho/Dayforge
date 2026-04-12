# Dayforge Memory And Loading ASCII

Selkokielinen kuvaus siita, miten Dayforge muistaa tietonsa.

Tassa projektissa "muisti" tarkoittaa kahta asiaa:

- mita sovellus pitaa juuri nyt auki kayton aikana
- mita sovellus tallentaa laitteelle myohempaa varten

## Kun appi kaynnistyy

```text
                APP START
                    |
                    v
+----------------------------------+
| Appi luo ensin oletustilan       |
| jotta se voi kaynnistya          |
+----------------+-----------------+
                 |
                 v
+----------------------------------+
| Appi lukee laitteen tallennuksen |
| AsyncStoragesta                  |
+----------------+-----------------+
                 |
       +---------+----------+
       | loytyiko vanhaa    |
       | tallennettua dataa?|
       +---------+----------+
                 |
          yes    |    no
                 |
                 v
+----------------------------------+
| Appi siivoaa ja taydentaa datan  |
| jotta kaikki tarvittava on mukana|
+----------------+-----------------+
                 |
                 v
+----------------------------------+
| Tallennettu data otetaan         |
| sovelluksen nykyiseksi dataksi   |
+----------------+-----------------+
                 |
                 v
+----------------------------------+
| Screenit nayttavat oikeat tiedot |
+----------------------------------+
```

## Muutoksen tallennus

```text
Kayttaja tekee toiminnon UI:ssa
        |
        v
Screen kutsuu yhteista toimintoa
(esim. toggleTask, addHabit, saveReflection)
        |
        v
toiminto pyytää muuttamaan dataa
        |
        v
saannot paattavat, miten data muuttuu
        |
        v
sovelluksen nykyinen data paivittyy
        |
        v
screenit renderoityvat uudestaan
        |
        v
250 ms debounce
        |
        v
persistAppState(state)
        |
        v
AsyncStorage.setItem(...)
```

## Mita sovellus muistaa

```text
AppState
|- hasCompletedOnboarding
|- user
|- preferences.darkMode
|- habits[]
|  `- completionByDate[dateKey] = true/false
|- goal
|  `- progressByWeek[weekStartDateKey]
|- tasks[]
|  `- completionByDate[dateKey] = true/false
|- reflectionDraft
|- reflectionHistory[]
`- weeklyPlansByWeek[weekStartDateKey]
```

## Yhteenveto

- kayton aikainen muisti = data jota appi kayttaa juuri nyt
- pysyva muisti = data joka on tallessa vaikka appi suljetaan
- kaynnistyksessa appi hakee vanhan datan takaisin kayttoon
