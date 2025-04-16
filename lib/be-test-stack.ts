import * as cdk from 'aws-cdk-lib';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { PAYMENTS_TABLE_NAME } from './constants';

export class BeTestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Dynamo DB table
        const paymentsTable = new Table(this, 'PaymentsTable', {
            tableName: PAYMENTS_TABLE_NAME,
            partitionKey: { name: 'id', type: AttributeType.STRING },
        });

        // API
        const paymentsApi = new RestApi(this, 'ofxPaymentsChallenge', {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
            },
        });
        const paymentsResource = paymentsApi.root.addResource('payments');
        const specificPaymentResource = paymentsResource.addResource('{id}');

        // Functions
        const createPaymentFunction = this.createLambda('createPayment', 'src/createPayment.ts', {
          PAYMENTS_TABLE_NAME
        });
        paymentsTable.grantWriteData(createPaymentFunction);
        paymentsResource.addMethod('POST', new LambdaIntegration(createPaymentFunction));

        const getPaymentFunction = this.createLambda('getPayment', 'src/getPayment.ts', {
          PAYMENTS_TABLE_NAME
        });
        paymentsTable.grantReadData(getPaymentFunction);
        specificPaymentResource.addMethod('GET', new LambdaIntegration(getPaymentFunction));

        const listPaymentsFunction = this.createLambda('listPayments', 'src/listPayments.ts', {
          PAYMENTS_TABLE_NAME
        });
        paymentsTable.grantReadData(listPaymentsFunction);
        paymentsResource.addMethod('GET', new LambdaIntegration(listPaymentsFunction));
    }

    createLambda = (name: string, path: string, env: { [key: string]: string } = {}) => {
        return new NodejsFunction(this, name, {
            functionName: name,
            runtime: Runtime.NODEJS_22_X,
            entry: path,
            environment: env,
        });
    };
}
