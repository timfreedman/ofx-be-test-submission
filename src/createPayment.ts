import { randomUUID } from 'crypto';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, parseInput } from './lib/apigateway';
import { createPayment, PaymentInput } from './lib/payments';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { amount, currency } = parseInput(event.body || '{}') as PaymentInput;

    const paymentId = randomUUID();

    await createPayment({
      id: paymentId,
      amount,
      currency
    });

    return buildResponse(201, { data: { id: paymentId } });
};
