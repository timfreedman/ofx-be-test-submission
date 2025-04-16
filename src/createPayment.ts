import { randomUUID } from 'crypto';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, parseInput } from './lib/apigateway';
import { createPayment } from './lib/payments';
import type { PaymentInput } from './models/payments';
import { z } from 'zod';
import { ControllerResult } from './models/controller';
import { apiErrorResponse, apiSuccessResponse } from './lib/apiResponse';
import * as currencyCodes from 'currency-codes';

const { codes: codeList } = currencyCodes;

const paymentSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().toUpperCase().length(3).refine((val) => codeList().includes(val))
}).strict();

async function createPaymentController(event: APIGatewayProxyEvent): Promise<ControllerResult> {
  const paymentDataRaw = parseInput(event.body || '{}') as PaymentInput;
  let { data: paymentDataParsed, error: parseError } = paymentSchema.safeParse(paymentDataRaw);

  if (parseError) {
    console.error(parseError.issues);
    return { result: apiErrorResponse('Invalid input'), statusCode: 422 };
  }

  const { amount, currency } = paymentDataParsed as PaymentInput;
  const paymentId = randomUUID();

  await createPayment({
    id: paymentId,
    amount,
    currency
  });

  return { result: apiSuccessResponse({ id: paymentId }), statusCode: 201 };
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { result, statusCode } = await createPaymentController(event);
    return buildResponse(statusCode, result);
};
