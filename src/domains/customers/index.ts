import {
  PrismaClient,
  type Customer,
  type CustomerAddress,
} from "@prisma/client";

const defaultPrisma = new PrismaClient();

export interface FindOrCreateCustomerParams {
  organizationId: string;
  whatsappNumber: string;
  whatsappName?: string | null;
}

export interface AddCustomerAddressData {
  label?: string;
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode?: string;
  reference?: string;
  isDefault?: boolean;
}

export async function findOrCreateCustomer(
  params: FindOrCreateCustomerParams,
  client: PrismaClient = defaultPrisma,
): Promise<Customer> {
  const normNumber = params.whatsappNumber.replace(/[^\d+]/g, "").trim();

  const existing = await client.customer.findUnique({
    where: {
      organizationId_whatsappNumber: {
        organizationId: params.organizationId,
        whatsappNumber: normNumber,
      },
    },
  });

  if (existing) {
    if (params.whatsappName && params.whatsappName !== existing.whatsappName) {
      return client.customer.update({
        where: { id: existing.id },
        data: { whatsappName: params.whatsappName },
      });
    }
    return existing;
  }

  return client.customer.create({
    data: {
      organizationId: params.organizationId,
      whatsappNumber: normNumber,
      whatsappName: params.whatsappName ?? null,
      displayName: params.whatsappName ?? normNumber,
    },
  });
}

export async function addCustomerAddress(
  customerId: string,
  addressData: AddCustomerAddressData,
  client: PrismaClient = defaultPrisma,
): Promise<CustomerAddress> {
  if (addressData.isDefault) {
    await client.customerAddress.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });
  }

  return client.customerAddress.create({
    data: {
      customerId,
      label: addressData.label ?? null,
      street: addressData.street,
      number: addressData.number,
      floor: addressData.floor ?? null,
      apartment: addressData.apartment ?? null,
      city: addressData.city,
      province: addressData.province,
      postalCode: addressData.postalCode ?? null,
      reference: addressData.reference ?? null,
      isDefault: addressData.isDefault ?? false,
    },
  });
}

export async function listCustomers(
  organizationId: string,
  search?: string,
  client: PrismaClient = defaultPrisma,
): Promise<Customer[]> {
  return client.customer.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            OR: [
              { whatsappNumber: { contains: search, mode: "insensitive" } },
              { displayName: { contains: search, mode: "insensitive" } },
              { whatsappName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      addresses: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
}
