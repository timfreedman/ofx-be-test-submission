import { randomUUID } from 'crypto';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, parseInput } from './lib/apigateway';
import { createPayment } from './lib/payments';
import type { PaymentInput } from './models/payments';
import { z } from 'zod';

const paymentSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().min(3).max(3)
}).strict();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const paymentDataRaw = parseInput(event.body || '{}') as PaymentInput;
    let { data: paymentDataParsed, error: parseError } = paymentSchema.safeParse(paymentDataRaw);

    if (parseError) {
      console.error(parseError.issues);
      return buildResponse(422, { error: 'Invalid input' });
    }

    const { amount, currency } = paymentDataParsed as PaymentInput;
    const paymentId = randomUUID();

    await createPayment({
      id: paymentId,
      amount,
      currency
    });

    return buildResponse(201, { data: { id: paymentId } });
};
