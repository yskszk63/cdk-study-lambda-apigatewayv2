import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ssm from "aws-cdk-lib/aws-ssm";

import { ssmPath } from "./naming.js";

export class SamBaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "vpc", {
      subnetConfiguration: [
        {
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: "private",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    }) as ec2.IVpc; // TODO FIXME

    const sg1 = new ec2.SecurityGroup(this, "sg1", {
      vpc,
    });
    const sg2 = new ec2.SecurityGroup(this, "sg2", {
      vpc,
    });

    new ssm.CfnParameter(this, "params1", {
      type: "StringList",
      value: cdk.Fn.join(",", vpc.publicSubnets.map(v => v.subnetId)),
      name: ssmPath(cdk.Aws.STACK_NAME, "subnetids"),
    });
    new ssm.CfnParameter(this, "params2", {
      type: "StringList",
      value: cdk.Fn.join(",", [sg1.securityGroupId, sg2.securityGroupId]),
      name: ssmPath(cdk.Aws.STACK_NAME, "sgids"),
    });
  }
}
