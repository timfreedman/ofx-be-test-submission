import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/createPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';
import type { PaymentInput } from '../src/lib/payments';

async function createPaymentHandler(paymentData: PaymentInput) {
  const result = await handler({ body: JSON.stringify(paymentData) } as unknown as APIGatewayProxyEvent);
  return result;
}

describe('When the user requests to create a payment', () => {
    it('Creates the payment and returns the id of the payment', async () => {
      const paymentData = {
        currency: 'AUD',
        amount: 10
      };
      const mockReturnData = {
        data : { id: randomUUID() }
      };
      const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce(undefined);

      const result = await createPaymentHandler(paymentData);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toStrictEqual(mockReturnData);
      expect(createPaymentMock).toHaveBeenCalledWith(paymentData);
    });

    it('Returns with a HTTP 422 status and validation error if the payment input data is not valid', async () => {
      const paymentData = {
        currency: { code: 'AUD' },
        amount: 'ten dollars'
      };
      const mockReturnData = {
        error : 'Invalid input'
      };
      const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce(undefined);

      // @ts-ignore-next-line
      const result = await createPaymentHandler(paymentData);

      expect(result.statusCode).toBe(422);
      expect(JSON.parse(result.body)).toEqual(mockReturnData);
      expect(createPaymentMock).not.toHaveBeenCalled();
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
