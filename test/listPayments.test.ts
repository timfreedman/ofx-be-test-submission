import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/listPayments';
import { APIGatewayProxyEvent } from 'aws-lambda';

type QsParameters = Record<string, string> | null;

async function listPaymentsHandler(qsParameters: QsParameters) {
  const result = await handler({
    queryStringParameters: qsParameters
  } as unknown as APIGatewayProxyEvent);
  return result;
}

describe('When the user requests to retrieve a list of payments', () => {
    it('Returns a list of payments when no filtering is applied', async () => {
      const mockPayments = [{
          id: randomUUID(),
          currency: 'AUD',
          amount: 2000,
      }];
      const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(mockPayments);

      const result = await listPaymentsHandler(null);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toStrictEqual({ data: mockPayments });
      expect(listPaymentsMock).toHaveBeenCalledWith({});
    });

    it('Returns a filtered list of payments by currency', async () => {
      const mockPayments = [{
          id: randomUUID(),
          currency: 'SGD',
          amount: 2000,
      }];
      const paymentQueryStringParameters = {
        currency: 'SGD'
      };
      const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(mockPayments);

      const result = await listPaymentsHandler(paymentQueryStringParameters);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toStrictEqual({ data: mockPayments });
      expect(listPaymentsMock).toHaveBeenCalledWith({ currency: 'SGD' });
    });

    it('Returns a filtered list of payments when a currency code is given with wrong casing', async () => {
      const mockPayments = [{
          id: randomUUID(),
          currency: 'AUD',
          amount: 2000,
      }];
      const paymentQueryStringParameters = {
        currency: 'auD'
      };
      const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(mockPayments);

      const result = await listPaymentsHandler(paymentQueryStringParameters);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toStrictEqual({ data: mockPayments });
      expect(listPaymentsMock).toHaveBeenCalledWith({ currency: 'AUD' });
    });

    it('Returns with a validation error if the payment input data is not valid', async () => {
      const paymentQueryStringParameters = {
        currency: 'AUD',
        country: 'Australia',
        time: Date.now()
      };
      const mockError = {
        error: 'Invalid input'
      };

      const logMock = jest.spyOn(console, 'error').mockImplementationOnce(() => { });

      // @ts-ignore-next-line, avoid ts error on mocked function implementation
      const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockImplementationOnce(() => { });

      // @ts-ignore-next-line, purposely parsing the incorrect input type
      const result = await listPaymentsHandler(paymentQueryStringParameters);

      expect(result.statusCode).toBe(422);
      expect(JSON.parse(result.body)).toStrictEqual(mockError);
      expect(listPaymentsMock).not.toHaveBeenCalled();
      expect(logMock).toHaveBeenCalled();
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
