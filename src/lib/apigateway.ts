import { APIGatewayProxyResult } from 'aws-lambda';

interface ApiResponseSuccess {
  data: Object | Array<Object>;
}

interface ApiResponseError {
  error: string;
}

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
