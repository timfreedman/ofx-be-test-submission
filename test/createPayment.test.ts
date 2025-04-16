import * as payments from '../src/lib/payments';
import { z } from 'zod';
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
      const mockReturnSchema = z.object({
        data: z.object({
          id: z.string().uuid()
        })
      });
      const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce(undefined);

      const result = await createPaymentHandler(paymentData);
      const resultData = JSON.parse(result.body);

      expect(result.statusCode).toBe(201);
      expect(mockReturnSchema.safeParse(resultData).success).toBe(true);
      expect(createPaymentMock).toHaveBeenCalledWith({ ...paymentData, id: resultData.data.id });
    });

    it('Returns with a HTTP 422 status and validation error if the payment input data is not valid', async () => {
      const paymentData = {
        id: 1234,
        currency: { code: 'AUD' },
        amount: 'ten dollars',
        volume: 10000000,
        paymentTime: Date.now(),
        active: true
      };
      const mockReturnData = {
        error : 'Invalid input'
      };
      const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce(undefined);
      const logMock = jest.spyOn(console, 'error').mockImplementationOnce(() => { });

      // @ts-ignore-next-line, purposely parsing the incorrect input type
      const result = await createPaymentHandler(paymentData);

      expect(result.statusCode).toBe(422);
      expect(JSON.parse(result.body)).toEqual(mockReturnData);
      expect(createPaymentMock).not.toHaveBeenCalled();
      expect(logMock).toHaveBeenCalled();
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
