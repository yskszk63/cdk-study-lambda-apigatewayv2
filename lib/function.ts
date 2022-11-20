import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import iam from "aws-cdk-lib/aws-iam";
import ssm from "aws-cdk-lib/aws-ssm";
import lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";

type FunctionProps = cdk.ResourceProps & {
  subnetIdsPath: string;
  securityGroupIdsPath: string;
  entry: string;
  architecture?: lambda.Architecture | undefined;
}

export class Function extends cdk.Resource implements lambda.IFunction {
  fn: lambda.IFunction;
  arn: string;

  constructor(scope: Construct, id: string, props: FunctionProps) {
    super(scope, id, props);

    const subnetids = ssm.StringListParameter.valueForTypedListParameter(this, props.subnetIdsPath);
    const sgids = ssm.StringListParameter.valueForTypedListParameter(this, props.securityGroupIdsPath);

    const fn = new NodejsFunction(this, "function", {
      entry: props.entry,
      runtime: lambda.Runtime.NODEJS_16_X,
      architecture: props.architecture ?? lambda.Architecture.X86_64,
      bundling: {
        target: "esnext",
        format: OutputFormat.ESM,
      },
    });
    const raw = fn.node.defaultChild;
    if (!(raw instanceof lambda.CfnFunction)) {
      throw new Error();
    }
    raw.addOverride("Properties.VpcConfig", {
      SubnetIds: subnetids,
      SecurityGroupIds: sgids,
    });
    if (typeof fn.role === "undefined") {
      throw new Error();
    }
    fn.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"))

    this.fn = fn;
    this.arn = raw.attrArn;

    new cdk.CfnOutput(this, "a", {
      value: fn.functionArn,
    });
    new cdk.CfnOutput(this, "b", {
      value: raw.attrArn,
    });
  }

  get functionName() {
    return this.fn.functionName;
  }

  get functionArn() {
    return this.fn.functionArn;
  }

  get isBoundToVpc() {
    return this.fn.isBoundToVpc;
  }

  get latestVersion() {
    return this.fn.latestVersion;
  }

  get permissionsNode() {
    return this.fn.permissionsNode;
  }

  get architecture() {
    return this.fn.architecture;
  }

  get resourceArnsForGrantInvoke() {
    return this.fn.resourceArnsForGrantInvoke;
  }

  addEventSource(source: cdk.aws_lambda.IEventSource): void {
    return this.fn.addEventSource(source);
  }

  addEventSourceMapping(id: string, options: cdk.aws_lambda.EventSourceMappingOptions): cdk.aws_lambda.EventSourceMapping {
    return this.fn.addEventSourceMapping(id, options);
  }

  addToRolePolicy(statement: cdk.aws_iam.PolicyStatement): void {
    return this.fn.addToRolePolicy(statement);
  }

  grantInvoke(identity: cdk.aws_iam.IGrantable): cdk.aws_iam.Grant {
    return this.fn.grantInvoke(identity);
  }

  grantInvokeUrl(identity: cdk.aws_iam.IGrantable): cdk.aws_iam.Grant {
    return this.fn.grantInvokeUrl(identity);
  }

  metric(metricName: string, props?: cdk.aws_cloudwatch.MetricOptions | undefined): cdk.aws_cloudwatch.Metric {
    return this.fn.metric(metricName, props);
  }

  metricDuration(props?: cdk.aws_cloudwatch.MetricOptions | undefined): cdk.aws_cloudwatch.Metric {
    return this.fn.metricDuration(props);
  }

  metricInvocations(props?: cdk.aws_cloudwatch.MetricOptions | undefined): cdk.aws_cloudwatch.Metric {
    return this.fn.metricInvocations(props);
  }

  metricThrottles(props?: cdk.aws_cloudwatch.MetricOptions | undefined): cdk.aws_cloudwatch.Metric {
    return this.fn.metricThrottles(props)
  }

  configureAsyncInvoke(options: cdk.aws_lambda.EventInvokeConfigOptions): void {
      return this.fn.configureAsyncInvoke(options);
  }

  addFunctionUrl(options?: cdk.aws_lambda.FunctionUrlOptions | undefined): cdk.aws_lambda.FunctionUrl {
      return this.fn.addFunctionUrl(options);
  }

  metricErrors(props?: cdk.aws_cloudwatch.MetricOptions | undefined): cdk.aws_cloudwatch.Metric {
      return this.fn.metricErrors(props);
  }

  get connections() {
    return this.fn.connections;
  }

  addPermission(id: string, permission: lambda.Permission): void {
    return this.fn.addPermission(id, permission);
  }

  get grantPrincipal() {
    return this.fn.grantPrincipal;
  }
}
