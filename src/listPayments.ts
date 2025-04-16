import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { listPayments } from './lib/payments';
import type { PaymentFilters } from './models/payments';
import { z } from 'zod';

const filterSchema = z.object({
  currency: z.string().toUpperCase().length(3).optional()
}).strict();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const filtersRaw = event.queryStringParameters || {} as PaymentFilters;
    let { data: filtersParsed, error: parseError } = filterSchema.safeParse(filtersRaw);

    if (parseError) {
      console.error(parseError.issues);
      return buildResponse(422, { error: 'Invalid input' });
    }

    const payments = await listPayments(filtersParsed as PaymentFilters);
    return buildResponse(200, { data: payments });
};
