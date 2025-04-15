import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/createPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';

async function listPaymentsHandler() {
  const result = await handler({} as unknown as APIGatewayProxyEvent);
  return result;
}

describe('When the user requests to retrieve a list of payments', () => {
    it('Returns a list of payments when no filtering is applied', async () => {
      const paymentId = randomUUID();
      const mockPayments = [{
          id: paymentId,
          currency: 'AUD',
          amount: 2000,
      }];
      const getPaymentMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(mockPayments);

      const result = await listPaymentsHandler();

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toStrictEqual(mockPayments);
      expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });

    it('Returns a filtered list of payments by currency', async () => { });

    it('Returns with a validation error if the payment input data is not valid', async () => { });
});

afterEach(() => {
    jest.resetAllMocks();
});
