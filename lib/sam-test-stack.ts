import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import * as lambda from "aws-cdk-lib/aws-lambda";

import { ssmPath } from "./naming.js";
import { Function } from "./function.js";
import { HttpApi } from "./http-api.js";

type SamTestStackProps = cdk.StackProps & {
  baseStackName: string;
}

export class SamTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SamTestStackProps) {
    super(scope, id, props);
    const { baseStackName } = props;

    const fn = new Function(this, "fn", {
      subnetIdsPath: ssmPath(baseStackName, "subnetids"),
      securityGroupIdsPath: ssmPath(baseStackName, "sgids"),
      entry: "app/app.ts",
      architecture: lambda.Architecture.ARM_64,
    });

    const authorizer = new Function(this, "authorizer", {
      subnetIdsPath: ssmPath(baseStackName, "subnetids"),
      securityGroupIdsPath: ssmPath(baseStackName, "sgids"),
      entry: "app/authorizer.ts",
      architecture: lambda.Architecture.ARM_64,
    });

    new HttpApi(this, "http", {
      function: fn,
      authorizer,
    });
  }
}
