import { redirect } from "next/navigation";

// Documents are the board's most common errand (and the only built section).
export default function AdminIndex() {
  redirect("/admin/dokument");
}
