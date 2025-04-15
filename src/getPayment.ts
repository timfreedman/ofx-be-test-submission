import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { getPayment } from './lib/payments';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { id: paymentId } = event.pathParameters as { id: string };

  const paymentResult = await getPayment(paymentId);

  if (!paymentResult) {
    return buildResponse(404, { error: 'Payment not found' });
  }

  return buildResponse(200, paymentResult);
};
