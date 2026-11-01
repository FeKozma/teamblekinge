"use server";

import { boardOnly, invalid, isEmail, isISODate, isUrl, published, saved, text } from "@/components/admin/server";
import { getClub, saveClub } from "@/lib/content/club";
import { fullDate, todayISO } from "@/lib/format";

const digits = (s: string) => s.replace(/[\s-]/g, "");
/** Only digits, spaces and dashes, with this many digits. */
const numberLike = (s: string, ...counts: number[]) => /^[\d\s-]+$/.test(s) && counts.includes(digits(s).length);

export async function saveClubAction(data: FormData) {
  await boardOnly();
  const v = (name: string) => text(data, name).replace(/\s+/g, " ");
  const errors: Record<string, string> = {};
  const need = (name: string, message: string) => {
    const value = v(name);
    if (!value) errors[name] = message;
    return value;
  };

  const name = need("name", "Skriv föreningens namn.");
  const shortName = need("shortName", "Skriv ett kort namn, t.ex. Team Blekinge.");
  const founded = v("founded");
  if (!isISODate(founded) || founded > todayISO()) errors.founded = "Välj datumet då föreningen bildades.";
  const members = need("members", "Skriv hur många medlemmar ni är, t.ex. ”drygt 200”.");

  const fee = v("fee");
  if (!/^\d{1,5}$/.test(fee) || Number(fee) === 0) errors.fee = "Skriv avgiften i hela kronor, bara siffror, t.ex. 650.";
  const feeYear = v("feeYear");
  if (!/^\d{4}$/.test(feeYear) || Number(feeYear) < 1992 || Number(feeYear) > 2100) {
    errors.feeYear = "Skriv året med fyra siffror, t.ex. 2026.";
  }
  const swish = v("swish");
  if (!numberLike(swish, 10)) errors.swish = "Ett Swishnummer har tio siffror, t.ex. 123 240 37 49.";
  const bankgiro = v("bankgiro");
  if (!numberLike(bankgiro, 7, 8)) errors.bankgiro = "Ett bankgironummer har sju eller åtta siffror, t.ex. 866-1159.";

  const street = need("street", "Skriv gatuadressen.");
  const zip = v("zip");
  if (!numberLike(zip, 5)) errors.zip = "Ett postnummer har fem siffror, t.ex. 371 50.";
  const city = need("city", "Skriv orten.");
  const area = need("area", "Skriv området eller stadsdelen.");

  const contactName = need("contactName", "Skriv vem som är kontaktperson.");
  const contactRole = need("contactRole", "Skriv kontaktpersonens roll, t.ex. Ordförande.");
  const raceEmail = v("raceEmail");
  if (!isEmail(raceEmail)) errors.raceEmail = "Skriv en hel e-postadress, t.ex. register@teamblekinge.nu.";

  const links = { instagram: v("instagram"), facebookGroup: v("facebookGroup"), trimtexShop: v("trimtexShop") };
  for (const [field, url] of Object.entries(links)) {
    if (!isUrl(url)) errors[field] = "Klistra in hela adressen. Den börjar med https://";
  }

  const orgNr = v("orgNr");
  if (!numberLike(orgNr, 10)) errors.orgNr = "Ett organisationsnummer har tio siffror, t.ex. 835000-8911.";
  const foreningsNr = v("foreningsNr");
  if (!/^\d+$/.test(foreningsNr)) errors.foreningsNr = "Skriv föreningsnumret med bara siffror, t.ex. 27887.";

  if (Object.keys(errors).length) return invalid(errors);

  // Numbers are written the way they are printed: 123 240 37 49, 866-1159, 835000-8911, 371 50.
  const sw = digits(swish);
  const bg = digits(bankgiro);
  const org = digits(orgNr);
  const zipDigits = digits(zip);
  await saveClub({
    // Keep anything this form doesn't edit.
    ...(await getClub()),
    name,
    shortName,
    founded: fullDate(founded),
    foundedYear: Number(founded.slice(0, 4)),
    members,
    fee: Number(fee),
    feeYear: Number(feeYear),
    swish: `${sw.slice(0, 3)} ${sw.slice(3, 6)} ${sw.slice(6, 8)} ${sw.slice(8)}`,
    bankgiro: `${bg.slice(0, -4)}-${bg.slice(-4)}`,
    orgNr: `${org.slice(0, 6)}-${org.slice(6)}`,
    foreningsNr,
    address: { street, zip: `${zipDigits.slice(0, 3)} ${zipDigits.slice(3)}`, city, area },
    contact: { name: contactName, role: contactRole, raceEmail },
    ...links,
  });
  published();
  return saved("Föreningsuppgifterna är sparade.");
}
