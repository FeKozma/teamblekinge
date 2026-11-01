import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireBoard } from "@/components/admin/access";
import { AdminPage } from "@/components/admin/AdminPage";
import { ConfirmDelete } from "@/components/admin/documents/ConfirmDelete";
import { VisibilityField } from "@/components/admin/documents/fields";
import { adminFolderHref } from "@/components/admin/documents/links";
import { AdminForm, FormSection, TextInput } from "@/components/admin/form";
import { getArchive } from "@/lib/content/documents";
import { folderHref, folderTrail, folderVisibility, samePath, startsWith } from "@/lib/data/documents";
import { deleteFolderAction, saveFolderAction } from "../../actions";

type Props = PageProps<"/admin/dokument/mapp/[...path]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const folder = folderTrail((await getArchive()).root, path)?.at(-1);
  return { title: folder ? `Ändra ${folder.title}` : "Ändra mappen" };
}

/** Rename a folder, describe it, choose who may see it — or delete it when it's empty. */
export default async function EditFolderPage({ params }: Props) {
  if (!(await requireBoard())) return null;
  const [{ path }, archive] = await Promise.all([params, getArchive()]);
  const trail = folderTrail(archive.root, path);
  if (!trail || !path.length) notFound();
  const folder = trail[trail.length - 1];
  const parent = trail[trail.length - 2];
  const limit = folderVisibility(archive.root, path.slice(0, -1));
  const docsHere = archive.docs.filter((d) => samePath(d.folder, path)).length;
  const below = archive.docs.filter((d) => startsWith(d.folder, path)).length;
  const subfolders = folder.folders?.length ?? 0;
  const contents = [
    subfolders && (subfolders === 1 ? "1 mapp" : `${subfolders} mappar`),
    docsHere && (docsHere === 1 ? "1 dokument" : `${docsHere} dokument`),
  ].filter(Boolean);

  return (
    <AdminPage
      title={`Ändra ${folder.title}`}
      intro="Byt namn, beskrivning eller vem som får se mappen."
      crumbs={trail.map((f, i) => ({ title: f.title, href: adminFolderHref(path.slice(0, i)) }))}
      publicHref={folderHref(path)}
      publicLabel="Visa mappen"
    >
      <AdminForm
        key={path.join("/")}
        action={saveFolderAction.bind(null, path.join("/"))}
        submitLabel="Spara mappen"
        secondary={
          <ConfirmDelete
            label="Ta bort mappen"
            title={`Ta bort ${folder.title}?`}
            action={deleteFolderAction.bind(null, path.join("/"))}
            blocked={
              contents.length > 0 ? (
                <p className="m-0">
                  {folder.title} innehåller {contents.join(" och ")}. Bara tomma mappar kan tas bort, så att inget
                  försvinner av misstag. Flytta eller ta bort det som ligger i mappen först.
                </p>
              ) : undefined
            }
          >
            <p className="m-0">Mappen är tom och tas bort från sidan Dokument. Länkar till den slutar fungera.</p>
          </ConfirmDelete>
        }
      >
        <FormSection
          title="Mappen"
          description="Länken till mappen ändras inte när du byter namn, så länkar som redan delats fortsätter att fungera."
        >
          <TextInput label="Namn" name="title" defaultValue={folder.title} />
          <TextInput
            label="Kort beskrivning (valfritt)"
            name="description"
            defaultValue={folder.description}
            hint="Visas under namnet på mappens kort."
          />
          <VisibilityField
            defaultValue={folder.visibility}
            limit={limit}
            limitName={path.length > 1 ? parent.title : undefined}
            legend="Vem får se mappen?"
          />
          {below > 0 && (
            <p className="m-0 text-[13px] text-muted">
              Gäller allt i mappen ({below === 1 ? "1 dokument" : `${below} dokument`}): ett dokument kan aldrig vara
              mer öppet än mappen det ligger i.
            </p>
          )}
        </FormSection>
      </AdminForm>
    </AdminPage>
  );
}
