import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { getPayment } from './lib/payments';
import type { PaymentParameters } from './models/payments';
import { z } from 'zod';

const pathParamsSchema = z.object({
  id: z.string().uuid()
}).strict();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const pathParamsRaw = event.pathParameters as unknown as PaymentParameters;
  const { data: pathParamsParsed, error: parseError } = pathParamsSchema.safeParse(pathParamsRaw);

  if (parseError) {
    console.error(parseError.issues);
    return buildResponse(422, { error: 'Invalid input' });
  }

  const paymentResult = await getPayment(pathParamsParsed.id);

  if (!paymentResult) {
    return buildResponse(404, { error: 'Payment not found' });
  }

  return buildResponse(200, { data: paymentResult });
};
