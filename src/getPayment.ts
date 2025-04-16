import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { getPayment } from './lib/payments';
import type { PaymentParameters } from './models/payments';
import { z } from 'zod';
import { apiErrorResponse, apiSuccessResponse } from './lib/apiResponse';
import type { ControllerResult } from './models/controller';

const pathParamsSchema = z.object({
  id: z.string().uuid()
}).strict();

async function getPaymentsController(event: APIGatewayProxyEvent): Promise<ControllerResult> {
  const pathParamsRaw = event.pathParameters as unknown as PaymentParameters;
  const { data: pathParamsParsed, error: parseError } = pathParamsSchema.safeParse(pathParamsRaw);

  if (parseError) {
    console.error(parseError.issues);
    return { result: apiErrorResponse('Invalid input'), statusCode: 422 };
  }

  const paymentResult = await getPayment(pathParamsParsed.id);

  if (!paymentResult) {
    return { result: apiErrorResponse('Payment not found'), statusCode: 404 };
  }

  return { result: apiSuccessResponse(paymentResult), statusCode: 200 };
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { result, statusCode } = await getPaymentsController(event);
  return buildResponse(statusCode, result);
};
