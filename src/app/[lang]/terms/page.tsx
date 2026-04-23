import { Locale } from "@/i18n/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · Tissu",
  description: "The rules that apply when you shop on Tissu.",
};

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
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
              მომსახურების{" "}
              <em className="not-italic italic text-[var(--tissu-terracotta)]">პირობები</em>
            </>
          ) : (
            <>
              Terms of <em className="not-italic italic text-[var(--tissu-terracotta)]">service</em>
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
        These terms govern your use of <strong>Tissu Shop</strong> and any products you buy from us.
        By placing an order, you agree to them.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Tissu Shop is a small handmade studio based in Tbilisi, Georgia. All products are made to
        order or curated in small batches. Contact:{" "}
        <a href="mailto:hello@tissu.ge">hello@tissu.ge</a>.
      </p>

      <h2>2. Products</h2>
      <ul>
        <li>
          Our bags are handmade from water-resistant canvas. Small variations between pieces are
          part of the handmade character — they are not defects.
        </li>
        <li>Colours on your screen may differ slightly from the real fabric.</li>
        <li>Stock is limited. We update the shop as items sell.</li>
        <li>Necklaces are made to order (~7 days). Bags are ready-to-ship unless noted otherwise.</li>
      </ul>

      <h2>3. Prices and payment</h2>
      <ul>
        <li>Prices are in Georgian Lari (₾), VAT included where applicable.</li>
        <li>Payment is taken at checkout via our payment provider.</li>
        <li>We do not store card details. Refer to the Privacy Policy for details.</li>
        <li>
          We reserve the right to cancel an order if a product is mispriced due to an obvious error;
          we will refund any amount paid.
        </li>
      </ul>

      <h2>4. Shipping</h2>
      <ul>
        <li>We ship from Tbilisi. Domestic delivery typically 2–4 business days.</li>
        <li>Free shipping on orders over 150₾. Under that, shipping is shown at checkout.</li>
        <li>International shipping may be available on request; contact us before ordering.</li>
        <li>Risk of loss transfers to you once the courier accepts the package.</li>
      </ul>

      <h2>5. Returns and refunds</h2>
      <ul>
        <li>
          You may return unused, unwashed items within <strong>14 days</strong> of delivery for a
          refund.
        </li>
        <li>Return shipping is the customer's responsibility unless the item is defective.</li>
        <li>
          Made-to-order items (including necklaces customised with your fabric/shell choice) are
          non-refundable unless defective.
        </li>
        <li>Defective items are replaced or refunded at our cost.</li>
        <li>Refunds are issued to the original payment method within 14 days of receiving the return.</li>
      </ul>

      <h2>6. Accounts</h2>
      <ul>
        <li>You must provide accurate information when registering.</li>
        <li>You are responsible for your account's security (keep your password private).</li>
        <li>We may suspend or close accounts that abuse the site or violate these terms.</li>
      </ul>

      <h2>7. Intellectual property</h2>
      <p>
        The Tissu name, logo, photos, and site content are our property. You may not copy or reuse
        them commercially without written permission. Product designs remain our property; buying a
        bag does not transfer any IP rights.
      </p>

      <h2>8. User content</h2>
      <p>
        If you post reviews or share photos with us, you grant us a non-exclusive, royalty-free
        licence to use them on the site and in our marketing, with attribution where practical.
      </p>

      <h2>9. Liability</h2>
      <p>
        We are not liable for indirect or consequential damages arising from use of the site or
        products. Our total liability is limited to the amount you paid for the relevant order.
        Nothing in these terms excludes liability that cannot be excluded under Georgian consumer
        protection law.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these terms. Material changes will be announced on the site. Continued use
        after a change means you accept the updated terms.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the law of Georgia. Disputes are subject to the jurisdiction of
        Georgian courts.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions? Email <a href="mailto:hello@tissu.ge">hello@tissu.ge</a>.
      </p>
    </>
  );
}

