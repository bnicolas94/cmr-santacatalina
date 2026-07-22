import { getCurrentUser } from "../../../src/domains/auth/index.ts";
import {
  listCustomers,
  findOrCreateCustomer,
} from "../../../src/domains/customers/index.ts";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;

  const customers = await listCustomers(user.organizationId, search);

  return Response.json({ status: "ok", customers });
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const body = await request.json();
  const { whatsappNumber, whatsappName } = body || {};

  if (!whatsappNumber || typeof whatsappNumber !== "string") {
    return Response.json(
      { error: "El número de WhatsApp es obligatorio." },
      { status: 400 },
    );
  }

  const customer = await findOrCreateCustomer({
    organizationId: user.organizationId,
    whatsappNumber,
    whatsappName,
  });

  return Response.json({ status: "ok", customer }, { status: 201 });
}
