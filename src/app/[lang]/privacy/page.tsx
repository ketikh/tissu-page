import { Locale } from "@/i18n/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Tissu",
  description: "How Tissu collects, uses, and protects your personal data.",
};

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isKa = (lang as Locale) === "ka";

  return (
    <div className="bg-[var(--tissu-cream)]">
      <div className="container py-16 md:py-24 max-w-[780px]">
        <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--tissu-white)] border border-[var(--border)] text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--tissu-ink-soft)]">
          <span className="w-2 h-2 rounded-full bg-[var(--tissu-mustard)]" />
          {isKa ? "ლეგალური" : "Legal"}
        </span>
        <h1 className="ka-display-xl font-serif text-[40px] md:text-[56px] leading-[1.05] tracking-[-0.02em] mt-6 mb-3 text-[var(--tissu-ink)]">
          {isKa ? (
            <>
              <em className="not-italic italic text-[var(--tissu-terracotta)]">პერსონალური</em>{" "}
              მონაცემების პოლიტიკა
            </>
          ) : (
            <>
              Privacy <em className="not-italic italic text-[var(--tissu-terracotta)]">policy</em>
            </>
          )}
        </h1>
        <p className="text-[14px] text-[var(--tissu-ink-soft)] mb-12">
          {isKa ? "ბოლოს განახლდა" : "Last updated"}: 2026-04-23
        </p>

        <div className="prose-tissu space-y-10 text-[16px] leading-[1.7] text-[var(--tissu-ink)]">
          {isKa ? <KaBody /> : <EnBody />}
        </div>

        <style>{`
          .prose-tissu h2 { font-family: var(--font-serif); font-size: 24px; margin-top: 2rem; margin-bottom: 0.5rem; color: var(--tissu-ink); }
          .prose-tissu h3 { font-family: var(--font-serif); font-size: 19px; margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--tissu-ink); }
          html[lang="ka"] .prose-tissu h2 { font-family: var(--font-noto-sans); font-weight: 600; font-size: 22px; }
          html[lang="ka"] .prose-tissu h3 { font-family: var(--font-noto-sans); font-weight: 600; font-size: 18px; }
          .prose-tissu p, .prose-tissu li { color: var(--tissu-ink-soft); }
          .prose-tissu strong { color: var(--tissu-ink); }
          .prose-tissu ul { list-style: disc; padding-left: 1.25rem; }
          .prose-tissu a { color: var(--tissu-terracotta); text-decoration: underline; text-underline-offset: 3px; }
        `}</style>
      </div>
    </div>
  );
}

function EnBody() {
  return (
    <>
      <p>
        Tissu ("we", "us") is a small handmade-bag studio in Tbilisi, Georgia. This policy
        explains what personal data we collect when you use{" "}
        <strong>tissu-page.up.railway.app</strong> and related services, why we collect it,
        how we store it, and what rights you have over it.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Tissu Shop · Tbilisi, Georgia · contact: <a href="mailto:hello@tissu.ge">hello@tissu.ge</a>.
        We are the data controller for the information described below.
      </p>

      <h2>2. What data we collect</h2>
      <h3>When you place an order</h3>
      <ul>
        <li>Full name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Shipping address</li>
        <li>Order details (products, prices, timestamps)</li>
      </ul>
      <h3>When you create an account</h3>
      <ul>
        <li>Email and a hashed password (via Supabase Auth)</li>
        <li>Optional profile data you choose to add</li>
      </ul>
      <h3>Payment data</h3>
      <p>
        We do <strong>not</strong> store your card details. Payments are processed by third-party
        providers (e.g. Stripe, bank card gateways). Those providers receive the card data directly
        and return only a transaction result to us.
      </p>
      <h3>Technical data</h3>
      <ul>
        <li>IP address and approximate location (for fraud prevention and analytics)</li>
        <li>Browser and device type</li>
        <li>Pages visited and timestamps (minimal, aggregated)</li>
      </ul>

      <h2>3. Why we use it</h2>
      <ul>
        <li>To fulfil your order (ship the product, confirm payment, contact you about delivery)</li>
        <li>To provide customer support</li>
        <li>To comply with Georgian tax and accounting law</li>
        <li>To improve the site (aggregated analytics)</li>
        <li>To send marketing emails <strong>only</strong> if you opted in</li>
      </ul>

      <h2>4. Third parties we share data with</h2>
      <ul>
        <li><strong>Supabase</strong> — account authentication and database hosting</li>
        <li><strong>Cloudinary</strong> — product image delivery (no customer data)</li>
        <li><strong>Railway</strong> — application hosting</li>
        <li><strong>Payment processor</strong> (Stripe / TBC / BOG) — when you check out</li>
        <li><strong>Shipping provider</strong> — to deliver your order</li>
      </ul>
      <p>
        We do not sell your data. We do not share it for advertising purposes without explicit
        consent.
      </p>

      <h2>5. How long we keep it</h2>
      <ul>
        <li>Order records: 7 years, as required by Georgian accounting law</li>
        <li>Account data: until you delete your account</li>
        <li>Email newsletter list: until you unsubscribe</li>
        <li>Anonymised analytics: up to 26 months</li>
      </ul>

      <h2>6. Your rights</h2>
      <p>Under Georgian law and GDPR (if you are in the EU/EEA), you can:</p>
      <ul>
        <li>Request a copy of the data we hold about you</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion ("right to be forgotten")</li>
        <li>Object to or restrict certain processing</li>
        <li>Receive your data in a portable format</li>
        <li>Withdraw consent to marketing at any time</li>
      </ul>
      <p>
        Email <a href="mailto:hello@tissu.ge">hello@tissu.ge</a> and we will respond within 30 days.
      </p>

      <h2>7. Security</h2>
      <p>
        Passwords are hashed (never stored in plaintext). Communication with the site uses HTTPS.
        Access to personal data inside our systems is restricted to authorised staff. If a breach
        occurs, we will notify affected users and the Georgian Personal Data Protection Service
        within 72 hours, as required by law.
      </p>

      <h2>8. Cookies</h2>
      <p>
        We use strictly necessary cookies for login, cart, and site functionality. We may use
        minimal analytics cookies. We do not place third-party advertising cookies without your
        consent.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy. Material changes will be announced on the site and, if you have
        an account, by email. The "last updated" date above reflects the most recent change.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about this policy or a data request? Email{" "}
        <a href="mailto:hello@tissu.ge">hello@tissu.ge</a>.
      </p>
    </>
  );
}

