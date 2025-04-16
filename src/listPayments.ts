import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { listPayments } from './lib/payments';
import type { PaymentFilters } from './models/payments';
import { z } from 'zod';
import { ControllerResult } from './models/controller';
import { apiErrorResponse, apiSuccessResponse } from './lib/apiResponse';

const filterSchema = z.object({
  currency: z.string().toUpperCase().length(3).optional()
}).strict();

async function listPaymentsController(event: APIGatewayProxyEvent): Promise<ControllerResult> {
  const filtersRaw = event.queryStringParameters || {} as PaymentFilters;
  let { data: filtersParsed, error: parseError } = filterSchema.safeParse(filtersRaw);

  if (parseError) {
    console.error(parseError.issues);
    return { result: apiErrorResponse('Invalid input'), statusCode: 422 };
  }

  const payments = await listPayments(filtersParsed as PaymentFilters);

  return { result: apiSuccessResponse(payments), statusCode: 200 };
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { result, statusCode } = await listPaymentsController(event);
  return buildResponse(statusCode, result);
};
