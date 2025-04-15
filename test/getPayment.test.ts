import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/getPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';

async function getPaymentHandler(pathParameters: { id: string }) {
    const result = await handler({ pathParameters } as unknown as APIGatewayProxyEvent);
    return result;
}

describe('When the user requests the records for a specific payment', () => {
    it('Returns the payment matching their input parameter.', async () => {
        const paymentId = randomUUID();
        const mockPayment = {
            id: paymentId,
            currency: 'AUD',
            amount: 2000,
        };
        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(mockPayment);

        const result = await getPaymentHandler({ id: paymentId });

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toStrictEqual(mockPayment);
        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });

    it('Returns with a 404 response if the payment is not found', async () => {
      const paymentId = randomUUID();
      const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(null);
      const mockResponse = {
        error: 'Payment not found',
      };

      const result = await getPaymentHandler({ id: paymentId });

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toStrictEqual(mockResponse);
      expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });

    it('Returns with a HTTP 422 status and validation error if the payment id is not valid', async () => {
      const paymentId = '(^&$*dfgrs--+\n\r@!``!<>';
      const getPaymentMock = jest.spyOn(payments, 'getPayment');
      const mockResponse = {
        error: 'Invalid input',
      };

      const result = await getPaymentHandler({ id: paymentId });

      expect(result.statusCode).toBe(422);
      expect(JSON.parse(result.body)).toStrictEqual(mockResponse);
      expect(getPaymentMock).not.toHaveBeenCalled();
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
