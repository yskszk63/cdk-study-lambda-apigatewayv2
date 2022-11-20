import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";

import * as iam from "aws-cdk-lib/aws-iam";
import type * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";

type HttpApiProps = cdk.ResourceProps & {
  function: lambda.IFunction;
  authorizer?: lambda.IFunction | undefined;
}

export class HttpApi extends cdk.Resource {
  constructor(scope: Construct, id: string, props: HttpApiProps) {
    super(scope, id, props);

    const tags = cdk.Stack.of(this).tags;

    const name = cdk.Names.uniqueResourceName(this, { });
    const apigw = new apigatewayv2.CfnApi(this, "apigw", {
      protocolType: "HTTP",
      name,
      tags: tags.tagValues(),
    });
    new apigatewayv2.CfnStage(this, "stage", {
      apiId: apigw.attrApiId,
      stageName: "$default",
      autoDeploy: true,
    });
    const integration = new apigatewayv2.CfnIntegration(this, "integration", {
      apiId: apigw.attrApiId,
      integrationType: "AWS_PROXY",
      integrationMethod: "POST",
      integrationUri: props.function.functionArn,
      payloadFormatVersion: "2.0",
    });
    props.function.addPermission("allow-apigw", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com") as iam.IPrincipal,
      sourceArn: `arn:aws:execute-api:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:${apigw.ref}/*/*`,
    });
    const route = new apigatewayv2.CfnRoute(this, "route", {
      apiId: apigw.attrApiId,
      routeKey: "$default",
      target: `integrations/${integration.ref}`,
    });

    if (typeof props.authorizer === "undefined") {
      return;
    }

    const authorizer = new apigatewayv2.CfnAuthorizer(this, "authorizer", {
      apiId: apigw.attrApiId,
      authorizerType: "REQUEST",
      name: cdk.Names.uniqueId(this),
      authorizerPayloadFormatVersion: "2.0",
      enableSimpleResponses: true,
      authorizerUri: `arn:aws:apigateway:${cdk.Aws.REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:${props.authorizer.functionName}/invocations`,
    });
    route.addPropertyOverride("AuthorizationType", "CUSTOM");
    route.addPropertyOverride("AuthorizerId", authorizer.ref);
    props.authorizer.addPermission("allow-authorizer", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com") as iam.IPrincipal,
      sourceArn: `arn:aws:execute-api:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:${apigw.ref}/authorizers/${authorizer.ref}`,
    });
  }
}
