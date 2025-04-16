import { DocumentClient } from './dynamodb';
import { GetCommand, PutCommand, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import type { Payment, PaymentFilters } from '../models/payments';

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
    const result = await DocumentClient.send(
        new GetCommand({
            TableName: 'Payments',
            Key: { id: paymentId },
        })
    );

    return (result.Item as Payment) || null;
};

export const listPayments = async (filters: PaymentFilters): Promise<Payment[]> => {
    let scanOptions: ScanCommandInput = {
        TableName: 'Payments'
    };

    if (filters.currency) {
      scanOptions = {
        ...scanOptions,
        FilterExpression: 'currency = :currencyCode',
        ExpressionAttributeValues: {
            ':currencyCode': filters.currency
        }
      }
    }

    const result = await DocumentClient.send(
        new ScanCommand(scanOptions)
    );

    return (result.Items as Payment[]) || [];
};

export const createPayment = async (payment: Payment) => {
    await DocumentClient.send(
        new PutCommand({
            TableName: 'Payments',
            Item: payment,
        })
    );
};
