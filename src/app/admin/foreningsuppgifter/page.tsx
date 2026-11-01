import type { Metadata } from "next";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminForm, FormSection, TextInput } from "@/components/admin/form";
import { getClub } from "@/lib/content/club";
import { parseFullDate } from "@/lib/format";
import { saveClubAction } from "./actions";

export const metadata: Metadata = { title: "Föreningsuppgifter" };

const grid = "grid gap-4 sm:grid-cols-2";

export default async function AdminClubFactsPage() {
  if (!(await requireBoard())) return null;
  const club = await getClub();
  return (
    <AdminPage
      title="Föreningsuppgifter"
      intro="Fakta om föreningen som visas på flera sidor. Ändrar du något här, ändras det överallt där det visas."
      publicHref="/foreningen#foreningsuppgifter"
      publicLabel="Visa Föreningen"
    >
      <AdminForm action={saveClubAction} submitLabel="Spara uppgifterna">
        <FormSection title="Om föreningen">
          <div className={grid}>
            <TextInput
              label="Föreningens namn"
              name="name"
              defaultValue={club.name}
              hint="Visas under Föreningen och i sidfoten."
            />
            <TextInput
              label="Kort namn"
              name="shortName"
              defaultValue={club.shortName}
              hint="Används där hela namnet blir för långt, t.ex. i Googles sökresultat."
            />
            <TextInput
              type="date"
              label="Bildad"
              name="founded"
              defaultValue={parseFullDate(club.founded)}
              hint="Datumet visas under Föreningen, årtalet också på startsidan."
            />
            <TextInput
              label="Antal medlemmar"
              name="members"
              defaultValue={club.members}
              hint="Skriv det som det ska stå i en mening, t.ex. ”drygt 200”. Visas under Föreningen."
            />
          </div>
        </FormSection>

        <FormSection
          title="Medlemsavgift och betalning"
          description={
            <>
              Visas på Bli medlem och på startsidan. Svaret om avgiften under{" "}
              <Link href="/admin/vanliga-fragor" className="font-semibold">
                Vanliga frågor
              </Link>{" "}
              är skrivet för hand – ändra det också när avgiften ändras.
            </>
          }
        >
          <div className={grid}>
            <TextInput
              type="number"
              label="Medlemsavgift (kronor)"
              name="fee"
              defaultValue={club.fee}
              hint="Per person och år. Samma belopp visas för Torsdagsgruppen under Träna med oss."
            />
            <TextInput
              type="number"
              label="Avgiften gäller för år"
              name="feeYear"
              defaultValue={club.feeYear}
              hint="Visas också som år för styrelsen under Föreningen."
            />
            <TextInput
              type="tel"
              label="Swishnummer"
              name="swish"
              defaultValue={club.swish}
              hint="Tio siffror. Besökaren kan kopiera det på Bli medlem."
            />
            <TextInput
              label="Bankgiro"
              name="bankgiro"
              defaultValue={club.bankgiro}
              hint="Sju eller åtta siffror."
            />
          </div>
        </FormSection>

        <FormSection
          title="Klubblokalen"
          description="Visas under Föreningen, Träna med oss, Frågor & kontakt och i sidfoten, med en länk till kartan."
        >
          <div className={grid}>
            <TextInput label="Gatuadress" name="street" defaultValue={club.address.street} />
            <TextInput label="Område" name="area" defaultValue={club.address.area} hint="Stadsdelen, t.ex. Torskors." />
            <TextInput label="Postnummer" name="zip" defaultValue={club.address.zip} hint="Fem siffror." />
            <TextInput label="Ort" name="city" defaultValue={club.address.city} />
          </div>
        </FormSection>

        <FormSection title="Kontakt" description="Visas under Frågor & kontakt.">
          <div className={grid}>
            <TextInput
              label="Kontaktperson"
              name="contactName"
              defaultValue={club.contact.name}
              hint="Står också under Styrelsen på Föreningen."
            />
            <TextInput
              label="Kontaktpersonens roll"
              name="contactRole"
              defaultValue={club.contact.role}
              hint="T.ex. Ordförande. Står efter namnet."
            />
            <TextInput
              type="email"
              label="E-post för frågor om loppen"
              name="raceEmail"
              defaultValue={club.contact.raceEmail}
              hint="Visas också på varje lopps sida under Tävla."
              className="sm:col-span-2"
            />
          </div>
        </FormSection>

        <FormSection title="Länkar" description="Klistra in hela adressen från webbläsaren, den börjar med https://.">
          <TextInput
            type="url"
            label="Instagram"
            name="instagram"
            defaultValue={club.instagram}
            hint="Visas under Föreningen, Frågor & kontakt, på startsidan och i sidfoten."
          />
          <TextInput
            type="url"
            label="Facebookgruppen för medlemmar"
            name="facebookGroup"
            defaultValue={club.facebookGroup}
            hint="Visas under Föreningen, Frågor & kontakt och i sidfoten."
          />
          <TextInput
            type="url"
            label="Trimtex webbshop"
            name="trimtexShop"
            defaultValue={club.trimtexShop}
            hint="Knappen under Klubbkläder på Föreningen leder hit."
          />
        </FormSection>

        <FormSection title="Registreringsnummer" description="Visas under Föreningen och Frågor & kontakt.">
          <div className={grid}>
            <TextInput label="Organisationsnummer" name="orgNr" defaultValue={club.orgNr} hint="Tio siffror." />
            <TextInput label="Föreningsnummer" name="foreningsNr" defaultValue={club.foreningsNr} />
          </div>
        </FormSection>
      </AdminForm>
    </AdminPage>
  );
}
