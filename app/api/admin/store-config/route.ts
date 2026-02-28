import { StoreConfigService } from "@/src/server/services/store-config-service";
import { toErrorResponse } from "@/src/server/shared/http";
import { storeConfigUpdateInputSchema } from "@/src/server/validators/store-config";

const storeConfigService = new StoreConfigService();

export async function GET() {
  try {
    const result = await storeConfigService.get();
    return Response.json(result.value, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const parsedInput = storeConfigUpdateInputSchema.parse(await request.json());
    const result = await storeConfigService.update(parsedInput);
    return Response.json(result.value, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
