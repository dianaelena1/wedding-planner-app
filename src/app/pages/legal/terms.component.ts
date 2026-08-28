import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-terms',
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
          Termeni și condiții
        </h1>

        <p>
          Ultima actualizare: august 2026
        </p>
      </div>

      <article class="legal-content">
        <section>
          <h2>1. Despre aplicație</h2>

          <p>
            Wedding Planner este o aplicație creată pentru organizarea
            și gestionarea informațiilor asociate unui eveniment privat.
            Aplicația permite centralizarea task-urilor, invitaților,
            furnizorilor, documentelor, plăților și altor informații
            logistice relevante.
          </p>
        </section>

        <section>
          <h2>2. Utilizarea aplicației</h2>

          <p>
            Aplicația este destinată exclusiv utilizării personale și
            persoanelor cărora le-a fost oferit acces în mod explicit.
            Accesarea sau utilizarea neautorizată a funcțiilor
            administrative este interzisă.
          </p>
        </section>

        <section>
          <h2>3. Corectitudinea informațiilor</h2>

          <p>
            Informațiile afișate în aplicație sunt introduse și actualizate
            de utilizatorii autorizați. Wedding Planner nu garantează că
            toate informațiile introduse sunt permanent complete,
            exacte sau actualizate.
          </p>
        </section>

        <section>
          <h2>4. Furnizori, plăți și documente</h2>

          <p>
            Datele referitoare la furnizori, contracte, plăți, termene și
            alte obligații au caracter organizatoric. Aplicația nu
            substituie documentele contractuale originale, facturile,
            extrasele bancare sau comunicările oficiale dintre părți.
          </p>
        </section>

        <section>
          <h2>5. Conturi și acces</h2>

          <p>
            Unele funcționalități necesită autentificare. Utilizatorii sunt
            responsabili pentru protejarea propriului cont și pentru
            evitarea oferirii accesului către persoane neautorizate.
          </p>
        </section>

        <section>
          <h2>6. Disponibilitatea aplicației</h2>

          <p>
            Aplicația poate fi modificată, actualizată sau indisponibilă
            temporar, inclusiv din motive tehnice, mentenanță ori
            indisponibilitatea serviciilor externe utilizate.
          </p>
        </section>

        <section>
          <h2>7. Proprietate intelectuală</h2>

          <p>
            Designul, structura și codul aplicației Wedding Planner aparțin
            creatorului aplicației, cu excepția tehnologiilor, bibliotecilor
            și serviciilor terțe utilizate conform propriilor licențe.
          </p>
        </section>

        <section>
          <h2>8. Limitarea răspunderii</h2>

          <p>
            Aplicația este oferită ca instrument de organizare. Creatorul
            aplicației nu răspunde pentru pierderi, întârzieri, plăți
            ratate sau alte consecințe rezultate exclusiv din informații
            introduse incorect, incomplete ori neactualizate.
          </p>
        </section>

        <section>
          <h2>9. Modificarea termenilor</h2>

          <p>
            Acești termeni pot fi actualizați atunci când funcționalitățile
            aplicației sau modul de utilizare se schimbă.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>

          <p>
            Pentru întrebări legate de aplicație sau de acești termeni,
            poate fi utilizat profilul LinkedIn afișat în footerul
            aplicației.
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
export class TermsComponent {}