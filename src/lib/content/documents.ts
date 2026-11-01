import "server-only";
import { seedArchive, type DocArchive } from "@/lib/data/documents";
import { readCollection, writeCollection } from "./store";

// The document archive: the folder tree and every document's details, in one
// collection so a protocol and the year folder it creates are saved together.
// The PDFs themselves are uploads (store.saveUpload), served with an access
// check by /filer/dokument/….

const KEY = "documents";

/** Folders and documents, as last saved in the admin. */
export function getArchive() {
  return readCollection<DocArchive>(KEY, seedArchive);
}

export function saveArchive(archive: DocArchive) {
  return writeCollection(KEY, archive);
}
