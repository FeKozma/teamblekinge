import type { Metadata } from "next";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { DocAccessFields, PdfField } from "@/components/admin/documents/fields";
import { adminFolderHref } from "@/components/admin/documents/links";
import { folderOptions, kindOptions } from "@/components/admin/documents/options";
import { AdminForm, FormSection, SelectInput, TextArea, TextInput } from "@/components/admin/form";
import { IconInfo } from "@/components/icons";
import { getArchive } from "@/lib/content/documents";
import { folderHref, folderTrail } from "@/lib/data/documents";
import { uploadDocumentAction } from "../../actions";

export const metadata: Metadata = { title: "Ladda upp dokument" };

/** Any PDF into any folder; /admin/dokument/ladda-upp/<folder…> starts with that folder chosen. */
export default async function UploadDocumentPage({ params }: PageProps<"/admin/dokument/ladda-upp/[[...path]]">) {
  if (!(await requireBoard())) return null;
  const [{ path = [] }, archive] = await Promise.all([params, getArchive()]);
  const folders = folderOptions(archive.root);
  const chosen = folderTrail(archive.root, path) && path.length ? path.join("/") : (folders[0]?.path ?? "");
  const chosenPath = chosen.split("/").filter(Boolean);
  const trail = folderTrail(archive.root, chosenPath) ?? [archive.root];

  return (
    <AdminPage
      title="Ladda upp dokument"
      intro="Lägg upp en PDF – en policy, en instruktion, ett underlag – i valfri mapp och välj vem som får se den."
      crumbs={trail.map((f, i) => ({ title: f.title, href: adminFolderHref(chosenPath.slice(0, i)) }))}
      publicHref={folderHref(chosenPath)}
      publicLabel="Visa mappen"
    >
      <p className="m-0 flex max-w-[640px] gap-2.5 rounded-[10px] border border-dashed border-purple/40 bg-purple-soft px-4 py-3 text-[14px]">
        <IconInfo size={18} className="mt-0.5 flex-none text-purple" />
        <span>
          Ska du lägga upp ett protokoll? Använd{" "}
          <Link href="/admin/dokument#ladda-upp-protokoll" className="font-semibold">
            Ladda upp protokoll
          </Link>{" "}
          – där räcker mötesdatumet, så får protokollet rätt namn och hamnar i rätt mapp.
        </span>
      </p>
      <AdminForm
        action={uploadDocumentAction}
        submitLabel="Ladda upp"
        savedHint="Dokumentet syns direkt på webbplatsen – i demon bara för dig."
      >
        <FormSection title="Filen">
          <PdfField label="PDF-fil" fillTitle />
        </FormSection>

        <FormSection title="Om dokumentet">
          <TextInput
            label="Namn"
            name="title"
            placeholder="T.ex. Drogpolicy"
            hint="Så heter dokumentet i listan och på dess sida. Fylls i från filnamnet – ändra gärna."
          />
          <SelectInput label="Typ av dokument" name="kind" defaultValue="underlag" options={kindOptions} />
          <TextArea
            label="Kort sammanfattning (valfritt)"
            name="summary"
            rows={3}
            placeholder="Vad står det i dokumentet, i en eller två meningar?"
            hint="Visas på dokumentets sida och i nyheten, högst 280 tecken."
          />
        </FormSection>

        <DocAccessFields
          folders={folders}
          defaultFolder={chosen}
          defaultVisibility="medlemmar"
          folderHint="Saknas mappen? Skapa den först med ”Ny mapp” i mappen den ska ligga i."
          announce={{ defaultChecked: false }}
        />
      </AdminForm>
    </AdminPage>
  );
}
