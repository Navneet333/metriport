import { Address } from "../domain/address";
import { PatientData } from "../domain/patient";

/**
 * Takes in patient data and normalizes it by splitting the first and last names,
 * normalizing email and phone numbers, and formatting the address.
 *
 * @param patient - The patient data.
 * @returns a normalized version of the patient data. If the patient data is valid, it will return the
 *    normalized patient data as an object of type `Patient`. If the patient data is null, it will
 *    return null.
 */
export function normalizePatient<T extends PatientData>(patient: T): T {
  // array destructuring to extract the first element of the array with defaults
  const [firstName = patient.firstName] = splitName(normalizeString(patient.firstName));
  const [lastName = patient.lastName] = splitName(normalizeString(patient.lastName));

  const normalizedPatient: T = {
    ...patient,
    firstName,
    lastName,
    contact: (patient.contact ?? []).map(contact => ({
      ...contact,
      email: contact.email ? normalizeEmail(contact.email) : contact.email,
      phone: contact.phone ? normalizePhoneNumber(contact.phone) : contact.phone,
    })),
    address: (patient.address ?? []).map(addr => {
      const newAddress: Address = {
        addressLine1: normalizeAddress(addr.addressLine1),
        city: normalizeString(addr.city),
        zip: normalizeZipCode(addr.zip),
        state: addr.state,
        country: addr.country || "USA",
      };
      if (addr.addressLine2) {
        newAddress.addressLine2 = normalizeAddress(addr.addressLine2);
      }
      return newAddress;
    }),
  };
  return normalizedPatient;
}

/**
 * Normalizes a zip code by taking the first 5 characters.
 * @param zipCode - The zip code to be normalized.
 * @returns The normalized zip code as a string.
 */
function normalizeZipCode(zipCode: string): string {
  return zipCode.slice(0, 5);
}

/**
 * The normalizeString function takes a string as input, removes leading and trailing whitespace,
 * converts all characters to lowercase, and removes any apostrophes or hyphens.
 * @param {string} str - The `str` parameter is a string that represents the input string that needs to
 * be normalized.
 * @returns a normalized version of the input string.
 */
function normalizeString(str: string): string {
  return str.trim().toLowerCase(); //.replace(/['-]/g, "");
}

/**
 * Normalizes an email address by removing leading and trailing spaces, converting all characters to lowercase
 *
 * @param email - The email address to be normalized.
 * @returns The normalized email address.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes a phone number by removing all non-numeric characters and, if applicable, removing the country code.
 * @param phoneNumber - The phone number to be normalized.
 * @returns The normalized phone number as a string.
 */
function normalizePhoneNumber(phoneNumber: string): string {
  const normalizedNumber = phoneNumber.replace(/\D/g, "");

  if (normalizedNumber.startsWith("1") && normalizedNumber.length === 11) {
    // applies to US and Canada numbers only
    return normalizedNumber.substring(1);
  }

  return normalizedNumber;
}

// TODO maybe want to have a rule that we will only normalize a single word in the address. If there are multiple, then
// we will not normalize. This is because we don't want to normalize something like "123 boulevard rd" to "123 blvd rd"

/**
 * The function `normalizeAddress` takes a string representing an address and replaces common street
 * suffixes with their abbreviated forms.
 * @param {string} address - The `address` parameter is a string that represents a street address.
 * @returns The function `normalizeAddress` returns a string.
 */
export function normalizeAddress(address: string): string {
  return normalizeString(address);
}

export function splitName(name: string): string[] {
  // splits by comma delimiter and filters out empty strings
  return name.split(/[\s,]+/).filter(str => str);
}
