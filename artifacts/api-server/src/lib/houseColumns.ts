import { housesTable, usersTable } from "@workspace/db";

/**
 * Columns returned for a house everywhere in the API (list, detail, favorites).
 * Requires a left/inner join of usersTable on housesTable.landlordId.
 */
export const houseColumns = {
  id: housesTable.id,
  landlordId: housesTable.landlordId,
  landlordName: usersTable.name,
  landlordPhone: usersTable.phone,
  title: housesTable.title,
  description: housesTable.description,
  rentPrice: housesTable.rentPrice,
  propertyType: housesTable.propertyType,
  contactPhone: housesTable.contactPhone,
  bedrooms: housesTable.bedrooms,
  bathrooms: housesTable.bathrooms,
  county: housesTable.county,
  town: housesTable.town,
  estate: housesTable.estate,
  city: housesTable.city,
  address: housesTable.address,
  latitude: housesTable.latitude,
  longitude: housesTable.longitude,
  status: housesTable.status,
  images: housesTable.images,
  amenities: housesTable.amenities,
  createdAt: housesTable.createdAt,
  updatedAt: housesTable.updatedAt,
};
