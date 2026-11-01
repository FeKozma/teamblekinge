import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { VisibilityField } from "@/components/admin/documents/fields";
import { adminFolderHref } from "@/components/admin/documents/links";
import { AdminForm, FormSection, TextInput } from "@/components/admin/form";
import { getArchive } from "@/lib/content/documents";
import { folderLabel, folderTrail, folderVisibility } from "@/lib/data/documents";
import { createFolderAction } from "../../actions";

export const metadata: Metadata = { title: "Ny mapp" };

/** A new folder inside /admin/dokument/ny-mapp/<parent…> (the root when empty). */
export default async function NewFolderPage({ params }: PageProps<"/admin/dokument/ny-mapp/[[...path]]">) {
  if (!(await requireBoard())) return null;
  const [{ path = [] }, archive] = await Promise.all([params, getArchive()]);
  const trail = folderTrail(archive.root, path);
  if (!trail) notFound();
  const parent = trail[trail.length - 1];
  const limit = folderVisibility(archive.root, path);

  return (
    <AdminPage
      title="Ny mapp"
      intro={
        path.length
          ? `Mappen skapas i ${folderLabel(archive.root, path)}.`
          : "Mappen skapas överst under Dokument, bredvid Protokoll, Policys och de andra."
      }
      crumbs={trail.map((f, i) => ({ title: f.title, href: adminFolderHref(path.slice(0, i)) }))}
    >
      <AdminForm
        action={createFolderAction.bind(null, path.join("/"))}
        submitLabel="Skapa mappen"
        savedHint="Mappen syns direkt på webbplatsen – i demon bara för dig."
      >
        <FormSection title="Mappen">
          <TextInput label="Namn" name="title" placeholder="T.ex. Styrelsemöte 2027" hint="Visas på mappens kort och överst i mappen." />
          <TextInput
            label="Kort beskrivning (valfritt)"
            name="description"
            placeholder="T.ex. Protokoll och handlingar från årsmötena."
            hint="Visas under namnet på mappens kort."
          />
          <VisibilityField
            defaultValue={limit}
            limit={limit}
            limitName={path.length ? parent.title : undefined}
            legend="Vem får se mappen?"
          />
        </FormSection>
      </AdminForm>
    </AdminPage>
  );
}
