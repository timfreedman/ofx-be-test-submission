import { APIGatewayProxyResult } from 'aws-lambda';
import type { ApiResponseSuccess, ApiResponseError } from '../models/apiResponse';

export const buildResponse = (statusCode: number, body: ApiResponseSuccess | ApiResponseError): APIGatewayProxyResult => {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    };
};

export const parseInput = (body: string): Object => {
    try {
        return JSON.parse(body);
    } catch (err) {
        console.error(err);
        return {};
    }
};