function KaBody() {
  return (
    <>
      <p>
        Tissu ("ჩვენ") — ხელით ნაკერი ჩანთების მცირე სტუდიაა თბილისიდან. ეს პოლიტიკა განმარტავს,
        რა პერსონალურ მონაცემებს ვაგროვებთ თქვენი საიტის —{" "}
        <strong>tissu-page.up.railway.app</strong> — და დაკავშირებული სერვისების გამოყენებისას,
        რატომ ვაგროვებთ მათ, როგორ ვინახავთ და რა უფლებები გაქვთ.
      </p>

      <h2>1. ვინ ვართ</h2>
      <p>
        Tissu Shop · თბილისი, საქართველო · საკონტაქტო:{" "}
        <a href="mailto:hello@tissu.ge">hello@tissu.ge</a>. ქვემოთ აღწერილი ინფორმაციის მონაცემთა
        დამუშავებაზე პასუხისმგებელი სუბიექტი ვართ.
      </p>

      <h2>2. რა მონაცემებს ვაგროვებთ</h2>
      <h3>შეკვეთის გაფორმებისას</h3>
      <ul>
        <li>სახელი და გვარი</li>
        <li>ელფოსტა</li>
        <li>ტელეფონის ნომერი</li>
        <li>მიწოდების მისამართი</li>
        <li>შეკვეთის დეტალები (პროდუქტი, ფასი, დროის აღნიშვნა)</li>
      </ul>
      <h3>ანგარიშის რეგისტრაციისას</h3>
      <ul>
        <li>ელფოსტა და დაჰეშილი პაროლი (Supabase Auth-ის მეშვეობით)</li>
        <li>ნებაყოფლობითი პროფილის მონაცემები</li>
      </ul>
      <h3>გადახდის მონაცემები</h3>
      <p>
        ბარათის მონაცემებს <strong>არ ვინახავთ</strong>. გადახდას ამუშავებენ გარე პროვაიდერები
        (მაგ. Stripe, ბანკის გეითვეი). ბარათის მონაცემები მათ პირდაპირ ერგებათ — ჩვენ მხოლოდ
        ტრანზაქციის შედეგს ვიღებთ.
      </p>
      <h3>ტექნიკური მონაცემები</h3>
      <ul>
        <li>IP მისამართი და სავარაუდო მდებარეობა (უსაფრთხოებისა და ანალიტიკისთვის)</li>
        <li>ბრაუზერი და მოწყობილობის ტიპი</li>
        <li>ნანახი გვერდები და დრო (მცირე, ანონიმიზებული)</li>
      </ul>

      <h2>3. როგორ ვიყენებთ</h2>
      <ul>
        <li>შეკვეთის შესასრულებლად (მიწოდება, გადახდის დადასტურება, კონტაქტი)</li>
        <li>კლიენტის მხარდაჭერისთვის</li>
        <li>ქართული საგადასახადო კანონმდებლობასთან შესაბამისობისთვის</li>
        <li>საიტის გასაუმჯობესებლად (ანონიმიზებული ანალიტიკა)</li>
        <li>მარკეტინგული წერილებისთვის — <strong>მხოლოდ</strong> თანხმობის საფუძველზე</li>
      </ul>

      <h2>4. მესამე მხარეები, ვისაც ვუზიარებთ</h2>
      <ul>
        <li><strong>Supabase</strong> — ავტორიზაცია და ბაზის ჰოსტინგი</li>
        <li><strong>Cloudinary</strong> — პროდუქტის ფოტოების მიწოდება (კლიენტის მონაცემები არ იყრება)</li>
        <li><strong>Railway</strong> — აპლიკაციის ჰოსტინგი</li>
        <li><strong>გადახდის პროვაიდერი</strong> (Stripe / TBC / BOG) — შეკვეთის დასრულებისას</li>
        <li><strong>კურიერი</strong> — მიწოდებისთვის</li>
      </ul>
      <p>
        თქვენს მონაცემებს არ ვყიდით. სარეკლამო მიზნებისთვის კი არ ვუზიარებთ მკაფიო თანხმობის გარეშე.
      </p>

      <h2>5. რამდენ ხანს ვინახავთ</h2>
      <ul>
        <li>შეკვეთის ჩანაწერები: 7 წელი (საქართველოს საბუღალტრო კანონმდებლობით)</li>
        <li>ანგარიშის მონაცემები: ანგარიშის წაშლამდე</li>
        <li>ელფოსტის სიახლეების სია: გამოწერის გაუქმებამდე</li>
        <li>ანონიმიზებული ანალიტიკა: 26 თვემდე</li>
      </ul>

      <h2>6. თქვენი უფლებები</h2>
      <p>საქართველოს კანონითა და GDPR-ით (EU/EEA) გაქვთ შემდეგი უფლებები:</p>
      <ul>
        <li>მოითხოვოთ თქვენი მონაცემების ასლი</li>
        <li>გაასწოროთ არასწორი მონაცემები</li>
        <li>მოითხოვოთ წაშლა ("დავიწყების უფლება")</li>
        <li>შეაჩეროთ ან შეზღუდოთ გარკვეული დამუშავება</li>
        <li>მიიღოთ მონაცემები პორტატულ ფორმატში</li>
        <li>ნებისმიერ დროს გაუქმდეს მარკეტინგის თანხმობა</li>
      </ul>
      <p>
        მოგვწერეთ <a href="mailto:hello@tissu.ge">hello@tissu.ge</a>-ზე — ვუპასუხებთ 30 დღის
        განმავლობაში.
      </p>

      <h2>7. უსაფრთხოება</h2>
      <p>
        პაროლები დაჰეშილია (არასოდეს ინახება ღიად). საიტთან კომუნიკაცია HTTPS-ით ხორციელდება.
        პერსონალურ მონაცემებზე წვდომა შეზღუდულია უფლებამოსილ თანამშრომლებით. დარღვევის შემთხვევაში,
        დაზარალებულ მომხმარებლებსა და საქართველოს პერსონალურ მონაცემთა დაცვის სამსახურს 72 საათში
        ვაცნობებთ, როგორც კანონი მოითხოვს.
      </p>

      <h2>8. Cookies</h2>
      <p>
        ვიყენებთ მხოლოდ აუცილებელ cookies-ს (ავტორიზაცია, კალათა, ფუნქციონალი). შესაძლოა ვიყენოთ
        მინიმალური ანალიტიკის cookies. მესამე მხარის სარეკლამო cookies მხოლოდ თანხმობით.
      </p>

      <h2>9. ცვლილებები</h2>
      <p>
        შესაძლოა ეს პოლიტიკა განვაახლოთ. არსებითი ცვლილება გამოცხადდება საიტზე და, ანგარიშის
        მფლობელთათვის, ელფოსტით. ზემოთ მითითებული თარიღი ბოლო ცვლილებას ასახავს.
      </p>

      <h2>10. კონტაქტი</h2>
      <p>
        კითხვები ან მონაცემთა მოთხოვნა? მოგვწერეთ:{" "}
        <a href="mailto:hello@tissu.ge">hello@tissu.ge</a>.
      </p>
    </>
  );
}
