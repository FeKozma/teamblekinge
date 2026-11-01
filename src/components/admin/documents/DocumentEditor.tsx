import { deleteDocumentAction, saveDocumentAction } from "@/app/admin/dokument/actions";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminForm, FormSection, SelectInput, TextArea, TextInput } from "@/components/admin/form";
import { docFileHref, docHref, folderTrail, type DocArchive, type DocFile } from "@/lib/data/documents";
import { ConfirmDelete } from "./ConfirmDelete";
import { DocAccessFields, PdfField } from "./fields";
import { FlashToast } from "./FlashToast";
import { adminFolderHref } from "./links";
import { folderOptions, kindOptions } from "./options";

/** Edit one document: its file, name, type, folder (a move) and who may see it — or delete it. */
export function DocumentEditor({ archive, doc, flash }: { archive: DocArchive; doc: DocFile; flash?: string }) {
  const trail = folderTrail(archive.root, doc.folder) ?? [archive.root];
  const crumbs = trail.map((f, i) => ({ title: f.title, href: adminFolderHref(doc.folder.slice(0, i)) }));
  return (
    <AdminPage
      title={doc.title}
      intro="Byt namn, flytta till en annan mapp, ändra vem som får se dokumentet eller byt filen."
      crumbs={crumbs}
      publicHref={docHref(doc)}
      publicLabel="Visa dokumentet"
    >
      {flash && <FlashToast message={flash} />}
      <AdminForm
        action={saveDocumentAction.bind(null, doc.id)}
        submitLabel="Spara dokumentet"
        secondary={
          <ConfirmDelete
            label="Ta bort"
            title={`Ta bort ${doc.title}?`}
            action={deleteDocumentAction.bind(null, doc.id)}
          >
            <p className="m-0">
              Dokumentet tas bort från sidan Dokument{doc.file ? " tillsammans med PDF-filen" : ""}, och länkar till
              det slutar fungera. Det går inte att ångra.
            </p>
            {doc.announced?.newsSlug && (
              <p className="m-0">Nyheten som meddelade dokumentet finns kvar, men länken till dokumentet tas bort.</p>
            )}
          </ConfirmDelete>
        }
      >
        <FormSection
          title="Filen"
          description={
            doc.file
              ? "PDF:en som öppnas när någon trycker ”Öppna PDF”. Välj en ny fil om du vill byta – den gamla tas bort när du sparar."
              : "Det här dokumentet har ingen riktig fil i demon, så ”Öppna PDF” visar en exempelsida. Ladda upp en PDF så används den i stället."
          }
        >
          {/* A new key once the file is replaced, so the picker empties after saving. */}
          <PdfField
            key={doc.file ?? "seed"}
            label="PDF-fil"
            current={{ name: doc.fileName, size: doc.size, pages: doc.pages, href: docFileHref(doc) }}
          />
        </FormSection>

        <FormSection title="Om dokumentet">
          <TextInput
            label="Namn"
            name="title"
            defaultValue={doc.title}
            hint="Visas i listan och överst på dokumentets sida. Länken till dokumentet ändras inte."
          />
          <SelectInput label="Typ av dokument" name="kind" defaultValue={doc.kind} options={kindOptions} />
          <TextArea
            label="Kort sammanfattning (valfritt)"
            name="summary"
            rows={3}
            defaultValue={doc.summary}
            hint="Visas på dokumentets sida, högst 280 tecken."
          />
        </FormSection>

        <DocAccessFields
          folders={folderOptions(archive.root)}
          defaultFolder={doc.folder.join("/")}
          defaultVisibility={doc.visibility}
          folderHint="Flyttar du dokumentet får det en ny länk. Länken i nyheten som meddelade det följer med automatiskt."
          announce={{ already: !!doc.announced, defaultChecked: false }}
        />
      </AdminForm>
    </AdminPage>
  );
}
