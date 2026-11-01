import type { Metadata } from "next";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { BandPreview } from "@/components/admin/announcement/BandPreview";
import { LinkPicker } from "@/components/admin/announcement/LinkPicker";
import { AdminForm, CheckboxField, FormSection, TextInput } from "@/components/admin/form";
import { getAnnouncement } from "@/lib/content/announcement";
import { listNews } from "@/lib/content/news";
import { getRaces } from "@/lib/content/races";
import { todayISO } from "@/lib/format";
import { saveAnnouncementAction } from "./actions";

export const metadata: Metadata = { title: "Aktuellt-bandet" };

const pages = [
  { value: "/trana-med-oss", label: "Träna med oss" },
  { value: "/trana-med-oss#prova-pa", label: "Träna med oss › Prova på" },
  { value: "/tavla", label: "Tävla" },
  { value: "/bli-medlem", label: "Bli medlem" },
  { value: "/nyheter", label: "Nyheter" },
  { value: "/kalender", label: "Kalendern" },
  { value: "/foreningen", label: "Föreningen" },
  { value: "/fragor", label: "Frågor & kontakt" },
];

export default async function AdminAnnouncementPage() {
  if (!(await requireBoard())) return null;
  const [a, races, news] = await Promise.all([getAnnouncement(), getRaces(), listNews()]);
  const today = todayISO();
  const options = [
    { group: "Våra lopp", items: races.map((r) => ({ value: `/tavla/${r.slug}`, label: r.name })) },
    { group: "Sidor", items: pages },
    { group: "Senaste nyheterna", items: news.slice(0, 6).map((n) => ({ value: `/nyheter/${n.slug}`, label: n.title })) },
  ];

  return (
    <AdminPage
      title="Aktuellt-bandet"
      intro="Den orange raden allra överst på startsidan. Använd den för det viktigaste just nu – ett lopp, en sista anmälningsdag, ett möte."
      publicHref="/"
      publicLabel="Visa startsidan"
    >
      <AdminForm action={saveAnnouncementAction} submitLabel="Spara bandet">
        <FormSection title="Förhandsvisning">
          <BandPreview initial={a} today={today} />
        </FormSection>
        <FormSection title="Visa eller dölj">
          <CheckboxField
            label="Visa bandet på startsidan"
            name="show"
            defaultChecked={a.show}
            hint="Ta bort bocken för att dölja bandet. Texterna sparas till nästa gång."
          />
          <TextInput
            label="Sista dag (frivilligt)"
            name="until"
            type="date"
            defaultValue={a.until}
            hint="Bandet döljs av sig självt dagen efter, t.ex. efter loppet. Lämna tomt för att visa det tills du tar bort bocken."
            className="max-w-[16rem]"
          />
        </FormSection>
        <FormSection title="Text och länk">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <TextInput
              label="Etikett"
              name="label"
              defaultValue={a.label}
              placeholder="Aktuellt"
              hint="Den lilla mörka etiketten först. Lämna tom för att ta bort den."
              className="md:col-span-2"
            />
            <TextInput
              label="Rubrik"
              name="title"
              defaultValue={a.title}
              hint="I fetstil. Håll den kort – den ska rymmas på en rad i mobilen."
              className="md:col-span-4"
            />
            <TextInput
              label="Extra text (frivillig)"
              name="text"
              defaultValue={a.text}
              hint="Efter rubriken. Visas inte på mobilen, där det är trångt."
              className="md:col-span-6"
            />
            <div className="md:col-span-3">
              <LinkPicker
                label="Länk"
                name="href"
                defaultValue={a.href}
                options={options}
                hint="Hela bandet blir klickbart och leder hit."
              />
            </div>
            <TextInput
              label="Länktext"
              name="linkText"
              defaultValue={a.linkText}
              placeholder="Anmäl dig"
              hint="Längst till höger, med en pil."
              className="md:col-span-3"
            />
          </div>
        </FormSection>
      </AdminForm>
    </AdminPage>
  );
}
