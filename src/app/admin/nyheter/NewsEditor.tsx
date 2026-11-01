import Link from "next/link";
import { AdminForm, FormSection, ImageField, SelectInput, TextArea, TextInput } from "@/components/admin/form";
import type { FormState } from "@/components/admin/form-state";
import { IconBell, IconEye } from "@/components/icons";
import { commentCount, newsCategories, type NewsItem } from "@/lib/data/news";
import { ChoiceCards } from "./ChoiceCards";
import { DeleteNewsButton } from "./DeleteNews";
import { audiences } from "./options";
import { RegistrationFields } from "./RegistrationFields";

const categoryOptions = newsCategories.map((c) => ({ value: c, label: c }));

/** The form for writing a news item (no `item`) or changing one. */
export function NewsEditor({
  item,
  action,
  today,
}: {
  item?: NewsItem;
  action: (data: FormData) => Promise<FormState>;
  today: string;
}) {
  return (
    <AdminForm
      action={action}
      submitLabel={item ? "Spara ändringarna" : "Publicera nyheten"}
      savedHint={
        item
          ? "Syns direkt på webbplatsen – i demon bara för dig."
          : "Nyheten publiceras när du trycker på knappen – i demon syns den bara för dig."
      }
      secondary={
        item && (
          <>
            {/* Phones: the page header has this link; keep the bar to two rows. */}
            <Link
              href={`/nyheter/${item.slug}`}
              target="_blank"
              className="btn btn-outline hidden min-h-12 bg-white sm:inline-flex"
            >
              <IconEye size={18} /> Visa nyheten
              <span className="sr-only">(öppnas i ny flik)</span>
            </Link>
            <DeleteNewsButton slug={item.slug} title={item.title} comments={commentCount(item)} />
          </>
        )
      }
    >
      <FormSection title="Nyheten">
        <TextInput
          label="Rubrik"
          name="title"
          defaultValue={item?.title}
          hint="Kort och tydlig. Den syns i listor, på startsidan och i mejlen till dem som följer kategorin."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Kategori"
            name="category"
            options={categoryOptions}
            defaultValue={item?.category ?? newsCategories[0]}
            hint="Medlemmar kan välja att få mejl om nya nyheter i en kategori."
          />
          <TextInput
            type="date"
            label="Datum"
            name="date"
            defaultValue={item?.date ?? today}
            hint="Nyheterna visas med den senaste först."
          />
        </div>
        <ChoiceCards
          legend="Vem får läsa?"
          name="audience"
          options={audiences}
          defaultValue={item?.membersOnly ? "medlemmar" : "alla"}
        />
        <TextArea
          label="Ingress"
          name="excerpt"
          rows={3}
          defaultValue={item?.excerpt}
          hint="En eller två meningar om vad nyheten handlar om. Visas i listan på Nyheter och på startsidan."
        />
        <TextArea
          label="Text"
          name="body"
          rows={10}
          defaultValue={item?.body.join("\n\n")}
          hint="Lämna en tom rad mellan styckena."
        />
      </FormSection>

      <FormSection title="Bild" description="Frivilligt. Utan bild visas klubbens emblem.">
        <ImageField label="Bild" name="image" current={item?.image} />
        <TextInput
          label="Bildtext"
          name="imageAlt"
          defaultValue={item?.imageAlt}
          hint="Beskriv kort vad bilden visar, t.ex. ”Två löpare i klubbdräkten”. Den läses upp för den som inte ser bilden."
        />
      </FormSection>

      <FormSection
        title="Viktigt nu"
        description="En fäst nyhet ligger överst på Nyheter och på medlemmarnas startsida. Högst två visas åt gången – den som slutar först står först."
      >
        <TextInput
          type="date"
          label="Visa under Viktigt nu till och med"
          name="pinnedUntil"
          defaultValue={item?.pinnedUntil}
          hint="Lämna tomt om nyheten inte ska fästas. Töm fältet för att ta bort den från Viktigt nu."
          className="max-w-[320px]"
        />
      </FormSection>

      <FormSection
        title="Anmälan"
        description="Ska medlemmarna kunna anmäla sig till något? Rutan visas under texten i nyheten."
      >
        <RegistrationFields initial={item?.registration} />
      </FormSection>

      {!item && (
        <p className="m-0 flex items-start gap-2.5 rounded-xl border border-dashed border-purple/40 bg-purple-soft px-4 py-3 text-[14px]">
          <IconBell size={18} className="mt-0.5 flex-none text-purple" />
          <span>
            <strong>När du publicerar</strong> får medlemmar som följer kategorin ett mejl – direkt, i
            dagssammanfattningen eller i veckobrevet, som var och en har valt. I demon skickas inga mejl.
          </span>
        </p>
      )}
    </AdminForm>
  );
}
