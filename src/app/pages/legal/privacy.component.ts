import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-privacy',
    standalone: true,
    imports: [RouterLink],
    template: `
    <section class="legal-page">
      <a
        class="legal-back"
        routerLink="/dashboard"
      >
        ← Înapoi la Wedding Planner
      </a>

      <div class="legal-header">
        <span class="legal-eyebrow">
          Legal
        </span>

        <h1>
          Politica de confidențialitate
        </h1>

        <p>
          Ultima actualizare: august 2026
        </p>
      </div>

      <article class="legal-content">
        <section>
          <h2>1. Scopul acestei politici</h2>

          <p>
            Această politică explică modul în care sunt utilizate și
            stocate informațiile necesare funcționării aplicației
            Wedding Planner.
          </p>
        </section>

        <section>
          <h2>2. Ce informații pot fi stocate</h2>

          <p>
            Aplicația poate conține informații despre invitați,
            furnizori, plăți, documente, task-uri, așezarea la mese și
            programul evenimentului. Aceste date sunt introduse de
            utilizatorii autorizați ai aplicației.
          </p>
        </section>

        <section>
          <h2>3. Date despre invitați</h2>

          <p>
            Datele despre invitați sunt utilizate exclusiv pentru
            organizarea evenimentului, inclusiv gestionarea prezenței,
            meniurilor, copiilor, grupurilor și așezării la mese.
          </p>
        </section>

        <section>
          <h2>4. Autentificare</h2>

          <p>
            Pentru funcționalitățile protejate, aplicația poate utiliza
            autentificarea Google prin Firebase Authentication. În acest
            context pot fi procesate date precum numele, adresa de e-mail
            și identificatorul asociat contului autentificat.
          </p>
        </section>

        <section>
          <h2>5. Stocarea datelor</h2>

          <p>
            Datele aplicației pot fi stocate utilizând servicii Firebase,
            inclusiv Firestore. Disponibilitatea și securitatea
            infrastructurii tehnice sunt supuse și termenilor furnizorilor
            acestor servicii.
          </p>
        </section>

        <section>
          <h2>6. Partajarea informațiilor</h2>

          <p>
            Datele din aplicație nu sunt destinate comercializării sau
            distribuirii publice. Accesul este oferit numai persoanelor
            pentru care acesta este necesar în scopul organizării
            evenimentului.
          </p>
        </section>

        <section>
          <h2>7. Acces public</h2>

          <p>
            Anumite secțiuni ale aplicației pot fi disponibile în mod
            public sau în regim de vizualizare. Nu trebuie introduse în
            aceste secțiuni informații sensibile care nu sunt necesare
            organizării evenimentului.
          </p>
        </section>

        <section>
          <h2>8. Păstrarea informațiilor</h2>

          <p>
            Datele pot fi păstrate atât timp cât sunt necesare pentru
            organizarea și administrarea evenimentului și pot fi șterse
            ulterior atunci când nu mai sunt necesare.
          </p>
        </section>

        <section>
          <h2>9. Securitate</h2>

          <p>
            Sunt utilizate mecanisme tehnice de autentificare și control
            al accesului pentru a limita modificarea informațiilor.
            Niciun sistem informatic nu poate însă garanta securitatea
            absolută a datelor.
          </p>
        </section>

        <section>
          <h2>10. Actualizarea politicii</h2>

          <p>
            Această politică poate fi actualizată dacă se modifică
            funcționalitățile aplicației, tipurile de date stocate sau
            serviciile tehnice utilizate.
          </p>
        </section>
      </article>
    </section>
  `,
    styles: [`
    .legal-page {
      width: min(900px, 100%);
      margin: 0 auto;
      padding: 20px 0 50px;
      color: #46382d;
    }

    .legal-back {
      display: inline-flex;
      margin-bottom: 34px;
      color: #8a6c50;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
    }

    .legal-back:hover {
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    .legal-header {
      margin-bottom: 34px;
      padding-bottom: 28px;
      border-bottom: 1px solid #e2d5c5;
    }

    .legal-eyebrow {
      color: #9b7651;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .14em;
      text-transform: uppercase;
    }

    h1 {
      margin: 7px 0 8px;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: clamp(32px, 5vw, 48px);
      line-height: 1.05;
    }

    .legal-header p {
      margin: 0;
      color: #9a8877;
      font-size: 12px;
    }

    .legal-content {
      display: grid;
      gap: 18px;
    }

    .legal-content section {
      padding: 24px 26px;
      border: 1px solid #e5d8c7;
      border-radius: 18px;
      background: rgba(255, 251, 245, .72);
    }

    h2 {
      margin: 0 0 9px;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 18px;
    }

    p {
      margin: 0;
      color: #776657;
      font-size: 14px;
      line-height: 1.75;
    }

    @media (max-width: 620px) {
      .legal-content section {
        padding: 20px;
      }
    }
  `]
})
export class PrivacyComponent {}