import { DocumentClient } from './dynamodb';
import { GetCommand, PutCommand, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import type { Payment, PaymentFilters } from '../models/payments';
import { PAYMENTS_TABLE_NAME } from '../../lib/constants';

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
    const result = await DocumentClient.send(
        new GetCommand({
            TableName: PAYMENTS_TABLE_NAME,
            Key: { id: paymentId },
        })
    );

    return (result.Item as Payment) || null;
};

export const listPayments = async (filters: PaymentFilters): Promise<Payment[]> => {
    let scanOptions: ScanCommandInput = {
        TableName: PAYMENTS_TABLE_NAME
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
            TableName: PAYMENTS_TABLE_NAME,
            Item: payment,
        })
    );
};