function KaBody() {
  return (
    <>
      <p>
        ეს პირობები არეგულირებს <strong>Tissu Shop</strong>-ისა და ჩვენთან ნაყიდი პროდუქტების
        გამოყენებას. შეკვეთის განთავსებით ეთანხმებით მათ.
      </p>

      <h2>1. ვინ ვართ</h2>
      <p>
        Tissu Shop — ხელით ნაკერი ჩანთების მცირე სტუდიაა თბილისში. ყველა ნივთი შეკვეთით ან მცირე
        სერიებით იქმნება. საკონტაქტო:{" "}
        <a href="mailto:hello@tissu.ge">hello@tissu.ge</a>.
      </p>

      <h2>2. პროდუქტები</h2>
      <ul>
        <li>
          ჩვენი ჩანთები ხელითაა ნაკერი წყალგაუმტარი ტილოსგან. მცირე განსხვავებები ცალებს შორის —
          ხელით ნაწარმოების ნიშანია, არა ნაკლი.
        </li>
        <li>ფერი ეკრანზე შეიძლება ოდნავ განსხვავდებოდეს რეალურ ქსოვილისგან.</li>
        <li>მარაგი შეზღუდულია. საიტს ვანახლებთ, როცა პროდუქტი გაიყიდება.</li>
        <li>ყელსაბამები შეკვეთით იქმნება (~7 დღე). ჩანთები მზა მოდელებია, თუ სხვა მითითებული არ არის.</li>
      </ul>

      <h2>3. ფასი და გადახდა</h2>
      <ul>
        <li>ფასი მითითებულია ქართულ ლარში (₾), დღგ ჩათვლით, როცა ეს ვრცელდება.</li>
        <li>გადახდა ხორციელდება checkout-ზე ჩვენი გადახდის პროვაიდერის მეშვეობით.</li>
        <li>ბარათის მონაცემებს არ ვინახავთ. დეტალები იხ. პერსონალურ მონაცემთა პოლიტიკაში.</li>
        <li>
          თუ პროდუქტზე ფასი აშკარა შეცდომითაა მითითებული, შეკვეთის გაუქმების უფლება გვაქვს —
          გადახდილი თანხა სრულად დაბრუნდება.
        </li>
      </ul>

      <h2>4. მიწოდება</h2>
      <ul>
        <li>ვიგზავნით თბილისიდან. საქართველოში მიწოდება — 2–4 სამუშაო დღე.</li>
        <li>150₾-დან მიწოდება უფასოა. მისგან ქვემოთ — ღირებულება ჩანს checkout-ზე.</li>
        <li>საერთაშორისო მიწოდება შესაძლოა ინდივიდუალურად — მოგვწერეთ შეკვეთამდე.</li>
        <li>პროდუქტის დაკარგვის რისკი გადადის თქვენზე, როცა კურიერი მიიღებს ამანათს.</li>
      </ul>

      <h2>5. დაბრუნება და კომპენსაცია</h2>
      <ul>
        <li>
          გამოუყენებელი, გაურეცხავი ნივთის დაბრუნება შეგიძლიათ <strong>14 დღეში</strong> მიღებიდან.
        </li>
        <li>
          დაბრუნების ტრანსპორტირება მყიდველის ხარჯზეა, გარდა იმ შემთხვევისა, როცა ნივთი დეფექტიანია.
        </li>
        <li>
          შეკვეთით დამზადებული ნივთები (მათ შორის ინდივიდუალური ყელსაბამები) არ ექვემდებარება
          დაბრუნებას, თუ დეფექტიანი არ არის.
        </li>
        <li>დეფექტიან ნივთს ვცვლით ან ვაბრუნებთ თანხას საკუთარი ხარჯით.</li>
        <li>
          თანხა უბრუნდება გადახდის იმავე მეთოდით დაბრუნების მიღებიდან 14 დღეში.
        </li>
      </ul>

      <h2>6. ანგარიშები</h2>
      <ul>
        <li>რეგისტრაციისას უნდა მიუთითოთ სწორი მონაცემები.</li>
        <li>ანგარიშის უსაფრთხოებაზე (პაროლი) თქვენ ხართ პასუხისმგებელი.</li>
        <li>
          შეგვიძლია შევაჩეროთ ან დავხუროთ ანგარიში, რომელიც ბოროტად იყენებს საიტს ან არღვევს ამ
          პირობებს.
        </li>
      </ul>

      <h2>7. ინტელექტუალური საკუთრება</h2>
      <p>
        Tissu-ს სახელი, ლოგო, ფოტოები და საიტის შიგთავსი ჩვენი საკუთრებაა. მათი კომერციული
        გამოყენება წერილობითი ნებართვის გარეშე აკრძალულია. პროდუქტის დიზაინი ჩვენი რჩება — ჩანთის
        ყიდვა არ გადასცემს ინტელექტუალურ უფლებებს.
      </p>

      <h2>8. მომხმარებლის შიგთავსი</h2>
      <p>
        თუ დაგვიტოვებთ შეფასებას ან გაგვიზიარებთ ფოტოს, ამით გვაძლევთ არა-ექსკლუზიურ, უფასო
        ლიცენზიას, გამოვიყენოთ ისინი საიტზე და მარკეტინგში, სადაც პრაქტიკულია — ავტორის მითითებით.
      </p>

      <h2>9. პასუხისმგებლობა</h2>
      <p>
        არ ვიღებთ პასუხისმგებლობას არაპირდაპირ ან შედეგობრივ ზარალზე, რომელიც საიტის ან პროდუქტის
        გამოყენებიდან გამომდინარეობს. ჩვენი ჯამური პასუხისმგებლობა შემოიფარგლება შესაბამის შეკვეთაზე
        თქვენ მიერ გადახდილი თანხით. ამ პირობებში არაფერი გამორიცხავს პასუხისმგებლობას, რომელიც
        საქართველოს მომხმარებელთა უფლებების კანონმდებლობით ვერ გამოირიცხება.
      </p>

      <h2>10. ცვლილებები</h2>
      <p>
        შესაძლოა ეს პირობები განვაახლოთ. არსებითი ცვლილება გამოცხადდება საიტზე. ცვლილების შემდეგ
        გამოყენების გაგრძელება ნიშნავს, რომ ახალ პირობებს ეთანხმებით.
      </p>

      <h2>11. მოქმედი კანონი</h2>
      <p>
        ამ პირობებს არეგულირებს საქართველოს კანონმდებლობა. დავები განიხილება საქართველოს სასამართლოების
        იურისდიქციაში.
      </p>

      <h2>12. კონტაქტი</h2>
      <p>
        შეკითხვები? მოგვწერეთ <a href="mailto:hello@tissu.ge">hello@tissu.ge</a>.
      </p>
    </>
  );
}
